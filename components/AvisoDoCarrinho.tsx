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

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-[110] flex max-w-[calc(100vw-32px)] -translate-x-1/2 animate-[q-aparecer_220ms_ease_both] items-center gap-3 rounded-xl border border-white/10 bg-marinho-950 py-3 pl-3.5 pr-4 text-sm text-white shadow-[0_20px_40px_-16px_rgba(0,0,0,0.6)]"
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
  );
}
