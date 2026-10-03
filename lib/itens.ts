import type { CartItem } from "./cart";

// Fica fora de lib/cart.tsx (que é "use client") para poder ser usado também nas páginas do servidor.
export function idDoItem(tipo: CartItem["tipo"], slug: string) {
  return `${tipo}:${slug}`;
}
