"use client";

import { useRouter } from "next/navigation";
import { ShoppingCartSimple } from "@phosphor-icons/react";

// "Comprar agora" (põe no carrinho e abre o checkout) e, ao lado, o ícone de carrinho (adiciona e fica na página).
// `adicionar` coloca o item no carrinho; tema = a cor do fundo onde os botões ficam.
export default function BotoesDeCompra({
  adicionar,
  desabilitado = false,
  rotuloDesabilitado,
  tema = "escuro",
  className = "",
}: {
  adicionar: () => void;
  desabilitado?: boolean;
  // Texto do botão principal quando não dá para comprar ("Esgotado", "Preço a confirmar").
  rotuloDesabilitado?: string;
  tema?: "escuro" | "claro";
  className?: string;
}) {
  const router = useRouter();

  if (desabilitado) {
    return (
      <button
        type="button"
        disabled
        className={`btn-q h-14 w-full cursor-not-allowed rounded-xl text-base ${tema === "escuro" ? "bg-white/10 text-prata" : "bg-[#C9D3E0] text-white"} ${className}`}
      >
        {rotuloDesabilitado ?? "Indisponível"}
      </button>
    );
  }

  return (
    <div className={`flex gap-2.5 ${className}`}>
      <button
        type="button"
        onClick={() => {
          adicionar();
          router.push("/checkout");
        }}
        className="btn-q btn-q-azul h-14 flex-1 rounded-xl text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_16px_36px_-14px_rgba(0,107,255,1)] hover:-translate-y-0.5"
      >
        Comprar agora
      </button>
      {/* Só o ícone; o nome acessível e a dica ao passar o mouse dizem o que ele faz. */}
      <button
        type="button"
        onClick={adicionar}
        aria-label="Adicionar ao carrinho"
        title="Adicionar ao carrinho"
        className={`btn-q h-14 w-14 flex-none rounded-xl p-0 ${tema === "escuro" ? "btn-q-contorno-escuro" : "btn-q-contorno"}`}
      >
        <ShoppingCartSimple size={24} weight="bold" aria-hidden="true" />
      </button>
    </div>
  );
}
