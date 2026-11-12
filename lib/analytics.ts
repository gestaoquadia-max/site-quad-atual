// Google Analytics 4 (Etapa 11, 07/11/2026) e Google Ads (12/11/2026, na mesma tag, ver aplicarConsentimento). Regras:
// - Só carrega para quem aceitou "análise" no aviso de cookies (lib/consentimento.ts); ao recusar depois, para de
//   enviar (ga-disable). Antes de carregar, os eventos são simplesmente descartados.
// - Fora do domínio oficial (site de teste e localhost), tudo vai com debug_mode: aparece no DebugView do Analytics e
//   não entra nos relatórios, para os testes não se misturarem com os acessos dos alunos.
// - Nunca manda dado pessoal (nome, e-mail, CPF, telefone): é proibido pelas regras do Google. A campanha de cada
//   visita o próprio Google lê das UTMs do link; quem comprou fica só no sistema do Quad (pedido 6.5 ao backend).
// - O funil usa os eventos de comércio do GA4: view_item, add_to_cart, begin_checkout, purchase, sign_up e login.

import { consentimentoAtual } from "./consentimento";

export const ID_DO_ANALYTICS = "G-DHYL9131J8";
// Google Ads (conta 532-763-1597), na mesma tag, só com o consentimento de marketing.
export const ID_DO_GOOGLE_ADS = "AW-18571482116";
const DOMINIOS_OFICIAIS = ["quadconcursos.com.br", "www.quadconcursos.com.br"];
const MOEDA = "BRL";

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

// Um item no formato de comércio do GA4. O preço é unitário, em reais, já com o desconto; `discount` é o desconto
// por unidade (o GA4 soma price × quantity na receita do item, então ela bate com o que o aluno pagou).
export type ItemDoAnalytics = {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  discount?: number;
  quantity?: number;
};

let carregado = false;
const configurados = new Set<string>();

function ehDominioOficial() {
  return DOMINIOS_OFICIAIS.includes(window.location.hostname);
}

type Escolha = { analise: boolean; marketing: boolean };
const permissao = (sim: boolean) => (sim ? "granted" : "denied");

// Liga ou desliga as tags do Google conforme o aviso de cookies. Chamado pelo componente Analytics (no layout).
// Uma tag só (gtag.js) atende os dois: o GA4 entra com "análise" e o Google Ads com "marketing" (12/11/2026). O modo
// de consentimento do Google recebe a mesma escolha, e nada é carregado enquanto o visitante não aceitar algo.
export function aplicarConsentimento({ analise, marketing }: Escolha) {
  if (typeof window === "undefined") return;
  (window as unknown as Record<string, boolean>)[`ga-disable-${ID_DO_ANALYTICS}`] = !analise;
  const estado = {
    analytics_storage: permissao(analise),
    ad_storage: permissao(marketing),
    ad_user_data: permissao(marketing),
    ad_personalization: permissao(marketing),
  };

  if (!carregado) {
    if (!analise && !marketing) return;
    carregado = true;
    window.dataLayer = window.dataLayer || [];
    // O gtag precisa empurrar o objeto `arguments`, e não um array: é assim que o script do Google o lê.
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("consent", "default", estado);
    window.gtag("js", new Date());
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${analise ? ID_DO_ANALYTICS : ID_DO_GOOGLE_ADS}`;
    document.head.appendChild(script);
  } else {
    window.gtag!("consent", "update", estado);
  }

  if (analise && !configurados.has(ID_DO_ANALYTICS)) {
    configurados.add(ID_DO_ANALYTICS);
    window.gtag!("config", ID_DO_ANALYTICS, {
      // As mudanças de página do site (navegação sem recarregar) o próprio GA mede pelo histórico do navegador
      // (medição otimizada, ligada no fluxo).
      debug_mode: !ehDominioOficial(),
      // Sem Google Signals. Anúncios personalizados seguem o consentimento de marketing (ad_personalization).
      allow_google_signals: false,
    });
  }
  if (marketing && !configurados.has(ID_DO_GOOGLE_ADS)) {
    configurados.add(ID_DO_GOOGLE_ADS);
    // A compra conta como conversão pela importação do `purchase` do GA4 no Google Ads (vínculo feito em 12/11/2026).
    window.gtag!("config", ID_DO_GOOGLE_ADS);
  }
}

function enviar(nome: string, parametros: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  // Um evento pode vir antes do componente Analytics ligar o gtag (a página do produto conta a visita assim que
  // abre): com o "sim" já dado, liga aqui mesmo.
  const c = consentimentoAtual();
  if (!window.gtag && c && (c.analise || c.marketing)) aplicarConsentimento(c);
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

type FechamentoDoAnalytics = { id: string; totalEmCentavos: number; subtotalEmCentavos?: number; descontoEmCentavos?: number; cupom?: string | null };

// Os itens da API não trazem preço (só nome e quantidade). Com um item só, o preço sai do próprio fechamento; com
// vários, fica sem preço (o total do pedido vai sempre).
function comPrecoDoFechamento(itens: ItemDoAnalytics[], f: FechamentoDoAnalytics): ItemDoAnalytics[] {
  if (itens.length !== 1 || itens[0].price != null) return itens;
  const q = itens[0].quantity ?? 1;
  return [{ ...itens[0], price: f.totalEmCentavos / 100 / q, discount: f.descontoEmCentavos ? f.descontoEmCentavos / 100 / q : undefined }];
}

// A compra paga. `itensDaApi`: os itens do fechamento (nome e quantidade), usados quando não há os do checkout.
// Total zero = cupom de 100% (cortesia, bolsa, parceria; ex.: QUAD30, SIMULADOSIQ) ou inscrição gratuita: não é venda.
// Vai como `inscricao_cortesia`, e não `purchase`, para não contar como conversão no Google Ads nem inflar as compras
// (decisão de 12/11/2026, a partir das 13 compras de R$ 0 no GA4). O total zero está certo e nunca é trocado pela
// soma dos itens.
export function compra(fechamento: FechamentoDoAnalytics, itensDaApi: ItemDoAnalytics[]) {
  const c = typeof window === "undefined" ? null : consentimentoAtual();
  if (!c || !(c.analise || c.marketing)) return;
  if (jaEnviada(fechamento.id)) return;
  const cortesia = fechamento.totalEmCentavos <= 0;
  enviar(cortesia ? "inscricao_cortesia" : "purchase", {
    transaction_id: fechamento.id,
    currency: MOEDA,
    value: Math.max(0, fechamento.totalEmCentavos) / 100,
    coupon: fechamento.cupom ?? undefined,
    items: itensGuardados(fechamento.id) ?? comPrecoDoFechamento(itensDaApi, fechamento),
  });
}
