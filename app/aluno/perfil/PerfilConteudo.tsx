"use client";

import { useEffect, useState } from "react";
import { ListaErro } from "@/components/EstadoLista";
import {
  alterarSenha,
  atualizarCadastro,
  atualizarEndereco,
  atualizarMeuNome,
  buscarEnderecoDoUsuario,
  reenviarConfirmacaoDeEmail,
  type Endereco,
} from "@/lib/api";
import { buscarEnderecoPorCep, formatarCep, UFS } from "@/lib/endereco";
import { formatarCpf, formatarTelefone } from "@/lib/format";
import { ErroDaApi } from "@/lib/http";
import {
  useCarregandoUsuario,
  useRecarregarUsuario,
  useUsuarioAtual,
  type UsuarioAtual,
} from "@/lib/usuario";

const classeLabel = "font-display mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-steel";
const classeInput =
  "mb-4 w-full border border-light bg-offwhite px-3.5 py-3 text-[15px] text-navy outline-none focus:border-blue disabled:cursor-not-allowed disabled:text-steel";
const classeBotao = "btn btn-blue mt-2 block w-full disabled:cursor-not-allowed disabled:opacity-60";

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

  return (
    <div className="grid max-w-[1000px] items-start gap-6 lg:grid-cols-2">
      {/* Chaveado pelo id (e não pelo nome) para o aviso de "salvo" não sumir quando os dados recarregam. */}
      <DadosPessoais key={usuario.id} usuario={usuario} onSalvo={recarregar} />
      <EnderecoDoAluno usuarioId={usuario.id} />
      <TrocarSenha usuarioId={usuario.id} />
    </div>
  );
}

function CartoesCarregando({ quantidade }: { quantidade: number }) {
  return (
    <div role="status" aria-label="Carregando" className="grid max-w-[1000px] gap-6 lg:grid-cols-2">
      {Array.from({ length: quantidade }, (_, i) => (
        <CartaoCarregando key={i} />
      ))}
    </div>
  );
}

function CartaoCarregando() {
  return (
    <div className="animate-pulse border border-light bg-white p-7">
      {[0, 1, 2].map((j) => (
        <div key={j} className="mb-5">
          <div className="mb-2 h-3 w-24 bg-[#E2DFD6]" />
          <div className="h-[46px] bg-[#ECE9E1]" />
        </div>
      ))}
    </div>
  );
}

function Aviso({ tipo, children }: { tipo: "sucesso" | "erro" | "info"; children: React.ReactNode }) {
  const cores = {
    sucesso: "border-[#3E7A44]/30 bg-[#E4EFE5] text-[#33693A]",
    erro: "border-[#9B3535]/40 bg-[#9B3535]/10 text-[#9B3535]",
    info: "border-light bg-offwhite text-[#4A5462]",
  };
  return (
    <div role={tipo === "erro" ? "alert" : "status"} className={`mb-4 border px-3.5 py-2.5 text-[13px] ${cores[tipo]}`}>
      {children}
    </div>
  );
}

function Cartao({ eyebrow, titulo, children }: { eyebrow: string; titulo: string; children: React.ReactNode }) {
  return (
    <div className="border border-light bg-white p-7">
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="font-display mb-5 mt-2 text-xl font-bold uppercase">{titulo}</h2>
      {children}
    </div>
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
      </label>
      <input
        id="perfil-email"
        value={usuario.email ?? "—"}
        disabled
        className={`${classeInput} ${usuario.emailVerificado === false ? "mb-2" : ""}`}
      />
      {usuario.emailVerificado === false && <AlertaEmailNaoVerificado />}

      <label className={classeLabel} htmlFor="perfil-cpf">
        CPF
      </label>
      <input id="perfil-cpf" value={usuario.cpf ? formatarCpf(usuario.cpf) : "—"} disabled className={classeInput} />

      <label className={classeLabel} htmlFor="perfil-telefone">
        Telefone
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
          className="btn btn-outline-dark whitespace-nowrap px-4 text-xs disabled:cursor-not-allowed disabled:opacity-60"
        >
          Alterar
        </button>
      </div>
      {mostrarTrocaTelefone && <TrocaDeTelefone telefoneAtual={usuario.telefone} />}

      {erro && <Aviso tipo="erro">{erro}</Aviso>}
      {salvo && <Aviso tipo="sucesso">Dados atualizados.</Aviso>}

      <button type="button" onClick={salvar} disabled={bloqueado || salvando} className={classeBotao}>
        {salvando ? "Salvando..." : "Salvar alterações"}
      </button>
      <p className="mt-3 text-center text-xs text-steel">CPF e e-mail não podem ser alterados por aqui.</p>
    </Cartao>
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
    <div role="alert" className="mb-4 border border-[#B8860B]/40 bg-[#FFF6DD] px-3.5 py-3 text-[13px] text-[#7A5A00]">
      <p className="mb-2 font-semibold">Seu e-mail ainda não foi verificado.</p>
      <p className="mb-2.5 leading-relaxed">
        Abra o link que enviamos para a sua caixa de entrada para confirmar. Confira também o spam.
      </p>
      <button
        type="button"
        onClick={reenviar}
        disabled={enviando}
        className="focus-ring font-semibold underline underline-offset-4 disabled:opacity-60"
      >
        {enviando ? "Enviando..." : "Reenviar e-mail de confirmação"}
      </button>
      {resultado && (
        <p className={`mt-2 ${resultado.tipo === "erro" ? "text-[#9B3535]" : "text-[#33693A]"}`}>{resultado.texto}</p>
      )}
    </div>
  );
}

// Ordem da troca: o aluno digita o número novo, o código é enviado para esse número novo e,
// depois de confirmado, o telefone é trocado. O número atual continua valendo até a confirmação.
function TrocaDeTelefone({ telefoneAtual }: { telefoneAtual: string | null }) {
  const [novoTelefone, setNovoTelefone] = useState("");
  const digitos = novoTelefone.replace(/\D/g, "");
  const igualAoAtual = !!telefoneAtual && digitos === telefoneAtual.replace(/\D/g, "");

  return (
    <div className="mb-4 border border-light bg-offwhite p-4">
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
        className={`${classeInput} mb-2 bg-white`}
      />
      {igualAoAtual && <p className="mb-2 text-xs text-[#9B3535]">Esse já é o seu telefone atual.</p>}
      <p className="mb-3 text-xs leading-relaxed text-[#4A5462]">
        Vamos enviar um código para o <strong>número novo</strong>. A troca só vale depois que você digitar esse
        código; até lá, o número atual continua cadastrado.
      </p>
      <button
        type="button"
        disabled
        title="O envio do código ainda não está disponível"
        className="btn btn-outline-dark block w-full px-4 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
      >
        Enviar código para o novo número
      </button>
      <p className="mt-2 text-center text-xs text-steel">O envio do código ainda não está disponível.</p>
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
      {buscandoCep && <p className="mb-4 text-xs text-steel">Buscando endereço...</p>}
      {avisoCep && <p className="mb-4 text-xs text-[#9B3535]">{avisoCep}</p>}

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
