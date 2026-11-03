import type { OfertaDoMaterial, Produto } from "./data";

export type FormatoDoMaterial = "digital" | "impresso";

// Os dois formatos aparecem sempre no material; o que não está cadastrado (ou esgotou) fica desativado.
export const FORMATOS_DO_MATERIAL: FormatoDoMaterial[] = ["digital", "impresso"];

// Kit = vários materiais num produto só ("Kit Completo CFP"). Na API ainda não há campo próprio: vem do nome.
export function ehKit(p: Produto) {
  return p.tag.startsWith("Kit") || p.tag.startsWith("Combo") || p.nome.toLowerCase().includes("kit");
}

// Formatos cadastrados; sem a informação (dados antigos), os dois.
export function formatosDo(p: Produto) {
  return p.formatos ?? (["digital", "impresso"] as const);
}

// Id, endereço e preço do formato. Sem `ofertas` (dados antigos), o formato cadastrado usa os campos do material.
export function ofertaDo(p: Produto, formato: FormatoDoMaterial): OfertaDoMaterial | null {
  if (p.ofertas) return p.ofertas[formato] ?? null;
  if (!formatosDo(p).includes(formato)) return null;
  return { slug: p.slug, idNaApi: p.idNaApi ?? "", preco: p.preco, esgotado: !!p.esgotado };
}

export function aVenda(o: OfertaDoMaterial | null): boolean {
  return !!o && !o.esgotado && !o.indisponivel;
}

// O formato que já vem marcado: o primeiro à venda (o digital, se houver).
export function formatoInicial(p: Produto): FormatoDoMaterial {
  return FORMATOS_DO_MATERIAL.find((f) => aVenda(ofertaDo(p, f))) ?? (formatosDo(p)[0] as FormatoDoMaterial);
}

// O alvo do carrinho do servidor para o formato: o item e a plataforma (lib/loja.ts).
export function alvoDaOferta(o: OfertaDoMaterial, formato: FormatoDoMaterial) {
  return { itemId: o.idNaApi, plataforma: formato === "digital" ? ("DIGITAL" as const) : ("IMPRESSO" as const) };
}

// "Esgotado" no impresso sem estoque; "Em breve" no digital cujo PDF ainda não chegou.
export function rotuloDeIndisponivel(o: OfertaDoMaterial) {
  return o.indisponivel ? "Em breve" : "Esgotado";
}
