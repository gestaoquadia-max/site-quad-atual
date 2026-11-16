// O que o site manda à API no fechamento para medir as vendas (pedidos 6.5 e 6.6 em docs/pedidos-backend.md; na API
// desde 14/11/2026: MarketingRequest e OrigemRequest, em POST /api/loja/carrinho/eu/fechamento e no fechamento do combo).
//
// - `origem`: a PRIMEIRA e a ÚLTIMA campanha (UTMs e gclid) pelas quais o aluno chegou ao site, guardadas no navegador
//   por 90 dias. Interesse legítimo: vale sem o consentimento de marketing (é a origem da venda feita no próprio site) e
//   nunca sai da API, a não ser para o financeiro.
// - `marketing`: só com o consentimento de marketing; os cookies _fbp e _fbc do Pixel e a página. Com ele, a API manda a
//   compra paga à Meta (API de Conversões), com o id do fechamento como event_id, o mesmo eventID do Pixel do site.
//
// Nada daqui pode recusar uma compra: a API ignora o texto inválido, e o fechamento tenta de novo sem estes blocos se a
// API recusar o corpo (lib/loja.ts). Atenção: um campo desconhecido DENTRO de `marketing` é 400 na API; só os quatro.
import { consentimentoAtual } from "./consentimento";

const CHAVE = "quad-origem-da-venda";
const NOVENTA_DIAS = 90 * 24 * 60 * 60 * 1000;
const TETO = 150;
const TETO_DO_GCLID = 300;

type Toque = { fonte?: string; midia?: string; campanha?: string; conteudo?: string; termo?: string; gclid?: string; em: string };
type OrigemGuardada = { primeira?: Toque; ultima?: Toque };

export type Marketing = { consentimento: true; fbp?: string; fbc?: string; url?: string };
export type Origem = { primeira?: Toque; ultima?: Toque };

function ler(): OrigemGuardada {
  try {
    const o = JSON.parse(localStorage.getItem(CHAVE) ?? "{}") as OrigemGuardada;
    const vale = (t?: Toque) => (t && Date.now() - Date.parse(t.em) < NOVENTA_DIAS ? t : undefined);
    return { primeira: vale(o.primeira), ultima: vale(o.ultima) };
  } catch {
    return {};
  }
}

function texto(valor: string | null, teto = TETO) {
  const limpo = valor?.trim();
  return limpo ? limpo.slice(0, teto) : undefined;
}

// Chamado a cada página: se o endereço traz uma campanha, ela vira a última (e a primeira, se não houver uma dos
// últimos 90 dias).
export function registrarCampanha() {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams(window.location.search);
  const toque: Toque = {
    fonte: texto(p.get("utm_source")),
    midia: texto(p.get("utm_medium")),
    campanha: texto(p.get("utm_campaign")),
    conteudo: texto(p.get("utm_content")),
    termo: texto(p.get("utm_term")),
    gclid: texto(p.get("gclid"), TETO_DO_GCLID),
    em: new Date().toISOString(),
  };
  if (!toque.fonte && !toque.midia && !toque.campanha && !toque.conteudo && !toque.termo && !toque.gclid) return;
  const atual = ler();
  try {
    localStorage.setItem(CHAVE, JSON.stringify({ primeira: atual.primeira ?? toque, ultima: toque }));
  } catch {
    // Sem armazenamento (aba anônima bloqueada): a venda segue sem a origem.
  }
}

function cookie(nome: string) {
  const achado = document.cookie.split("; ").find((c) => c.startsWith(`${nome}=`));
  return achado ? decodeURIComponent(achado.slice(nome.length + 1)) : undefined;
}

// Os blocos do fechamento; cada um só vai quando há o que mandar.
export function dadosDeMedicao(): { marketing?: Marketing; origem?: Origem } {
  if (typeof window === "undefined") return {};
  const dados: { marketing?: Marketing; origem?: Origem } = {};
  const { primeira, ultima } = ler();
  if (primeira || ultima) dados.origem = { primeira, ultima };
  if (consentimentoAtual()?.marketing === true) {
    // A página sem a busca nem o fragmento: o endereço do checkout não leva dado pessoal.
    dados.marketing = { consentimento: true, fbp: cookie("_fbp"), fbc: cookie("_fbc"), url: window.location.origin + window.location.pathname };
  }
  return dados;
}
