"use client";

import { useCart, type CartItem } from "@/lib/cart";
import { alvoDoItem } from "@/lib/itens";
import { alvoEmTexto, alvosDoCarrinho, itemDaSugestao, type SugestaoDaVitrine } from "@/lib/sugestoes";
import BlocoDeSugestoes from "./BlocoDeSugestoes";

// O alvo do gatilho como a API manda ("ITEM:<id>:DIGITAL"), para achar a linha do carrinho que gerou a sugestão.
export function gatilhoEmTexto(s: SugestaoDaVitrine) {
  return `${s.gatilho.tipo}:${s.gatilho.id}${s.gatilho.plataforma ? `:${s.gatilho.plataforma}` : ""}`;
}

export function itemDoGatilho(s: SugestaoDaVitrine, itens: CartItem[]) {
  const gatilho = gatilhoEmTexto(s);
  return itens.find((i) => {
    const a = alvoDoItem(i);
    return a ? alvoEmTexto(a) === gatilho : false;
  });
}

// "Para completar o seu pedido", entre a lista e a entrega: "Mais completo" troca o item que gerou a sugestão pelo
// sugerido; "Leve junto" acrescenta. Com o carrinho vazio não aparece.
export default function SugestoesDoCarrinho() {
  const { items, addItem, removeItem } = useCart();
  if (items.length === 0) return null;
  return (
    <BlocoDeSugestoes
      lugar="carrinho"
      alvos={alvosDoCarrinho(items)}
      tipos={["UP_SELL", "CROSS_SELL"]}
      maximo={3}
      titulo="Para completar o seu pedido"
      className="rounded-[18px] border border-linha bg-superficie px-[22px] pb-5 pt-[22px] shadow-cartao"
      acao={(s) => ({
        rotulo: s.tipo === "UP_SELL" ? "Trocar" : "Adicionar",
        aoEscolher: (variacao) => {
          const item = itemDaSugestao(s, variacao);
          if (!item) return;
          const gatilho = s.tipo === "UP_SELL" ? itemDoGatilho(s, items) : undefined;
          if (gatilho && gatilho.id !== item.id) removeItem(gatilho.id);
          addItem(item);
        },
      })}
    />
  );
}
