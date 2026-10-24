"use client";

import { useRouter } from "next/navigation";

// "Comprar agora" (põe no carrinho e abre o checkout) e "Adicionar ao carrinho" (fica na página, com o aviso).
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
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <button
        type="button"
        onClick={() => {
          adicionar();
          router.push("/checkout");
        }}
        className="btn-q btn-q-azul h-14 w-full rounded-xl text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_16px_36px_-14px_rgba(0,107,255,1)] hover:-translate-y-0.5"
      >
        Comprar agora
      </button>
      <button
        type="button"
        onClick={adicionar}
        className={`btn-q h-12 w-full rounded-xl text-[15px] ${tema === "escuro" ? "btn-q-contorno-escuro" : "btn-q-contorno"}`}
      >
        Adicionar ao carrinho
      </button>
    </div>
  );
}
