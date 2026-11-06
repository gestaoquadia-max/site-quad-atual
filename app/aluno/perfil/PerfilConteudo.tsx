"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ListaErro } from "@/components/EstadoLista";
import { CampoDoCodigo } from "@/components/acesso/VerificarCelular";
import {
  alterarSenha,
  atualizarCadastro,
  atualizarEndereco,
  atualizarMeuNome,
  buscarEnderecoDoUsuario,
  buscarExclusaoDaConta,
  cancelarExclusaoDaConta,
  confirmarCodigoDoCelular,
  enviarCodigoPara,
  pedirExclusaoDaConta,
  reenviarConfirmacaoDeEmail,
  type Endereco,
  type ExclusaoDaConta,
} from "@/lib/api";
import { institucional, linkDoWhatsApp } from "@/lib/institucional";
import { buscarEnderecoPorCep, formatarCep, UFS } from "@/lib/endereco";
import { formatarCpf, formatarTelefone } from "@/lib/format";
import { ErroDaApi } from "@/lib/http";
import {
  useCarregandoUsuario,
  useRecarregarUsuario,
  useUsuarioAtual,
  type UsuarioAtual,
} from "@/lib/usuario";

const classeLabel = "mb-[7px] block text-[13.5px] font-semibold text-tinta";
const classeInput =
  "mb-4 h-12 w-full rounded-[10px] border border-linha-forte bg-superficie px-3.5 text-[15px] text-tinta outline-none transition-[border-color,box-shadow] focus:border-azul focus:shadow-[0_0_0_4px_rgba(0,107,255,0.15)] disabled:cursor-not-allowed disabled:bg-nevoa disabled:text-ardosia";
const classeBotao = "btn-q btn-q-azul mt-2 h-12 w-full text-[15px] disabled:cursor-not-allowed disabled:opacity-60";
const classeBotaoContorno =
  "inline-flex h-12 items-center justify-center whitespace-nowrap rounded-[10px] border border-linha-forte bg-superficie px-4 font-display text-sm font-bold text-tinta transition-colors hover:border-azul hover:text-azul-ceu disabled:cursor-not-allowed disabled:opacity-60";

function mensagemDoErro(e: unknown) {
  if (e instanceof ErroDaApi) {
    const campos = e.erros.map((c) => c.mensagem.charAt(0).toUpperCase() + c.mensagem.slice(1));
    return campos.length ? campos.join(". ") + "." : e.message;
  }
  return "Não foi possível conectar. Verifique sua internet e tente novamente.";
}

export default function PerfilConteudo() {
  const usuario = useUsuarioAtual();
  const carregando = useCarregandoUsuario();
  const recarregar = useRecarregarUsuario();

  if (carregando) return <CartoesCarregando quantidade={3} />;
  if (!usuario) {
    return <ListaErro mensagem="Não foi possível carregar seus dados agora." onTentarNovamente={recarregar} />;
  }

  const emailPendente = usuario.emailVerificado === false;
  const celularPendente = usuario.telefoneVerificado === false;

  return (
    <div className="flex flex-col gap-5">
      {/* Verificações que faltam: no topo da página, antes dos cartões. */}
      {(emailPendente || celularPendente) && (
        <div className="grid gap-3 md:grid-cols-2">
          {celularPendente && <AlertaCelularNaoVerificado />}
          {emailPendente && <AlertaEmailNaoVerificado />}
        </div>
      )}
      {/* Sem items-start: os cartões de uma mesma linha ficam da mesma altura. */}
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Chaveado pelo id (e não pelo nome) para o aviso de "salvo" não sumir quando os dados recarregam. */}
        <DadosPessoais key={usuario.id} usuario={usuario} onSalvo={recarregar} />
        <EnderecoDoAluno usuarioId={usuario.id} />
        <TrocarSenha usuarioId={usuario.id} />
        <CopiaEExclusao />
      </div>
    </div>
  );
}

function CartoesCarregando({ quantidade }: { quantidade: number }) {
  return (
    <div role="status" aria-label="Carregando" className="grid gap-5 xl:grid-cols-2">
      {Array.from({ length: quantidade }, (_, i) => (
        <CartaoCarregando key={i} />
      ))}
    </div>
  );
}

function CartaoCarregando() {
  return (
    <div className="animate-pulse rounded-[18px] border border-linha bg-superficie shadow-cartao p-7">
      {[0, 1, 2].map((j) => (
        <div key={j} className="mb-5">
          <div className="mb-2 h-3 w-24 rounded bg-nevoa" />
          <div className="h-12 rounded-[10px] bg-nevoa-clara" />
        </div>
      ))}
    </div>
  );
}

function Aviso({ tipo, children }: { tipo: "sucesso" | "erro" | "info"; children: React.ReactNode }) {
  const cores = {
    sucesso: "border-[rgba(95,211,154,0.38)] bg-[rgba(34,197,94,0.14)] text-[#5FD39A]",
    erro: "border-[rgba(248,113,113,0.38)] bg-[rgba(220,38,38,0.14)] text-[#FF9C9C]",
    info: "border-linha bg-nevoa text-ardosia-escura",
  };
  return (
    <div role={tipo === "erro" ? "alert" : "status"} className={`mb-4 rounded-[10px] border px-3.5 py-2.5 text-[13.5px] leading-[1.5] ${cores[tipo]}`}>
      {children}
    </div>
  );
}

function Cartao({ eyebrow, titulo, children }: { eyebrow: string; titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[18px] border border-linha bg-superficie p-[clamp(20px,2.4vw,28px)] shadow-cartao">
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-azul-ceu">{eyebrow}</span>
      <h2 className="mb-5 mt-1.5 font-display text-[22px] font-extrabold tracking-[-0.02em]">{titulo}</h2>
      {children}
    </section>
  );
}

function DadosPessoais({ usuario, onSalvo }: { usuario: UsuarioAtual; onSalvo: () => void }) {
  const [nome, setNome] = useState(usuario.nome);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [salvo, setSalvo] = useState(false);
  const [mostrarTrocaTelefone, setMostrarTrocaTelefone] = useState(false);
  const bloqueado = !usuario.podeEditarCadastro;

  async function salvar() {
    setSalvo(false);
    if (nome.trim().length < 2) return setErro("Informe seu nome completo.");
    setErro("");
    setSalvando(true);
    try {
      // Só o nome: trocar o telefone exige verificação por código.
      if (usuario.aluno) await atualizarMeuNome(nome.trim());
      else await atualizarCadastro(usuario.id, { nome: nome.trim(), telefone: usuario.telefone ?? "" });
      setSalvo(true);
      onSalvo();
    } catch (e) {
      setErro(mensagemDoErro(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Cartao eyebrow="Cadastro" titulo="Seus dados">
      {!usuario.dadosDaContaDisponiveis ? (
        <Aviso tipo="info">
          Não foi possível carregar todos os seus dados agora. Tente novamente em alguns minutos.
        </Aviso>
      ) : (
        bloqueado && <Aviso tipo="info">A edição do nome não está disponível agora.</Aviso>
      )}

      <label className={classeLabel} htmlFor="perfil-nome">
        Nome completo
      </label>
      <input
        id="perfil-nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        disabled={bloqueado || salvando}
        className={classeInput}
      />

      <label className={classeLabel} htmlFor="perfil-email">
        E-mail
        {usuario.emailVerificado && <SeloConfirmado />}
      </label>
      <input
        id="perfil-email"
        value={usuario.email ?? "—"}
        disabled
        className={classeInput}
      />

      <label className={classeLabel} htmlFor="perfil-cpf">
        CPF
      </label>
      <input id="perfil-cpf" value={usuario.cpf ? formatarCpf(usuario.cpf) : "—"} disabled className={classeInput} />

      <label className={classeLabel} htmlFor="perfil-telefone">
        Telefone
        {usuario.telefoneVerificado && <SeloConfirmado />}
      </label>
      <div className="mb-4 flex gap-2">
        <input
          id="perfil-telefone"
          value={usuario.telefone ? formatarTelefone(usuario.telefone) : "—"}
          disabled
          className={`${classeInput} mb-0`}
        />
        <button
          type="button"
          onClick={() => setMostrarTrocaTelefone((v) => !v)}
          disabled={bloqueado}
          className={classeBotaoContorno}
        >
          Alterar
        </button>
      </div>
      {mostrarTrocaTelefone && (
        <TrocaDeTelefone telefoneAtual={usuario.telefone} atualJaConfirmado={usuario.telefoneVerificado === true} onTrocado={onSalvo} />
      )}

      {erro && <Aviso tipo="erro">{erro}</Aviso>}
      {salvo && <Aviso tipo="sucesso">Dados atualizados.</Aviso>}

      <button type="button" onClick={salvar} disabled={bloqueado || salvando} className={classeBotao}>
        {salvando ? "Salvando..." : "Salvar alterações"}
      </button>
      <p className="mt-3 text-center text-[13px] text-ardosia">CPF e e-mail não podem ser alterados por aqui.</p>
    </Cartao>
  );
}

function SeloConfirmado() {
  return (
    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[rgba(34,197,94,0.14)] px-2 py-0.5 align-middle text-[11.5px] font-bold text-[#5FD39A]">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
      Confirmado
    </span>
  );
}

function AlertaCelularNaoVerificado() {
  return (
    <div role="alert" className="rounded-[12px] border border-[rgba(245,158,11,0.38)] bg-[rgba(245,158,11,0.14)] px-4 py-3.5 text-[13.5px] text-[#F5C46A]">
      <p className="mb-2 font-semibold">Seu celular ainda não foi confirmado.</p>
      <p className="mb-2.5 leading-relaxed">Confirme com o código que enviamos por SMS para liberar todos os recursos da sua conta.</p>
      <Link href="/confirmar-celular?redirect=%2Faluno%2Fperfil" className="font-semibold underline underline-offset-4">
        Confirmar agora
      </Link>
    </div>
  );
}

function AlertaEmailNaoVerificado() {
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

  async function reenviar() {
    setEnviando(true);
    setResultado(null);
    try {
      await reenviarConfirmacaoDeEmail();
      setResultado({ tipo: "sucesso", texto: "Enviamos um novo link de confirmação para o seu e-mail." });
    } catch (e) {
      setResultado({ tipo: "erro", texto: mensagemDoErro(e) });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div role="alert" className="rounded-[12px] border border-[rgba(245,158,11,0.38)] bg-[rgba(245,158,11,0.14)] px-4 py-3.5 text-[13.5px] text-[#F5C46A]">
      <p className="mb-2 font-semibold">Seu e-mail ainda não foi verificado.</p>
      <p className="mb-2.5 leading-relaxed">
        Abra o link que enviamos para a sua caixa de entrada para confirmar. Confira também o spam.
      </p>
      <button
        type="button"
        onClick={reenviar}
        disabled={enviando}
        className="font-semibold underline underline-offset-4 disabled:opacity-60"
      >
        {enviando ? "Enviando..." : "Reenviar e-mail de confirmação"}
      </button>
      {resultado && (
        <p className={`mt-2 ${resultado.tipo === "erro" ? "text-[#FF9C9C]" : "text-[#5FD39A]"}`}>{resultado.texto}</p>
      )}
    </div>
  );
}

// Regra da API (29/10/2026): o aluno só troca o número que AINDA NÃO verificou (PUT /auth/telefone); o verificado,
// só a coordenação. Ordem: o número novo é gravado, o código vai para ele e a confirmação o marca como verificado.
function TrocaDeTelefone({
  telefoneAtual,
  atualJaConfirmado,
  onTrocado,
}: {
  telefoneAtual: string | null;
  atualJaConfirmado: boolean;
  onTrocado: () => void;
}) {
  if (atualJaConfirmado) {
    return (
      <div className="mb-4 rounded-xl border border-linha bg-nevoa p-4 text-[13.5px] leading-relaxed text-ardosia-escura">
        Seu telefone já está confirmado. Para trocar por outro número, fale com a coordenação pelo{" "}
        <a href={linkDoWhatsApp(institucional.whatsapp)} target="_blank" rel="noopener noreferrer" className="font-semibold text-azul-ceu underline underline-offset-4">
          WhatsApp
        </a>
        .
      </div>
    );
  }
  return <TrocaDeTelefoneNaoVerificado telefoneAtual={telefoneAtual} onTrocado={onTrocado} />;
}

function TrocaDeTelefoneNaoVerificado({ telefoneAtual, onTrocado }: { telefoneAtual: string | null; onTrocado: () => void }) {
  // O número que a conta tem na API agora: muda assim que o novo é gravado, antes do código.
  const [telefoneDaConta, setTelefoneDaConta] = useState(telefoneAtual);
  const [novoTelefone, setNovoTelefone] = useState("");
  const [codigoEnviadoPara, setCodigoEnviadoPara] = useState<string | null>(null);
  const [codigo, setCodigo] = useState("");
  const [reenviarEm, setReenviarEm] = useState(0);
  const [agora, setAgora] = useState(() => Date.now());
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [indisponivel, setIndisponivel] = useState(false);
  const [trocadoPara, setTrocadoPara] = useState<string | null>(null);
  const digitos = novoTelefone.replace(/\D/g, "");

  // Contagem regressiva do "Reenviar código".
  useEffect(() => {
    if (!reenviarEm) return;
    const id = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(id);
  }, [reenviarEm]);
  const segundosParaReenviar = Math.max(0, Math.ceil((reenviarEm - agora) / 1000));

  function tratarErro(e: unknown) {
    if (e instanceof ErroDaApi && e.codigo === "INDISPONIVEL") return setIndisponivel(true);
    setErro(mensagemDoErro(e));
  }

  async function enviarCodigo() {
    if (digitos.length < 10) return setErro("Telefone incompleto. Inclua o DDD.");
    setErro("");
    setCarregando(true);
    try {
      const envio = await enviarCodigoPara(novoTelefone, telefoneDaConta);
      setTelefoneDaConta(novoTelefone);
      setReenviarEm(Date.now() + (envio.reenvioEmSegundos > 0 ? envio.reenvioEmSegundos : 60) * 1000);
      setAgora(Date.now());
      setCodigoEnviadoPara(novoTelefone);
      setCodigo("");
    } catch (e) {
      tratarErro(e);
    } finally {
      setCarregando(false);
    }
  }

  async function confirmar() {
    if (codigo.length !== 6) return setErro("Digite os 6 números do código.");
    setErro("");
    setCarregando(true);
    try {
      await confirmarCodigoDoCelular(codigo);
      setTrocadoPara(codigoEnviadoPara);
      onTrocado();
    } catch (e) {
      tratarErro(e);
    } finally {
      setCarregando(false);
    }
  }

  if (trocadoPara) {
    return (
      <Aviso tipo="sucesso">
        Celular confirmado. O seu telefone agora é <strong>{trocadoPara}</strong>.
      </Aviso>
    );
  }

  const linkPequeno = "text-[13px] font-semibold text-azul-ceu underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-ardosia disabled:no-underline";

  return (
    <div className="mb-4 rounded-xl border border-linha bg-nevoa p-4">
      {codigoEnviadoPara ? (
        <>
          <p className="mb-3 text-[13.5px] leading-relaxed text-ardosia-escura">
            Enviamos um código de 6 números por SMS para <strong className="text-tinta">{codigoEnviadoPara}</strong>. Digite-o abaixo
            para confirmar a troca.
          </p>
          <CampoDoCodigo id="perfil-codigo" valor={codigo} aoMudar={setCodigo} disabled={carregando} />
          {erro && <div className="mt-3"><Aviso tipo="erro">{erro}</Aviso></div>}
          <button type="button" onClick={confirmar} disabled={carregando} className={classeBotao}>
            {carregando ? "Confirmando..." : "Confirmar código"}
          </button>
          <div className="mt-3 flex justify-between gap-3">
            <button type="button" onClick={enviarCodigo} disabled={carregando || segundosParaReenviar > 0} className={linkPequeno}>
              {segundosParaReenviar > 0 ? `Reenviar código em ${segundosParaReenviar}s` : "Reenviar código"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCodigoEnviadoPara(null);
                setErro("");
              }}
              disabled={carregando}
              className={linkPequeno}
            >
              Corrigir número
            </button>
          </div>
        </>
      ) : (
        <>
          <label className={classeLabel} htmlFor="perfil-telefone-novo">
            Novo telefone
          </label>
          <input
            id="perfil-telefone-novo"
            inputMode="numeric"
            value={novoTelefone}
            onChange={(e) => setNovoTelefone(formatarTelefone(e.target.value))}
            placeholder="(75) 99999-0000"
            maxLength={15}
            disabled={carregando}
            className={`${classeInput} mb-2 bg-superficie`}
          />
          <p className="mb-3 text-[13px] leading-relaxed text-ardosia-escura">
            O número novo passa a ser o da sua conta e recebe um código por SMS. Digite o código para confirmá-lo.
          </p>
          {erro && <Aviso tipo="erro">{erro}</Aviso>}
          <button
            type="button"
            onClick={enviarCodigo}
            disabled={indisponivel || carregando || digitos.length < 10}
            className={`${classeBotaoContorno} w-full`}
          >
            {carregando ? "Enviando..." : "Enviar código para o novo número"}
          </button>
          {indisponivel && <p className="mt-2 text-center text-[13px] text-ardosia">O envio do código ainda não está disponível.</p>}
        </>
      )}
    </div>
  );
}

type EstadoEndereco =
  | { status: "carregando" }
  | { status: "erro"; mensagem: string }
  | { status: "pronto"; endereco: Endereco | null };

function EnderecoDoAluno({ usuarioId }: { usuarioId: string }) {
  const [estado, setEstado] = useState<EstadoEndereco>({ status: "carregando" });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let cancelado = false;
    buscarEnderecoDoUsuario(usuarioId)
      .then((endereco) => {
        if (!cancelado) setEstado({ status: "pronto", endereco });
      })
      .catch((e) => {
        if (!cancelado) setEstado({ status: "erro", mensagem: mensagemDoErro(e) });
      });
    return () => {
      cancelado = true;
    };
  }, [usuarioId, tentativa]);

  if (estado.status === "carregando") return <CartaoCarregando />;

  if (estado.status === "erro") {
    return (
      <Cartao eyebrow="Endereço" titulo="Onde você mora">
        <ListaErro
          mensagem={estado.mensagem}
          onTentarNovamente={() => {
            setEstado({ status: "carregando" });
            setTentativa((t) => t + 1);
          }}
        />
      </Cartao>
    );
  }

  if (!estado.endereco) {
    return (
      <Cartao eyebrow="Endereço" titulo="Onde você mora">
        <Aviso tipo="info">Nenhum endereço cadastrado. Fale com o nosso atendimento para incluir.</Aviso>
      </Cartao>
    );
  }

  return (
    <FormularioEndereco
      key={estado.endereco.id}
      endereco={estado.endereco}
      onSalvo={(endereco) => setEstado({ status: "pronto", endereco })}
    />
  );
}

function FormularioEndereco({ endereco, onSalvo }: { endereco: Endereco; onSalvo: (e: Endereco) => void }) {
  const [cep, setCep] = useState(formatarCep(endereco.cep));
  const [rua, setRua] = useState(endereco.rua);
  const [numero, setNumero] = useState(String(endereco.numero ?? ""));
  const [complemento, setComplemento] = useState(endereco.complemento ?? "");
  const [bairro, setBairro] = useState(endereco.bairro);
  const [cidade, setCidade] = useState(endereco.cidade);
  const [uf, setUf] = useState(UFS.includes(endereco.estado) ? endereco.estado : "");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [avisoCep, setAvisoCep] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [salvo, setSalvo] = useState(false);

  async function alterarCep(valor: string) {
    const formatado = formatarCep(valor);
    setCep(formatado);
    setAvisoCep("");
    if (formatado.replace(/\D/g, "").length !== 8) return;

    setBuscandoCep(true);
    try {
      const achado = await buscarEnderecoPorCep(formatado);
      if (!achado) {
        setAvisoCep("CEP não encontrado — preencha manualmente.");
      } else {
        setRua(achado.rua);
        setBairro(achado.bairro);
        setCidade(achado.cidade);
        setUf(achado.estado);
      }
    } catch {
      setAvisoCep("Não foi possível buscar o CEP — preencha manualmente.");
    } finally {
      setBuscandoCep(false);
    }
  }

  async function salvar() {
    setSalvo(false);
    if (!cep || !rua.trim() || !numero || !bairro.trim() || !cidade.trim() || !uf) {
      return setErro("Preencha todos os campos obrigatórios.");
    }
    if (cep.replace(/\D/g, "").length !== 8) return setErro("CEP incompleto.");
    setErro("");
    setSalvando(true);
    try {
      const atualizado = await atualizarEndereco(endereco.id, {
        cep,
        rua: rua.trim(),
        numero: Number(numero),
        complemento: complemento.trim() || null,
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        estado: uf,
        pais: endereco.pais || "Brasil",
      });
      onSalvo(atualizado);
      setSalvo(true);
    } catch (e) {
      setErro(mensagemDoErro(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Cartao eyebrow="Endereço" titulo="Onde você mora">
      <label className={classeLabel} htmlFor="end-cep">
        CEP
      </label>
      <input
        id="end-cep"
        inputMode="numeric"
        value={cep}
        onChange={(e) => alterarCep(e.target.value)}
        maxLength={9}
        disabled={salvando}
        className={`${classeInput} ${avisoCep || buscandoCep ? "mb-1.5" : ""}`}
      />
      {buscandoCep && <p className="mb-4 text-[13px] text-ardosia">Buscando endereço...</p>}
      {avisoCep && <p className="mb-4 text-[13px] text-[#FF9C9C]">{avisoCep}</p>}

      <label className={classeLabel} htmlFor="end-rua">
        Endereço
      </label>
      <input id="end-rua" value={rua} onChange={(e) => setRua(e.target.value)} disabled={salvando} className={classeInput} />

      <div className="grid grid-cols-2 gap-3.5">
        <div>
          <label className={classeLabel} htmlFor="end-numero">
            Número
          </label>
          <input
            id="end-numero"
            inputMode="numeric"
            value={numero}
            onChange={(e) => setNumero(e.target.value.replace(/\D/g, "").slice(0, 6))}
            disabled={salvando}
            className={classeInput}
          />
        </div>
        <div>
          <label className={classeLabel} htmlFor="end-complemento">
            Complemento
          </label>
          <input
            id="end-complemento"
            value={complemento}
            onChange={(e) => setComplemento(e.target.value)}
            placeholder="Opcional"
            disabled={salvando}
            className={classeInput}
          />
        </div>
      </div>

      <label className={classeLabel} htmlFor="end-bairro">
        Bairro
      </label>
      <input id="end-bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} disabled={salvando} className={classeInput} />

      <div className="grid grid-cols-[1fr_96px] gap-3.5">
        <div>
          <label className={classeLabel} htmlFor="end-cidade">
            Cidade
          </label>
          <input id="end-cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} disabled={salvando} className={classeInput} />
        </div>
        <div>
          <label className={classeLabel} htmlFor="end-uf">
            UF
          </label>
          <select id="end-uf" value={uf} onChange={(e) => setUf(e.target.value)} disabled={salvando} className={classeInput}>
            <option value="">—</option>
            {UFS.map((sigla) => (
              <option key={sigla}>{sigla}</option>
            ))}
          </select>
        </div>
      </div>

      {erro && <Aviso tipo="erro">{erro}</Aviso>}
      {salvo && <Aviso tipo="sucesso">Endereço atualizado.</Aviso>}

      <button type="button" onClick={salvar} disabled={salvando} className={classeBotao}>
        {salvando ? "Salvando..." : "Salvar endereço"}
      </button>
    </Cartao>
  );
}

function TrocarSenha({ usuarioId }: { usuarioId: string }) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [salvo, setSalvo] = useState(false);

  async function trocar() {
    setSalvo(false);
    if (!senhaAtual || !novaSenha || !confirmar) return setErro("Preencha os três campos.");
    if (novaSenha.length < 8 || novaSenha.length > 72) return setErro("A nova senha deve ter entre 8 e 72 caracteres.");
    if (novaSenha !== confirmar) return setErro("A confirmação não confere com a nova senha.");
    if (novaSenha === senhaAtual) return setErro("A nova senha precisa ser diferente da atual.");
    setErro("");
    setSalvando(true);
    try {
      await alterarSenha(usuarioId, senhaAtual, novaSenha);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmar("");
      setSalvo(true);
    } catch (e) {
      setErro(mensagemDoErro(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Cartao eyebrow="Segurança" titulo="Trocar senha">
      <label className={classeLabel} htmlFor="senha-atual">
        Senha atual
      </label>
      <input
        id="senha-atual"
        type="password"
        autoComplete="current-password"
        value={senhaAtual}
        onChange={(e) => setSenhaAtual(e.target.value)}
        disabled={salvando}
        className={classeInput}
      />

      <label className={classeLabel} htmlFor="senha-nova">
        Nova senha
      </label>
      <input
        id="senha-nova"
        type="password"
        autoComplete="new-password"
        value={novaSenha}
        onChange={(e) => setNovaSenha(e.target.value)}
        placeholder="Entre 8 e 72 caracteres"
        disabled={salvando}
        className={classeInput}
      />

      <label className={classeLabel} htmlFor="senha-confirmar">
        Confirmar nova senha
      </label>
      <input
        id="senha-confirmar"
        type="password"
        autoComplete="new-password"
        value={confirmar}
        onChange={(e) => setConfirmar(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && trocar()}
        disabled={salvando}
        className={classeInput}
      />

      {erro && <Aviso tipo="erro">{erro}</Aviso>}
      {salvo && <Aviso tipo="sucesso">Senha alterada com sucesso.</Aviso>}

      <button type="button" onClick={trocar} disabled={salvando} className={classeBotao}>
        {salvando ? "Alterando..." : "Alterar senha"}
      </button>
    </Cartao>
  );
}

// "2026-11-26T15:00:00Z" → "26/11/2026"; "2026-11-26" (LocalDate) → "26/11/2026"
function dataDoBrasil(texto: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return texto.split("-").reverse().join("/");
  return new Date(texto).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

// Direitos do titular (LGPD, art. 18): cópia dos dados pelo e-mail do encarregado e exclusão da conta pela API.
// A exclusão espera 30 dias, com a conta funcionando, e pode ser cancelada até lá.
function CopiaEExclusao() {
  const [exclusao, setExclusao] = useState<ExclusaoDaConta | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let cancelado = false;
    buscarExclusaoDaConta()
      .then((e) => !cancelado && setExclusao(e))
      .catch(() => !cancelado && setFalhou(true));
    return () => {
      cancelado = true;
    };
  }, []);

  async function pedir() {
    if (!senha) return setErro("Digite a sua senha para confirmar.");
    setErro("");
    setEnviando(true);
    try {
      setExclusao(await pedirExclusaoDaConta(senha));
      setSenha("");
      setConfirmando(false);
      setAviso("Pedido registrado. Enviamos a data da exclusão para o seu e-mail.");
    } catch (e) {
      setErro(e instanceof ErroDaApi && e.status === 422 ? "Senha incorreta." : mensagemDoErro(e));
    } finally {
      setEnviando(false);
    }
  }

  async function cancelar() {
    setErro("");
    setEnviando(true);
    try {
      await cancelarExclusaoDaConta();
      setExclusao((e) => e && { ...e, agendadaPara: null });
      setAviso("Pedido cancelado. Sua conta continua normalmente.");
    } catch (e) {
      setErro(mensagemDoErro(e));
    } finally {
      setEnviando(false);
    }
  }

  const c = exclusao?.consequencias;
  const perdas = c
    ? [
        ...c.matriculasEmCurso.map((m) => `Matrícula na turma ${m.nome}, que vai até ${dataDoBrasil(m.fimEm)}`),
        ...c.inscricoesFuturas.map((i) => `Inscrição em ${i.nome} (${dataDoBrasil(i.quando)})`),
        ...c.comprasNoBalcao.map((b) => `${b.item}, ainda não retirado no Quad (sem reembolso automático)`),
        ...(c.saldoQuadCoins > 0 ? [`Saldo de ${c.saldoQuadCoins} Quad Coins`] : []),
      ]
    : [];

  return (
    <Cartao eyebrow="Privacidade" titulo="Cópia e exclusão dos dados">
      <p className="mb-4 text-[14.5px] leading-[1.6] text-ardosia">
        Para receber uma cópia dos seus dados ou corrigir algum deles, escreva para{" "}
        <a
          href={`mailto:${institucional.emailPrivacidade}?subject=${encodeURIComponent("Pedido sobre os meus dados (LGPD)")}`}
          className="font-semibold text-azul-ceu underline underline-offset-2"
        >
          {institucional.emailPrivacidade}
        </a>{" "}
        a partir do e-mail da sua conta.
      </p>

      <h3 className="mb-2 mt-6 font-display text-base font-bold">Excluir minha conta</h3>
      {aviso && <Aviso tipo="sucesso">{aviso}</Aviso>}
      {erro && <Aviso tipo="erro">{erro}</Aviso>}

      {falhou ? (
        <p className="text-[14.5px] leading-[1.6] text-ardosia">
          Não foi possível consultar agora. Se quiser excluir a conta, escreva para {institucional.emailPrivacidade}.
        </p>
      ) : !exclusao ? (
        <div role="status" aria-label="Carregando" className="h-12 animate-pulse rounded-[10px] bg-nevoa-clara" />
      ) : exclusao.agendadaPara ? (
        <>
          <Aviso tipo="info">
            Sua conta será excluída em <strong>{dataDoBrasil(exclusao.agendadaPara)}</strong>. Até lá ela continua funcionando, e você
            pode desistir.
          </Aviso>
          <button type="button" onClick={cancelar} disabled={enviando} className={`${classeBotaoContorno} w-full`}>
            {enviando ? "Cancelando..." : "Cancelar a exclusão"}
          </button>
        </>
      ) : !confirmando ? (
        <>
          <p className="mb-4 text-[14.5px] leading-[1.6] text-ardosia">
            A exclusão acontece 30 dias depois do pedido, e você pode desistir até lá. Depois disso, seus dados pessoais são apagados e
            a conta não pode ser recuperada. Os registros que a lei obriga a guardar, como os de compras, ficam pelo prazo legal.
          </p>
          <button
            type="button"
            onClick={() => {
              setConfirmando(true);
              setAviso("");
            }}
            className={`${classeBotaoContorno} w-full hover:border-[#C0392B] hover:text-[#FF9C9C]`}
          >
            Pedir a exclusão da conta
          </button>
        </>
      ) : (
        <>
          {perdas.length > 0 && (
            <div className="mb-4 rounded-[10px] border border-[rgba(248,113,113,0.38)] bg-[rgba(220,38,38,0.14)] px-3.5 py-3 text-[13.5px] leading-[1.5] text-[#FF9C9C]">
              <p className="mb-1.5 font-semibold">Com a exclusão, você perde:</p>
              <ul className="list-disc pl-5">
                {perdas.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}
          <label className={classeLabel} htmlFor="senha-exclusao">
            Digite a sua senha para confirmar
          </label>
          <input
            id="senha-exclusao"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && pedir()}
            disabled={enviando}
            className={classeInput}
          />
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={pedir}
              disabled={enviando}
              className="btn-q h-12 flex-1 bg-[#B42318] px-4 text-[15px] text-white hover:bg-[#912018] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando ? "Enviando..." : "Excluir minha conta"}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmando(false);
                setSenha("");
                setErro("");
              }}
              disabled={enviando}
              className={classeBotaoContorno}
            >
              Voltar
            </button>
          </div>
        </>
      )}
    </Cartao>
  );
}
