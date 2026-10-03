"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { conferirDisponibilidade, criarAluno } from "@/lib/api";
import { login } from "@/lib/auth";
import { ErroDaApi } from "@/lib/http";
import { formatarCpf, formatarTelefone } from "@/lib/format";
import { buscarEnderecoPorCep, formatarCep, UFS } from "@/lib/endereco";
import { destinoAposLogin, lerDestinoAposLogin, rotaComDestino } from "@/lib/redirecionamento";
import { VERSAO_DOS_TERMOS } from "@/lib/termos";
import VerificarCelular from "./VerificarCelular";

// Campos do passo 1; um erro da API em algum deles leva o usuário de volta para lá.
const CAMPOS_PASSO_1 = ["nome", "email", "senha", "cpf", "telefone"];

// Recusas da API por dado já cadastrado ou inválido no passo 1: voltam o aluno para lá com uma mensagem clara.
// A API só confere duplicidade ao criar a conta (fim do passo 2); CPF_JA_CADASTRADO ainda não existe no backend.
const ERROS_DO_PASSO_1: Record<string, string> = {
  EMAIL_JA_CADASTRADO: "Já existe uma conta com este e-mail. Se for sua, entre ou use “Esqueci minha senha”.",
  CPF_JA_CADASTRADO: "Já existe uma conta com este CPF. Se for sua, entre ou use “Esqueci minha senha”.",
  TELEFONE_JA_CADASTRADO: "Este telefone já está em uso em outra conta. Informe outro número.",
  CPF_INVALIDO: "CPF inválido. Confira os números digitados.",
};

function emailValido(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function cpfValido(cpf: string) {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const digito = (tamanho: number) => {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(d[i]) * (tamanho + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10]);
}

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function CadastroPage() {
  const router = useRouter();
  const [passo, setPasso] = useState(1);
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [pais, setPais] = useState("Brasil");
  const [cep, setCep] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepErro, setCepErro] = useState(false);
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [verificandoDados, setVerificandoDados] = useState(false);
  // Mostra "Entrar" / "Esqueci minha senha" quando o e-mail ou o CPF já têm conta.
  const [mostrarLinksDaConta, setMostrarLinksDaConta] = useState(false);

  async function handleCepChange(valor: string) {
    const formatado = formatarCep(valor);
    setCep(formatado);
    setCepErro(false);

    const digitos = formatado.replace(/\D/g, "");
    if (digitos.length !== 8) return;

    setBuscandoCep(true);
    try {
      const achado = await buscarEnderecoPorCep(digitos);
      if (!achado) {
        setCepErro(true);
      } else {
        setEndereco(achado.rua);
        setBairro(achado.bairro);
        setCidade(achado.cidade);
        setEstado(achado.estado);
      }
    } catch {
      setCepErro(true);
    } finally {
      setBuscandoCep(false);
    }
  }

  async function irParaEndereco() {
    setMostrarLinksDaConta(false);
    if (!nome.trim() || !sobrenome.trim() || !cpf || !telefone || !email || !senha) {
      setErro("Preencha todos os campos para continuar.");
      return;
    }
    if (!cpfValido(cpf)) {
      setErro("CPF inválido. Confira os números digitados.");
      return;
    }
    if (telefone.replace(/\D/g, "").length < 10) {
      setErro("Telefone incompleto. Inclua o DDD.");
      return;
    }
    if (!emailValido(email)) {
      setErro("E-mail inválido.");
      return;
    }
    if (senha.length < 8 || senha.length > 72) {
      setErro("A senha deve ter entre 8 e 72 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }
    setErro("");

    // Confere duplicidade antes de pedir o endereço. Se a consulta falhar, segue: a criação da conta confere de novo.
    setVerificandoDados(true);
    try {
      const disponivel = await conferirDisponibilidade({ email: email.trim(), telefone, cpf });
      const contaExistente = [!disponivel.emailDisponivel && "e-mail", disponivel.cpfDisponivel === false && "CPF"].filter(
        (c): c is string => !!c,
      );
      const avisos = [];
      if (contaExistente.length) {
        avisos.push(
          `Já existe uma conta com este ${contaExistente.join(" e este ")}. Se for sua, entre ou use “Esqueci minha senha”.`,
        );
      }
      if (!disponivel.telefoneDisponivel) {
        avisos.push(
          contaExistente.length
            ? "O telefone também já está em uso em outra conta."
            : ERROS_DO_PASSO_1.TELEFONE_JA_CADASTRADO,
        );
      }
      if (avisos.length) {
        setErro(avisos.join(" "));
        setMostrarLinksDaConta(contaExistente.length > 0);
        return;
      }
    } catch (e) {
      if (e instanceof ErroDaApi && e.status === 400) {
        const mensagens = e.erros.map((c) => capitalizar(c.mensagem));
        setErro(mensagens.length ? mensagens.join(". ") + "." : e.message);
        return;
      }
    } finally {
      setVerificandoDados(false);
    }
    setPasso(2);
  }

  async function criarConta() {
    if (!cep || !endereco || !numero || !bairro || !cidade || !estado) {
      setErro("Preencha todos os campos para continuar.");
      return;
    }
    if (cep.replace(/\D/g, "").length !== 8) {
      setErro("CEP incompleto.");
      return;
    }
    if (!aceitouTermos) {
      setErro("Para criar a conta, aceite os Termos de uso e a Política de privacidade.");
      return;
    }
    setErro("");
    setCarregando(true);
    try {
      await criarAluno({
        nome: `${nome} ${sobrenome}`.trim(),
        email: email.trim(),
        senha,
        cpf,
        telefone,
        cep,
        rua: endereco,
        numero: Number(numero),
        bairro,
        cidade,
        estado,
        pais,
        complemento: complemento || undefined,
        // Só chega aqui com a caixa de aceite marcada.
        aceiteTermos: true,
        versaoDosTermos: VERSAO_DOS_TERMOS,
      });
    } catch (e) {
      if (e instanceof ErroDaApi && e.codigo && ERROS_DO_PASSO_1[e.codigo]) {
        setErro(ERROS_DO_PASSO_1[e.codigo]);
        setMostrarLinksDaConta(e.codigo === "EMAIL_JA_CADASTRADO" || e.codigo === "CPF_JA_CADASTRADO");
        setPasso(1);
      } else if (e instanceof ErroDaApi) {
        const mensagens = e.erros.map((c) => capitalizar(c.mensagem));
        setErro(mensagens.length ? mensagens.join(". ") + "." : e.message);
        if (e.erros.some((c) => CAMPOS_PASSO_1.includes(c.campo))) setPasso(1);
      } else {
        setErro("Não foi possível conectar. Verifique sua internet e tente novamente.");
      }
      setCarregando(false);
      return;
    }

    try {
      await login(email, senha);
      // A conta só é liberada depois de confirmar o celular (passo 3).
      setPasso(3);
    } catch {
      // Conta já foi criada; só o login automático falhou.
      router.push(rotaComDestino("/entrar", lerDestinoAposLogin()));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-navy-deep px-6 py-12">
      <div className="w-full max-w-[560px] border border-t-[3px] border-dark border-t-blue bg-navy-mid px-10 py-11">
        <div className="mb-1.5 flex items-start justify-between gap-3">
          <h2 className="font-display text-[26px] font-bold uppercase text-offwhite">
            Criar conta
          </h2>
          <span className="font-display mt-1.5 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.1em] text-steel-light">
            Passo {passo} de 3
          </span>
        </div>
        {passo < 3 && (
          <p className="mb-6 text-sm text-steel-light">
            Cadastre-se para acessar seus materiais, turmas e eventos.
          </p>
        )}

        {passo === 1 && (
        <div>
          <span className="eyebrow">Dados pessoais</span>
          <div className="mt-4 grid grid-cols-2 gap-3.5">
            <Field required label="Nome" placeholder="Seu nome" value={nome} onChange={setNome} />
            <Field required label="Sobrenome" placeholder="Seu sobrenome" value={sobrenome} onChange={setSobrenome} />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <Field required label="CPF" placeholder="000.000.000-00" value={cpf} onChange={setCpf} mask={formatarCpf} maxLength={14} />
            <Field required label="Telefone" placeholder="(75) 99999-0000" value={telefone} onChange={setTelefone} mask={formatarTelefone} maxLength={15} />
          </div>

          <Field required type="email" label="E-mail" placeholder="seu@email.com" value={email} onChange={setEmail} />

          <div className="grid grid-cols-2 gap-3.5">
            <Field required type="password" label="Senha" placeholder="••••••••" value={senha} onChange={setSenha} />
            <Field
              required
              type="password"
              label="Confirmar senha"
              placeholder="••••••••"
              value={confirmarSenha}
              onChange={setConfirmarSenha}
            />
          </div>

          {erro && (
            <div role="alert" className="mb-3.5 border border-[#9B3535]/50 bg-[#9B3535]/15 px-3.5 py-2.5 text-[13px] text-[#E08A8A]">
              {erro}
              {mostrarLinksDaConta && (
                <div className="mt-2 flex gap-4">
                  <Link
                    href="/entrar"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(rotaComDestino("/entrar", lerDestinoAposLogin()));
                    }}
                    className="font-semibold text-offwhite underline underline-offset-4 hover:text-blue"
                  >
                    Entrar
                  </Link>
                  <Link href="/esqueci-senha" className="font-semibold text-offwhite underline underline-offset-4 hover:text-blue">
                    Esqueci minha senha
                  </Link>
                </div>
              )}
            </div>
          )}

          <button onClick={irParaEndereco} disabled={verificandoDados} className="btn btn-blue mt-2 block w-full disabled:opacity-60">
            {verificandoDados ? "Verificando..." : "Continuar"}
          </button>
        </div>
        )}

        {passo === 2 && (
        <div>
          <span className="eyebrow">Endereço</span>

          <div className="mb-4 mt-4">
            <label className="font-display mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-steel-light">
              País<span className="text-[#E08A8A]"> *</span>
            </label>
            <select
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              className="w-full border border-dark bg-navy-deep px-3.5 py-3 text-[15px] text-offwhite outline-none transition-colors focus:border-blue"
            >
              <option>Brasil</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="font-display mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-steel-light">
              CEP<span className="text-[#E08A8A]"> *</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={cep}
              onChange={(e) => handleCepChange(e.target.value)}
              placeholder="44002-022"
              maxLength={9}
              className="w-full border border-dark bg-navy-deep px-3.5 py-3 text-[15px] text-offwhite outline-none transition-colors placeholder:text-[#4A5768] focus:border-blue"
            />
            {buscandoCep && <p className="mt-1.5 text-xs text-steel-light">Buscando endereço...</p>}
            {cepErro && <p className="mt-1.5 text-xs text-[#E08A8A]">CEP não encontrado — preencha manualmente.</p>}
          </div>

          <Field
            required
            label="Endereço"
            placeholder="Nome da rua"
            value={endereco}
            onChange={setEndereco}
          />

          <Field
            required
            label="Número da casa"
            placeholder="Só números"
            value={numero}
            onChange={setNumero}
            mask={(v) => v.replace(/\D/g, "").slice(0, 6)}
          />

          <Field required label="Bairro" placeholder="Seu bairro" value={bairro} onChange={setBairro} />

          <div className="grid grid-cols-2 gap-3.5">
            <Field required label="Cidade" placeholder="Sua cidade" value={cidade} onChange={setCidade} />
            <div className="mb-4">
              <label className="font-display mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-steel-light">
                Estado<span className="text-[#E08A8A]"> *</span>
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full border border-dark bg-navy-deep px-3.5 py-3 text-[15px] text-offwhite outline-none transition-colors focus:border-blue"
              >
                <option value="">UF</option>
                {UFS.map((uf) => (
                  <option key={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>

          <Field label="Complemento" placeholder="Apto, bloco, referência (opcional)" value={complemento} onChange={setComplemento} />

          <label className="mb-4 flex cursor-pointer items-start gap-2.5 text-[13px] leading-relaxed text-steel-light">
            <input
              type="checkbox"
              checked={aceitouTermos}
              onChange={(e) => setAceitouTermos(e.target.checked)}
              className="mt-1 h-4 w-4 flex-shrink-0 accent-blue"
            />
            <span>
              Li e aceito os{" "}
              <Link href="/termos" target="_blank" className="text-blue underline underline-offset-2 hover:text-blue-dark">
                Termos de uso
              </Link>{" "}
              e a{" "}
              <Link href="/privacidade" target="_blank" className="text-blue underline underline-offset-2 hover:text-blue-dark">
                Política de privacidade
              </Link>
              .
            </span>
          </label>

          {erro && (
            <div className="mb-3.5 border border-[#9B3535]/50 bg-[#9B3535]/15 px-3.5 py-2.5 text-[13px] text-[#E08A8A]">
              {erro}
            </div>
          )}

          <div className="mt-2 flex gap-3">
            <button onClick={() => setPasso(1)} type="button" disabled={carregando} className="btn btn-outline flex-1 disabled:opacity-60">
              Voltar
            </button>
            <button onClick={criarConta} disabled={carregando} className="btn btn-blue flex-1 disabled:opacity-60">
              {carregando ? "Criando conta..." : "Criar conta"}
            </button>
          </div>
        </div>
        )}

        {passo === 3 && <VerificarCelular telefoneInicial={telefone} onConcluir={() => router.push(destinoAposLogin())} />}

        {passo < 3 && (
          <div className="mt-4 text-center text-[13px]">
            <span className="text-steel-light">Já tem uma conta? </span>
            <Link
              href="/entrar"
              onClick={(e) => {
                e.preventDefault();
                router.push(rotaComDestino("/entrar", lerDestinoAposLogin()));
              }}
              className="focus-ring cursor-pointer text-blue transition-colors hover:text-blue-dark"
            >
              Entrar
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
  mask,
  maxLength,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  mask?: (v: string) => string;
  maxLength?: number;
}) {
  const [visivel, setVisivel] = useState(false);
  const isSenha = type === "password";

  return (
    <div className="mb-4">
      <label className="font-display mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-steel-light">
        {label}
        {required && <span className="text-[#E08A8A]"> *</span>}
      </label>
      <div className="relative">
        <input
          type={isSenha && visivel ? "text" : type}
          inputMode={mask ? "numeric" : undefined}
          value={value}
          onChange={(e) => onChange(mask ? mask(e.target.value) : e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full border border-dark bg-navy-deep px-3.5 py-3 text-[15px] text-offwhite outline-none transition-colors placeholder:text-[#4A5768] focus:border-blue ${
            isSenha ? "pr-11" : ""
          }`}
        />
        {isSenha && (
          <button
            type="button"
            onClick={() => setVisivel((v) => !v)}
            aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
            className="focus-ring absolute inset-y-0 right-0 flex items-center px-3 text-steel-light transition-colors hover:text-blue"
          >
            {visivel ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1.5 9S4.5 3.5 9 3.5c1.5 0 2.8.4 3.9 1.1M16.5 9S13.5 14.5 9 14.5c-1.5 0-2.8-.4-3.9-1.1" />
                <path d="M2 2l14 14" />
                <path d="M7.3 7.3a2.5 2.5 0 0 0 3.4 3.4" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 9s3-5.5 8-5.5 8 5.5 8 5.5-3 5.5-8 5.5-8-5.5-8-5.5z" />
                <circle cx="9" cy="9" r="2.5" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
