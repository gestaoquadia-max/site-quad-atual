import { fetchAutenticado } from "./auth";
import { API_URL, ErroDaApi, lerErro } from "./http";

export type Aluno = {
  id: string;
  usuarioId: string;
  nomeDeGuerra: string;
  saldoQuadCoins: number;
  saldoDiamantes: number;
  score: number;
  patente: string;
  scoreMinimoDaPatente: number;
  proximaPatente: string | null;
  scoreMinimoDaProximaPatente: number | null;
};

export async function criarAluno(dados: {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  telefone: string;
  cep: string;
  rua: string;
  numero: number;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  complemento?: string;
  // Aceite dos termos (docs/pedidos-backend.md, item 2.7). A API ainda ignora esses campos.
  aceiteTermos: boolean;
  versaoDosTermos: string;
}): Promise<Aluno> {
  const res = await fetch(`${API_URL}/api/alunos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!res.ok) {
    throw await lerErro(res, "Não foi possível criar a conta.");
  }

  return res.json();
}

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  status: string;
  tipo: string;
  // Proposto ao backend (docs/pedidos-backend.md, item 2.6). Ausente = desconhecido.
  emailVerificado?: boolean;
};

export async function buscarUsuario(id: string): Promise<Usuario> {
  const res = await fetchAutenticado(`/api/usuarios/${id}`);

  if (!res.ok) {
    throw await lerErro(res, "Não foi possível carregar os dados do usuário.");
  }

  return res.json();
}

// Cadastro de aluno da conta logada. Responde 409 para contas que não são de aluno.
// GET /api/alunos/eu (MeuPerfilResponse): os dados do aluno e, ao lado, os da conta.
// Telefone e CPF vêm só com dígitos (ou null).
export type MeuPerfil = Aluno & {
  nomeCompleto: string | null;
  email: string | null;
  telefone: string | null;
  cpf: string | null;
  // Pedido ao backend (docs/pedidos-backend.md, item 2.6); ainda não vem.
  emailVerificado?: boolean;
};

// Responde 409 CADASTRO_DE_ALUNO_AUSENTE para contas que não são de aluno (professor, administrador).
export async function buscarAlunoAtual(): Promise<MeuPerfil> {
  const res = await fetchAutenticado("/api/alunos/eu");

  if (!res.ok) {
    throw await lerErro(res, "Não foi possível carregar os dados do aluno.");
  }

  return res.json();
}

// Responde 403 para conta de aluno enquanto o backend não liberar a edição do próprio cadastro.
export async function atualizarCadastro(id: string, dados: { nome: string; telefone: string }): Promise<Usuario> {
  const res = await fetchAutenticado(`/api/usuarios/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!res.ok) {
    throw await lerErro(res, "Não foi possível salvar seus dados.");
  }

  return res.json();
}

// Senha atual errada responde 422 (SENHA_ATUAL_INCORRETA), não 401: a sessão continua válida.
export async function alterarSenha(id: string, senhaAtual: string, novaSenha: string): Promise<void> {
  const res = await fetchAutenticado(`/api/usuarios/${id}/senha`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senhaAtual, novaSenha }),
  });

  if (!res.ok) {
    throw await lerErro(res, "Não foi possível alterar a senha.");
  }
}

export type Endereco = {
  id: string;
  usuarioId: string;
  cep: string;
  rua: string;
  numero: number;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  complemento: string | null;
};

export type DadosDoEndereco = Omit<Endereco, "id" | "usuarioId">;

// Devolve null quando o usuário não tem endereço cadastrado.
export async function buscarEnderecoDoUsuario(usuarioId: string): Promise<Endereco | null> {
  const res = await fetchAutenticado(`/api/enderecos/usuario/${usuarioId}`);

  if (res.status === 404) return null;
  if (!res.ok) {
    throw await lerErro(res, "Não foi possível carregar o endereço.");
  }

  return res.json();
}

export async function atualizarEndereco(id: string, dados: DadosDoEndereco): Promise<Endereco> {
  const res = await fetchAutenticado(`/api/enderecos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!res.ok) {
    throw await lerErro(res, "Não foi possível salvar o endereço.");
  }

  return res.json();
}

// Verificação do celular por código (cadastro e troca de telefone no perfil).
// Formato proposto ao backend em docs/pedidos-backend.md, itens 2.5 e 2.6. Responde 404 enquanto não existir.
export type EnvioDeCodigo = { expiraEm: string; podeReenviarEm: string };

export async function enviarCodigoDoCelular(telefone: string): Promise<EnvioDeCodigo> {
  const res = await fetchAutenticado("/api/usuarios/eu/telefone/verificacao", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ novoTelefone: telefone }),
  });

  if (res.status === 404 || res.status === 405) {
    throw new ErroDaApi(res.status, "A verificação do celular ainda não está disponível.", "INDISPONIVEL");
  }
  if (!res.ok) {
    throw await lerErro(res, "Não foi possível enviar o código.");
  }

  return res.json();
}

export async function confirmarCodigoDoCelular(codigo: string): Promise<void> {
  const res = await fetchAutenticado("/api/usuarios/eu/telefone/confirmacao", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codigo }),
  });

  if (res.status === 404 || res.status === 405) {
    throw new ErroDaApi(res.status, "A verificação do celular ainda não está disponível.", "INDISPONIVEL");
  }
  if (!res.ok) {
    throw await lerErro(res, "Não foi possível confirmar o código.");
  }
}

// Reenvia o e-mail com o link de confirmação. Formato proposto ao backend (item 2.6). Responde 404 enquanto não existir.
export async function reenviarConfirmacaoDeEmail(): Promise<void> {
  const res = await fetchAutenticado("/api/usuarios/eu/email/verificacao", { method: "POST" });

  if (res.status === 404 || res.status === 405) {
    throw new ErroDaApi(res.status, "A confirmação de e-mail ainda não está disponível.", "INDISPONIVEL");
  }
  if (!res.ok) {
    throw await lerErro(res, "Não foi possível enviar o e-mail de confirmação.");
  }
}

type Pagina<T> = { conteudo: T[]; pagina: number; tamanho: number; totalElementos: number; totalPaginas: number };

export type Matricula = {
  id: string;
  alunoId: string;
  turmaId: string;
  situacao: "ATIVA" | "TRANCADA" | "CONCLUIDA";
  origem: "COMPRA" | "SECRETARIA";
  criadaEm: string;
};

export type TurmaDoAluno = {
  id: string;
  nome: string;
  tipo: string;
  inicio: string;
  termino: string;
  horarioInicial: string | null;
  horarioFim: string | null;
  dias: string[];
  descricao: string | null;
};

export type AulaDaTurma = { id: string; data: string; status: "PREVISTA" | "REALIZADA" | "CANCELADA" };

export type MaterialDaTurma = {
  id: string;
  turmaId: string;
  turmaNome: string;
  materiaId: string;
  materiaNome: string;
  topicoNome: string | null;
  tipo: "SLIDES" | "RESUMO" | "LISTA" | "MAPA" | "VIDEO" | "OUTRO";
  titulo: string;
  arquivoNome: string | null;
  tamanhoEmBytes: number | null;
  videoUrl: string | null;
  duracaoEmMinutos: number | null;
  publicadoEm: string;
  // true no que este aluno ainda não abriu
  novo: boolean;
};

async function lerJson<T>(caminho: string, mensagemPadrao: string): Promise<T> {
  const res = await fetchAutenticado(caminho);
  if (!res.ok) throw await lerErro(res, mensagemPadrao);
  return res.json();
}

// Filtra pelo id do aluno (de /api/alunos/eu) em vez de confiar que a lista já vem filtrada.
export async function listarMatriculasDoAluno(alunoId: string): Promise<Matricula[]> {
  const pagina = await lerJson<Pagina<Matricula>>(
    `/api/matriculas?alunoId=${alunoId}&tamanho=100`,
    "Não foi possível carregar suas turmas.",
  );
  return pagina.conteudo;
}

export function buscarTurma(id: string): Promise<TurmaDoAluno> {
  return lerJson(`/api/turmas/${id}`, "Não foi possível carregar a turma.");
}

// Intervalo fechado nas duas pontas, com teto de 366 dias (acima disso a API responde 400).
export function buscarAgendaDaTurma(turmaId: string, inicio: string, fim: string): Promise<AulaDaTurma[]> {
  return lerJson(`/api/turmas/${turmaId}/agenda?inicio=${inicio}&fim=${fim}`, "Não foi possível carregar a agenda da turma.");
}

// Do mais recente para o mais antigo, só das turmas em que o aluno está ativo.
export async function listarMeusMateriais(): Promise<MaterialDaTurma[]> {
  const pagina = await lerJson<Pagina<MaterialDaTurma>>("/api/materiais/eu?tamanho=100", "Não foi possível carregar seus materiais.");
  return pagina.conteudo;
}

// Só quem tem matrícula ativa na turma do material. Vídeo não tem arquivo (404); 503 = armazenamento fora do ar.
export async function baixarArquivoDoMaterial(id: string): Promise<Blob> {
  const res = await fetchAutenticado(`/api/materiais/${id}/arquivo`);
  if (res.status === 503) {
    throw new ErroDaApi(503, "O arquivo está indisponível no momento. Tente novamente em alguns minutos.");
  }
  if (!res.ok) throw await lerErro(res, "Não foi possível baixar o arquivo.");
  return res.blob();
}

export async function marcarMaterialComoVisto(id: string): Promise<void> {
  await fetchAutenticado(`/api/materiais/${id}/visto`, { method: "POST" });
}

export type Disponibilidade = { emailDisponivel: boolean; telefoneDisponivel: boolean; cpfDisponivel: boolean | null };

// Rota pública: diz se e-mail, telefone e CPF estão livres. É uma resposta do momento, não uma reserva:
// a criação da conta ainda pode responder 409.
export async function conferirDisponibilidade(dados: { email: string; telefone: string; cpf: string }): Promise<Disponibilidade> {
  const res = await fetch(`${API_URL}/api/usuarios/disponibilidade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!res.ok) {
    throw await lerErro(res, "Não foi possível conferir seus dados agora.");
  }

  return res.json();
}
