"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart";
import { foraDaCobranca } from "@/lib/fora-da-cobranca";

// Esvazia o carrinho assim que o pedido é registrado. Espera o carrinho salvo
// ser lido do navegador; senão ele seria restaurado logo depois de limpo.
// Se alguma linha ficou fora da cobrança (lib/fora-da-cobranca.ts), o checkout já tirou só o que foi comprado: o
// resto fica no carrinho.
export default function LimparCarrinho({ fechamento }: { fechamento?: string }) {
  const { carregado, clear } = useCart();

  useEffect(() => {
    if (!carregado) return;
    if (fechamento && foraDaCobranca(fechamento).length > 0) return;
    clear();
  }, [carregado, clear, fechamento]);

  return null;
}
