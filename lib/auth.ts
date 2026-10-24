import { API_URL, ErroDaApi, lerErro } from "./http";

// Sessão em cookies (entregue pelo backend em 21/10/2026). Com o cabeçalho X-Quad-Cliente: site, a API grava:
// - quad_acesso e quad_renovacao: HttpOnly, nenhum script da página lê; o navegador os manda sozinho
//   (credentials: "include");
// - quad_sessao: só "1", sem segredo, legível aqui e no servidor do site (proxy.ts), para saber se há sessão.
// O site nunca vê nem guarda os tokens. Requisições que alteram dados exigem o mesmo cabeçalho (proteção CSRF).
export const CABECALHO_DO_SITE = { "X-Quad-Cliente": "site" } as const;
export const COOKIE_DE_SESSAO = "quad_sessao";

const EVENTO_MUDANCA = "quad-auth-mudou";
// Login e logout em outra aba: o cookie muda sem evento; esta chave do localStorage (sem nada sensível) avisa as abas.
const CHAVE_ENTRE_ABAS = "quad-sessao-mudou";

function avisarMudanca() {
  window.dispatchEvent(new Event(EVENTO_MUDANCA));
  try {
    localStorage.setItem(CHAVE_ENTRE_ABAS, String(Date.now()));
  } catch {
    // Sem localStorage, só as outras abas deixam de ser avisadas.
  }
}

export function temSessao(): boolean {
  return document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE_DE_SESSAO}=`) && c.length > COOKIE_DE_SESSAO.length + 1);
}

function enviarParaAApi(caminho: string, init: RequestInit = {}) {
  return fetch(`${API_URL}${caminho}`, {
    ...init,
    credentials: "include",
    headers: { ...init.headers, ...CABECALHO_DO_SITE },
  });
}

export async function login(email: string, senha: string): Promise<void> {
  const res = await enviarParaAApi("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  if (!res.ok) throw await lerErro(res, "E-mail ou senha inválidos.");
  avisarMudanca();
}

// Entrada pelo Google numa conta que JÁ EXISTE (a API não cria conta por aqui): o idToken vem do botão do Google
// (components/acesso/EntrarComGoogle.tsx), e a resposta é a mesma do login, com os cookies.
export async function loginComGoogle(idToken: string): Promise<void> {
  const res = await enviarParaAApi("/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw await lerErro(res, "Não foi possível entrar com o Google.");
  avisarMudanca();
}

// Revoga a sessão na API, que também apaga os três cookies.
export async function logout() {
  try {
    await enviarParaAApi("/auth/logout", { method: "POST" });
  } catch {
    // Sem rede: a sessão continua até a próxima tentativa.
  }
  avisarMudanca();
}

// Avisa sobre login/logout nesta aba e em outras abas (evento "storage"), e ao voltar para a aba.
export function assinarSessao(callback: () => void) {
  const aoMudarEmOutraAba = (e: StorageEvent) => e.key === CHAVE_ENTRE_ABAS && callback();
  window.addEventListener(EVENTO_MUDANCA, callback);
  window.addEventListener("storage", aoMudarEmOutraAba);
  document.addEventListener("visibilitychange", callback);
  return () => {
    window.removeEventListener(EVENTO_MUDANCA, callback);
    window.removeEventListener("storage", aoMudarEmOutraAba);
    document.removeEventListener("visibilitychange", callback);
  };
}

let renovacaoEmAndamento: Promise<boolean> | null = null;

// Troca os cookies vencidos por novos (a API lê o quad_renovacao). Várias chamadas simultâneas compartilham
// a mesma requisição. false = não deu para renovar.
function renovarSessao(): Promise<boolean> {
  renovacaoEmAndamento ??= (async () => {
    try {
      const res = await enviarParaAApi("/auth/refresh", { method: "POST" });
      if (res.status === 401) {
        // Renovação vencida ou revogada: encerra a sessão (a API apaga os cookies no logout).
        await logout();
        return false;
      }
      return res.ok;
    } catch {
      // Falha de rede: mantém a sessão para tentar de novo depois.
      return false;
    }
  })().finally(() => {
    renovacaoEmAndamento = null;
  });
  return renovacaoEmAndamento;
}

// fetch para rotas protegidas: os cookies vão sozinhos; no 401 renova uma vez e tenta de novo.
// Sem como renovar, a sessão é encerrada (a área do aluno então manda para /entrar).
export async function fetchAutenticado(caminho: string, init: RequestInit = {}): Promise<Response> {
  if (!temSessao()) throw new ErroDaApi(401, "Sessão encerrada. Entre novamente.");
  let res = await enviarParaAApi(caminho, init);
  if (res.status === 401) {
    if (!(await renovarSessao())) throw new ErroDaApi(401, "Sessão encerrada. Entre novamente.");
    res = await enviarParaAApi(caminho, init);
    if (res.status === 401) await logout();
  }
  return res;
}

// Recuperação de senha (rotas públicas). O e-mail traz o link /redefinir-senha?token=...
// Responde 202 mesmo quando o e-mail não existe, para não revelar quais e-mails têm conta.
export type RecuperacaoSolicitada = { validadeEmMinutos: number; reenvioEmSegundos: number };

export async function solicitarRedefinicaoDeSenha(email: string): Promise<RecuperacaoSolicitada> {
  const res = await fetch(`${API_URL}/auth/senha/recuperacao`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw await lerErro(res, "Não foi possível enviar o link agora. Tente novamente em alguns minutos.");
  }
  return res.json();
}

// Confere o link antes de pedir a senha nova. Link vencido, já usado ou adulterado: 422 TOKEN_INVALIDO.
export async function verificarLinkDeRedefinicao(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/senha/recuperacao/verificacao`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    throw await lerErro(res, "Não foi possível conferir o link.");
  }
}

export async function redefinirSenha(token: string, novaSenha: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/senha/recuperacao/redefinicao`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, novaSenha }),
  });

  if (!res.ok) {
    throw await lerErro(res, "Não foi possível redefinir a senha.");
  }
}

// Confirma o e-mail pelo link recebido (/confirmar-email?token=...). Rota pública proposta ao backend (item 2.6).
export async function confirmarEmail(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/email/confirmar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if ([401, 404, 405].includes(res.status)) {
    throw new ErroDaApi(res.status, "A confirmação de e-mail ainda não está disponível.", "INDISPONIVEL");
  }
  if (!res.ok) {
    throw await lerErro(res, "Não foi possível confirmar o e-mail.");
  }
}
