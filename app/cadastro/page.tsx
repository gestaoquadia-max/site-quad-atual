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
import AbasDeAcesso, { LinkDeAcesso } from "@/components/acesso/AbasDeAcesso";
import { AvisoDeErro, BotaoPrincipal, Campo, Seletor, TituloDoFormulario } from "@/components/acesso/Campos";
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

  const linksDaConta = mostrarLinksDaConta && (
    <span className="mt-2 flex gap-4">
      <LinkDeAcesso para="/entrar" className="font-semibold text-[#9B1C1C] underline underline-offset-4 hover:text-tinta">
        Entrar
      </LinkDeAcesso>
      <Link href="/esqueci-senha" className="font-semibold text-[#9B1C1C] underline underline-offset-4 hover:text-tinta">
        Esqueci minha senha
      </Link>
    </span>
  );

  return (
    <>
      {passo < 3 && <AbasDeAcesso atual="/cadastro" />}
      <div className="flex flex-col gap-4">
        <TituloDoFormulario
          titulo={passo === 3 ? "Confirme seu celular" : "Criar conta"}
          subtitulo={passo < 3 ? "Cadastre-se para acessar seus materiais, turmas e eventos." : undefined}
          extra={<span className="mt-2 flex-none whitespace-nowrap text-xs font-bold uppercase tracking-[0.1em] text-ardosia">Passo {passo} de 3</span>}
        />
        <div aria-hidden="true" className="grid grid-cols-3 gap-1.5">
          {[1, 2, 3].map((n) => (
            <span key={n} className={`h-1 rounded ${n <= passo ? "bg-azul" : "bg-[#D3DCE7]"}`} />
          ))}
        </div>

        {passo === 1 && (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              irParaEndereco();
            }}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-3.5">
              <Campo obrigatorio rotulo="Nome" placeholder="Seu nome" autoComplete="given-name" valor={nome} aoMudar={setNome} />
              <Campo obrigatorio rotulo="Sobrenome" placeholder="Seu sobrenome" autoComplete="family-name" valor={sobrenome} aoMudar={setSobrenome} />
              <Campo obrigatorio rotulo="CPF" placeholder="000.000.000-00" autoComplete="off" valor={cpf} aoMudar={setCpf} mascara={formatarCpf} maxLength={14} />
              <Campo obrigatorio rotulo="Telefone" tipo="tel" placeholder="(75) 99999-0000" autoComplete="tel" valor={telefone} aoMudar={setTelefone} mascara={formatarTelefone} maxLength={15} />
              <Campo obrigatorio rotulo="E-mail" tipo="email" placeholder="seu@email.com" autoComplete="email" valor={email} aoMudar={setEmail} className="col-span-full" />
              <Campo obrigatorio rotulo="Senha" tipo="password" placeholder="Entre 8 e 72 caracteres" autoComplete="new-password" valor={senha} aoMudar={setSenha} />
              <Campo obrigatorio rotulo="Confirmar senha" tipo="password" placeholder="Repita a senha" autoComplete="new-password" valor={confirmarSenha} aoMudar={setConfirmarSenha} />
            </div>
            {erro && (
              <AvisoDeErro>
                {erro}
                {linksDaConta}
              </AvisoDeErro>
            )}
            <BotaoPrincipal type="submit" carregando={verificandoDados} textoCarregando="Verificando…" className="mt-1.5">
              Continuar
            </BotaoPrincipal>
          </form>
        )}

        {passo === 2 && (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              criarConta();
            }}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-3.5">
              <Seletor obrigatorio rotulo="País" valor={pais} aoMudar={setPais}>
                <option>Brasil</option>
              </Seletor>
              <div>
                <Campo obrigatorio rotulo="CEP" placeholder="44002-022" autoComplete="postal-code" valor={cep} aoMudar={handleCepChange} maxLength={9} inputMode="numeric" />
                {buscandoCep && <p className="mt-1.5 text-xs text-ardosia">Buscando endereço…</p>}
                {cepErro && <p className="mt-1.5 text-xs text-[#9B1C1C]">CEP não encontrado — preencha manualmente.</p>}
              </div>
              <Campo obrigatorio rotulo="Endereço" placeholder="Nome da rua" autoComplete="address-line1" valor={endereco} aoMudar={setEndereco} className="col-span-full" />
              <Campo obrigatorio rotulo="Número" placeholder="Só números" valor={numero} aoMudar={setNumero} mascara={(v) => v.replace(/\D/g, "").slice(0, 6)} />
              <Campo obrigatorio rotulo="Bairro" placeholder="Seu bairro" valor={bairro} aoMudar={setBairro} />
              <Campo obrigatorio rotulo="Cidade" placeholder="Sua cidade" autoComplete="address-level2" valor={cidade} aoMudar={setCidade} />
              <Seletor obrigatorio rotulo="Estado" valor={estado} aoMudar={setEstado}>
                <option value="">UF</option>
                {UFS.map((uf) => (
                  <option key={uf}>{uf}</option>
                ))}
              </Seletor>
              <Campo rotulo="Complemento" placeholder="Apto, bloco, referência (opcional)" valor={complemento} aoMudar={setComplemento} className="col-span-full" />
            </div>
            <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-[1.55] text-ardosia-escura">
              <input
                type="checkbox"
                checked={aceitouTermos}
                onChange={(e) => setAceitouTermos(e.target.checked)}
                className="mt-[3px] h-[18px] w-[18px] flex-shrink-0 accent-azul"
              />
              <span>
                Li e aceito os{" "}
                <Link href="/termos" target="_blank" className="font-semibold text-azul-forte underline underline-offset-2">
                  Termos de uso
                </Link>{" "}
                e a{" "}
                <Link href="/privacidade" target="_blank" className="font-semibold text-azul-forte underline underline-offset-2">
                  Política de privacidade
                </Link>
                .
              </span>
            </label>
            {erro && <AvisoDeErro>{erro}</AvisoDeErro>}
            <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3">
              <button type="button" onClick={() => setPasso(1)} disabled={carregando} className="btn-q btn-q-contorno h-[54px] text-base disabled:opacity-60">
                Voltar
              </button>
              <BotaoPrincipal type="submit" carregando={carregando} textoCarregando="Criando conta…">
                Criar conta
              </BotaoPrincipal>
            </div>
          </form>
        )}

        {passo === 3 && <VerificarCelular telefoneInicial={telefone} onConcluir={() => router.push(destinoAposLogin())} />}

        {passo < 3 && (
          <p className="text-center text-sm text-ardosia">
            Já tem uma conta?{" "}
            <LinkDeAcesso para="/entrar" className="font-semibold text-azul-forte hover:text-azul">
              Entrar
            </LinkDeAcesso>
          </p>
        )}
      </div>
    </>
  );
}
