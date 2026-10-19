import { API_URL, ErroDaApi, lerErro } from "./http";

const STORAGE_KEY = "quad-auth";
const EVENTO_MUDANCA = "quad-auth-mudou";
// Renova um pouco antes do vencimento para não mandar requisição com token no limite.
const MARGEM_EXPIRACAO_MS = 30_000;

export type Sessao = {
  tipoDeToken: string;
  tokenDeAcesso: string;
  acessoExpiraEm: string;
  tokenDeRenovacao: string;
  renovacaoExpiraEm: string;
};

function salvarSessao(sessao: Sessao) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessao));
  window.dispatchEvent(new Event(EVENTO_MUDANCA));
}

function limparSessao() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(EVENTO_MUDANCA));
}

// Data inválida conta como "não expirou": nesse caso quem decide é o 401 da API.
function expirou(dataIso: string) {
  return Date.parse(dataIso) - MARGEM_EXPIRACAO_MS <= Date.now();
}

export async function login(email: string, senha: string): Promise<Sessao> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  if (!res.ok) {
    throw await lerErro(res, "E-mail ou senha inválidos.");
  }

  const sessao: Sessao = await res.json();
  salvarSessao(sessao);
  return sessao;
}

export function getSessao(): Sessao | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logout() {
  const sessao = getSessao();
  limparSessao();
  if (!sessao) return;
  // Revoga a sessão no servidor; a sessão local já foi apagada de qualquer forma.
  fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${sessao.tokenDeAcesso}` },
    keepalive: true,
  }).catch(() => {});
}

// Avisa sobre login/logout nesta aba e em outras abas (evento "storage").
export function assinarSessao(callback: () => void) {
  window.addEventListener(EVENTO_MUDANCA, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENTO_MUDANCA, callback);
    window.removeEventListener("storage", callback);
  };
}

let renovacaoEmAndamento: Promise<Sessao | null> | null = null;

// Troca o token de renovação por uma sessão nova. Várias chamadas simultâneas
// compartilham a mesma requisição. Devolve null se não for possível renovar.
function renovarSessao(tokenQueFalhou: string): Promise<Sessao | null> {
  renovacaoEmAndamento ??= (async () => {
    const atual = getSessao();
    if (!atual) return null;

    // Outra aba (ou outra requisição) já renovou.
    if (atual.tokenDeAcesso !== tokenQueFalhou && !expirou(atual.acessoExpiraEm)) return atual;

    if (expirou(atual.renovacaoExpiraEm)) {
      limparSessao();
      return null;
    }

    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenDeRenovacao: atual.tokenDeRenovacao }),
      });
      if (!res.ok) {
        if (res.status === 401) limparSessao();
        return null;
      }
      const nova: Sessao = await res.json();
      salvarSessao(nova);
      return nova;
    } catch {
      // Falha de rede: mantém a sessão para tentar de novo depois.
      return null;
    }
  })().finally(() => {
    renovacaoEmAndamento = null;
  });
  return renovacaoEmAndamento;
}

// fetch para rotas protegidas: envia o token, renova quando vence e encerra a
// sessão quando não há mais como renovar (a área do aluno então manda para /entrar).
export async function fetchAutenticado(caminho: string, init: RequestInit = {}): Promise<Response> {
  let sessao = getSessao();
  if (!sessao) throw new ErroDaApi(401, "Sessão encerrada. Entre novamente.");

  if (expirou(sessao.acessoExpiraEm)) {
    sessao = await renovarSessao(sessao.tokenDeAcesso);
    if (!sessao) throw new ErroDaApi(401, "Sessão encerrada. Entre novamente.");
  }

  const enviar = (token: string) =>
    fetch(`${API_URL}${caminho}`, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${token}` },
    });

  let res = await enviar(sessao.tokenDeAcesso);
  if (res.status === 401) {
    const nova = await renovarSessao(sessao.tokenDeAcesso);
    if (!nova) throw new ErroDaApi(401, "Sessão encerrada. Entre novamente.");
    res = await enviar(nova.tokenDeAcesso);
    if (res.status === 401) limparSessao();
  }
  return res;
}

function decodeTokenPayload(token: string): { sub?: string; roles?: string[] } | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function getUsuarioIdDoToken(token: string): string | null {
  return decodeTokenPayload(token)?.sub ?? null;
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
