"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart";

// Esvazia o carrinho assim que o pedido é registrado. Espera o carrinho salvo
// ser lido do navegador; senão ele seria restaurado logo depois de limpo.
export default function LimparCarrinho() {
  const { carregado, clear } = useCart();

  useEffect(() => {
    if (carregado) clear();
  }, [carregado, clear]);

  return null;
}
