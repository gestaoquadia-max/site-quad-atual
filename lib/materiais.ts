import type { Produto } from "./data";

// Kit = vários materiais num produto só ("Kit Completo CFP"). Na API ainda não há campo próprio: vem do nome.
export function ehKit(p: Produto) {
  return p.tag.startsWith("Kit") || p.tag.startsWith("Combo") || p.nome.toLowerCase().includes("kit");
}

// Formatos à venda; sem a informação (dados antigos), os dois.
export function formatosDo(p: Produto) {
  return p.formatos ?? (["digital", "impresso"] as const);
}
