import type { Produto } from "./data";

// Kit = vários materiais num produto só (no cadastro de exemplo, a etiqueta começa com "Combo").
export function ehKit(p: Produto) {
  return p.tag.startsWith("Combo") || p.slug.startsWith("kit-");
}
