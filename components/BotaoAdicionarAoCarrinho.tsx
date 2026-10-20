"use client";

import { useCart, type CartItem } from "@/lib/cart";

// Coloca o item no carrinho e mostra o aviso "adicionado ao carrinho" (components/AvisoDoCarrinho.tsx).
export default function BotaoAdicionarAoCarrinho({
  item,
  rotulo = "Adicionar ao carrinho",
  className = "",
}: {
  item: Omit<CartItem, "quantidade">;
  rotulo?: string;
  className?: string;
}) {
  const { addItem } = useCart();
  return (
    <button type="button" onClick={() => addItem(item)} className={`btn-q btn-q-azul ${className}`}>
      {rotulo}
    </button>
  );
}
