// Google Analytics 4 (Etapa 11, 07/11/2026). Regras:
// - Só carrega para quem aceitou "análise" no aviso de cookies (lib/consentimento.ts); ao recusar depois, para de
//   enviar (ga-disable). Antes de carregar, os eventos são simplesmente descartados.
// - Fora do domínio oficial (site de teste e localhost), tudo vai com debug_mode: aparece no DebugView do Analytics e
//   não entra nos relatórios, para os testes não se misturarem com os acessos dos alunos.
// - Nunca manda dado pessoal (nome, e-mail, CPF, telefone): é proibido pelas regras do Google. A campanha de cada
//   visita o próprio Google lê das UTMs do link; quem comprou fica só no sistema do Quad (pedido 6.5 ao backend).
// - O funil usa os eventos de comércio do GA4: view_item, add_to_cart, begin_checkout, purchase, sign_up e login.

import { consentimentoAtual } from "./consentimento";

export const ID_DO_ANALYTICS = "G-DHYL9131J8";
const DOMINIOS_OFICIAIS = ["quadconcursos.com.br", "www.quadconcursos.com.br"];
const MOEDA = "BRL";

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

// Um item no formato de comércio do GA4. O preço é unitário, em reais.
export type ItemDoAnalytics = {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
};

let carregado = false;

function ehDominioOficial() {
  return DOMINIOS_OFICIAIS.includes(window.location.hostname);
}

// Liga ou desliga o Analytics conforme o consentimento. Chamado pelo componente Analytics (no layout).
export function aplicarConsentimentoDeAnalise(aceito: boolean) {
  if (typeof window === "undefined") return;
  (window as unknown as Record<string, boolean>)[`ga-disable-${ID_DO_ANALYTICS}`] = !aceito;
  if (!aceito || carregado) return;
  carregado = true;
  window.dataLayer = window.dataLayer || [];
  // O gtag precisa empurrar o objeto `arguments`, e não um array: é assim que o script do Google o lê.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", ID_DO_ANALYTICS, {
    // As mudanças de página do site (navegação sem recarregar) o próprio GA mede pelo histórico do navegador
    // (medição otimizada, ligada no fluxo).
    debug_mode: !ehDominioOficial(),
    // Sem Google Signals nem anúncios personalizados a partir do Analytics.
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ID_DO_ANALYTICS}`;
  document.head.appendChild(script);
}

function enviar(nome: string, parametros: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  // Um evento pode vir antes do componente Analytics ligar o gtag (a página do produto conta a visita assim que
  // abre): com o "sim" já dado, liga aqui mesmo.
  if (!window.gtag && consentimentoAtual()?.analise) aplicarConsentimentoDeAnalise(true);
  if (!window.gtag) return;
  window.gtag("event", nome, parametros);
}

function valorDe(itens: ItemDoAnalytics[]) {
  return Math.round(itens.reduce((soma, i) => soma + (i.price ?? 0) * (i.quantity ?? 1), 0) * 100) / 100;
}

export function verItem(item: ItemDoAnalytics) {
  enviar("view_item", { currency: MOEDA, value: valorDe([item]), items: [item] });
}

export function adicionarAoCarrinho(item: ItemDoAnalytics) {
  enviar("add_to_cart", { currency: MOEDA, value: valorDe([item]), items: [item] });
}

export function iniciarPagamento(itens: ItemDoAnalytics[], valor?: number) {
  enviar("begin_checkout", { currency: MOEDA, value: valor ?? valorDe(itens), items: itens });
}

export function cadastro() {
  enviar("sign_up", { method: "site" });
}

export function login(metodo: "senha" | "google") {
  enviar("login", { method: metodo });
}

// ---------- Compra ----------
// O fechamento pode terminar em outra tela (o PIX é pago depois): os itens vistos no checkout ficam guardados na
// sessão, pelo id do fechamento, até a compra ser confirmada. E cada fechamento é contado uma vez só (o aluno pode
// recarregar a página de confirmação).

const CHAVE_DOS_ITENS = "quad-analytics-itens-do-fechamento";
const CHAVE_DAS_ENVIADAS = "quad-analytics-compras-enviadas";

export function guardarItensDoFechamento(fechamentoId: string, itens: ItemDoAnalytics[]) {
  try {
    const todos = JSON.parse(sessionStorage.getItem(CHAVE_DOS_ITENS) || "{}") as Record<string, ItemDoAnalytics[]>;
    todos[fechamentoId] = itens;
    sessionStorage.setItem(CHAVE_DOS_ITENS, JSON.stringify(todos));
  } catch {
    // Sem armazenamento: a compra ainda vai, só que sem o preço de cada item (o total vai sempre).
  }
}

function itensGuardados(fechamentoId: string): ItemDoAnalytics[] | null {
  try {
    const todos = JSON.parse(sessionStorage.getItem(CHAVE_DOS_ITENS) || "{}") as Record<string, ItemDoAnalytics[]>;
    return todos[fechamentoId] ?? null;
  } catch {
    return null;
  }
}

function jaEnviada(fechamentoId: string) {
  try {
    const enviadas = JSON.parse(localStorage.getItem(CHAVE_DAS_ENVIADAS) || "[]") as string[];
    if (enviadas.includes(fechamentoId)) return true;
    localStorage.setItem(CHAVE_DAS_ENVIADAS, JSON.stringify([...enviadas.slice(-49), fechamentoId]));
    return false;
  } catch {
    return false;
  }
}

// A compra paga. `itensDaApi`: os itens do fechamento (nome e quantidade), usados quando não há os do checkout.
export function compra(fechamento: { id: string; totalEmCentavos: number; cupom?: string | null }, itensDaApi: ItemDoAnalytics[]) {
  if (typeof window === "undefined" || !consentimentoAtual()?.analise) return;
  if (jaEnviada(fechamento.id)) return;
  enviar("purchase", {
    transaction_id: fechamento.id,
    currency: MOEDA,
    value: fechamento.totalEmCentavos / 100,
    coupon: fechamento.cupom ?? undefined,
    items: itensGuardados(fechamento.id) ?? itensDaApi,
  });
}
