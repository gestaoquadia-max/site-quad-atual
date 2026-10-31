import { API_URL, lerErro } from "./http";
import { emReais } from "./loja";
import { SEGUNDOS_DE_CACHE, ETIQUETA_DA_VITRINE } from "./vitrine";

// Combos da loja (API, PR #129, 28/10/2026): várias partes por um preço só. A vitrine é pública
// (/api/loja/vitrine/combos); a compra é um fechamento próprio (/api/loja/fechamentos/combos/{id}), sem carrinho e sem
// cupom, porque o combo já é o desconto. Página própria em /combos; cada área mostra os combos só dela.

export type TipoDaParte = "ITEM" | "TURMA" | "EVENTO" | "SIMULADO";

export type ParteDoCombo = {
  tipo: TipoDaParte;
  id: string;
  nome: string;
  // Endereço da página da parte; nulo quando ela saiu da vitrine.
  slug: string | null;
  imagemUrl: string | null;
  precoEmCentavos: number | null;
  aVenda: boolean;
  presencial: boolean | null;
  tipoDeItem: "MATERIAL" | "MODULOS" | "OUTROS" | "SKIN" | string | null;
  plataforma: "IMPRESSO" | "DIGITAL" | null;
  // As variações ativas do item (a camisa P, M, G): quem compra escolhe uma. [] no resto.
  variacoes: { id: string; nome: string; restantes: number }[];
};

export type Combo = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  imagemUrl: string | null;
  precoEmCentavos: number;
  // A soma dos preços de hoje das partes; nula quando alguma não tem preço.
  precoCheioEmCentavos: number | null;
  // O que se paga: o menor entre o preço do combo e a soma.
  aPagarEmCentavos: number | null;
  economiaEmCentavos: number | null;
  // Toda parte à venda agora (o combo não tem estoque próprio).
  disponivel: boolean;
  componentes: ParteDoCombo[];
};

export type AreaDoCombo = "turmas" | "simulados" | "materiais";

// A área de um combo: a de todas as partes, quando são de um tipo só. Misturado (ex.: módulo + camisa + simulado)
// fica só na página /combos (decisão de 31/10/2026).
export function areaDoCombo(c: Combo): AreaDoCombo | null {
  const partes = c.componentes;
  if (partes.length === 0) return null;
  if (partes.every((p) => p.tipo === "TURMA")) return "turmas";
  if (partes.every((p) => p.tipo === "SIMULADO")) return "simulados";
  if (partes.every((p) => p.tipo === "ITEM" && (p.tipoDeItem === "MATERIAL" || p.tipoDeItem === "MODULOS"))) return "materiais";
  return null;
}

export function precoDoCombo(c: Combo) {
  return c.aPagarEmCentavos ?? c.precoEmCentavos;
}

// Rótulo do tipo de cada parte, como o aluno lê.
export function rotuloDaParte(p: ParteDoCombo) {
  if (p.tipo === "TURMA") return "Turma presencial";
  if (p.tipo === "SIMULADO") return p.presencial ? "Simulado presencial" : "Simulado";
  if (p.tipo === "EVENTO") return "Evento";
  if (p.tipoDeItem === "MATERIAL" || p.tipoDeItem === "MODULOS") return p.plataforma === "DIGITAL" ? "Material em PDF" : "Material impresso";
  return "Loja Quad";
}

// Página de cada parte no site, quando ela ainda está na vitrine.
export function linkDaParte(p: ParteDoCombo) {
  if (!p.slug) return null;
  if (p.tipo === "TURMA") return `/turmas/${p.slug}`;
  if (p.tipo === "EVENTO") return `/eventos/${p.slug}`;
  if (p.tipo === "SIMULADO") return "/simulados";
  if (p.tipoDeItem === "MATERIAL" || p.tipoDeItem === "MODULOS") return `/produtos/${p.slug}`;
  return `/loja/${p.slug}`;
}

export function economiaEmTexto(c: Combo) {
  return c.economiaEmCentavos && c.economiaEmCentavos > 0 ? `Economize ${emReais(c.economiaEmCentavos)}` : null;
}

async function lerCombos<T>(caminho: string): Promise<T | null> {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL não está definida.");
  const res = await fetch(`${API_URL}${caminho}`, { next: { revalidate: SEGUNDOS_DE_CACHE, tags: [ETIQUETA_DA_VITRINE] } });
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw await lerErro(res, "Não foi possível carregar os combos.");
  return res.json();
}

// null = a API não respondeu (a seção some em vez de quebrar a página).
export async function listarCombos(): Promise<Combo[] | null> {
  try {
    const pagina = await lerCombos<{ conteudo: Combo[] }>("/api/loja/vitrine/combos?tamanho=100");
    return pagina?.conteudo ?? [];
  } catch {
    return null;
  }
}

export async function buscarCombo(slug: string): Promise<Combo | null> {
  return lerCombos<Combo>(`/api/loja/vitrine/combos/slug/${encodeURIComponent(slug)}`);
}

export async function listarCombosDaArea(area: AreaDoCombo): Promise<Combo[]> {
  return ((await listarCombos()) ?? []).filter((c) => areaDoCombo(c) === area);
}
