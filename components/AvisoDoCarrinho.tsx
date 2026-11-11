"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";

// Aviso "X adicionado ao carrinho" no rodapé da tela. Some sozinho em alguns segundos (lib/cart.tsx).
export default function AvisoDoCarrinho() {
  const { aviso, fecharAviso } = useCart();
  const pathname = usePathname();
  // No carrinho e no checkout o próprio item já aparece na tela.
  if (!aviso || pathname.startsWith("/carrinho") || pathname.startsWith("/checkout")) return null;

  // Centralizado por uma faixa da largura da tela, e não por translate: a animação de entrada (q-aparecer) termina em
  // `transform: none` e apagaria o -translate-x-1/2, deixando o aviso deslocado para a direita.
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[110] flex justify-center px-4">
      <div
        role="status"
        className="pointer-events-auto flex max-w-full animate-[q-aparecer_220ms_ease_both] items-center gap-3 rounded-xl border border-white/10 bg-marinho-950 py-3 pl-3.5 pr-4 text-sm text-white shadow-[0_20px_40px_-16px_rgba(0,0,0,0.6)]"
      >
        <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-full bg-azul" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M3 8.5l3.2 3L13 4.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span>{aviso} adicionado ao carrinho</span>
        <Link href="/carrinho" onClick={fecharAviso} className="ml-1.5 whitespace-nowrap font-semibold text-azul-ceu hover:text-white">
          Ver carrinho
        </Link>
      </div>
    </div>
  );
}
