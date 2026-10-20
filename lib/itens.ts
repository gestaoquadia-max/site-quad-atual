import type { CartItem } from "./cart";
import type { Alvo } from "./loja";

// Fica fora de lib/cart.tsx (que é "use client") para poder ser usado também nas páginas do servidor.
export function idDoItem(tipo: CartItem["tipo"], slug: string) {
  return `${tipo}:${slug}`;
}

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

// O que o carrinho do servidor precisa para reservar o item. Os ids do carrinho levam o slug, que termina no id da API.
// null = o item não pode ser comprado online (ex.: simulado em PDF ou combo, que a API ainda não vende).
export function alvoDoItem(item: CartItem): Alvo | null {
  if (item.alvo) return item.alvo;
  const id = item.id.match(UUID)?.at(-1);
  switch (item.tipo) {
    case "produto":
      return id ? { itemId: id } : null;
    case "turma":
      return id ? { atividade: { tipo: "TURMA", id } } : null;
    case "evento":
      return id ? { atividade: { tipo: "EVENTO", id } } : null;
    case "simulado":
      // Só a edição presencial existe na API (o sku é o id da atividade).
      return item.simulado?.modalidade === "presencial" && item.simulado.edicao !== null ? { atividade: { tipo: "SIMULADO", id: item.simulado.sku } } : null;
    case "loja":
      // Produto com tamanho precisa do id da variação, que vem em item.alvo; sem tamanho, basta o id do item.
      return id && !item.id.slice(item.id.indexOf(id) + id.length) ? { itemId: id } : null;
  }
}
