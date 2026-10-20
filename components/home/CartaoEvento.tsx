"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { useCart } from "@/lib/cart";
import type { DadosDoCartaoEvento, TomDoSelo } from "@/lib/eventos";
import { Brilho } from "../Brilho";
import { PrecoEmDestaque } from "./CartaoMaterial";

const CORES_DO_SELO: Record<TomDoSelo, string> = {
  aberta: "bg-sucesso-fundo text-sucesso",
  breve: "bg-azul-palido text-azul-forte",
  esgotado: "bg-[#FFF0D9] text-[#8A4B00]",
  encerrado: "bg-[#EEF2F7] text-[#4A5A70]",
};

export default function CartaoEvento({ evento }: { evento: DadosDoCartaoEvento }) {
  const { addItem } = useCart();
  const [aberto, setAberto] = useState(false);
  const idDoPainel = useId();

  return (
    <article
      data-glow=""
      className="relative flex h-full flex-col rounded-[18px] border border-linha bg-white p-2 shadow-[0_1px_2px_rgba(16,27,45,0.05),0_12px_28px_-22px_rgba(7,20,38,0.25)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-[3px] hover:border-azul/45 hover:shadow-[0_1px_2px_rgba(16,27,45,0.05),0_28px_52px_-26px_rgba(7,20,38,0.45)]"
    >
      <Brilho intensidade={0.08} />
      {/* Arte do evento (1:1). Enquanto não há arte, o fundo leva o logo do Quad em marca d'água. */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-marinho-900">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_10%,rgba(47,134,255,0.32),transparent_70%),linear-gradient(200deg,#12305A,#071426_75%)]" />
        <Image
          src="/images/quad-logo-branco.png"
          alt=""
          aria-hidden="true"
          width={118}
          height={44}
          className="pointer-events-none absolute left-1/2 top-[44%] w-[42%] -translate-x-1/2 -translate-y-1/2 opacity-[0.12]"
        />
        {evento.data && (
          <div className="pointer-events-none absolute bottom-3 left-3 flex items-stretch overflow-hidden rounded-[10px] bg-white shadow-[0_10px_24px_-10px_rgba(0,0,0,0.55)]">
            <div className="bg-azul px-3 pb-[9px] pt-2 text-center text-white">
              <div className="font-display text-2xl font-extrabold leading-none tracking-[-0.02em] [font-variant-numeric:tabular-nums]">{evento.data.dia}</div>
              <div className="mt-[3px] text-[10.5px] font-bold tracking-[0.16em]">{evento.data.mes}</div>
            </div>
            {evento.data.local && <div className="flex items-center px-3 text-[12.5px] font-semibold text-ardosia-escura">{evento.data.local}</div>}
          </div>
        )}
      </div>
      <div className="relative flex flex-col px-3.5 pb-3 pt-[18px]">
        <div className="flex min-h-[84px] flex-col items-start gap-2">
          <h3 className="line-clamp-2 font-display text-[21px] font-extrabold leading-[1.15] tracking-[-0.02em] [text-wrap:pretty]">{evento.titulo}</h3>
          <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${CORES_DO_SELO[evento.selo.tom]}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {evento.selo.texto}
          </span>
        </div>
        <button
          type="button"
          aria-expanded={aberto}
          aria-controls={idDoPainel}
          onClick={() => setAberto((a) => !a)}
          className="btn-q btn-q-contorno mt-[18px] h-[46px] w-full px-3.5 text-sm"
        >
          Informações
          <svg width="11" height="7" viewBox="0 0 10 6" fill="none" aria-hidden="true" className={`transition-transform duration-200 ${aberto ? "rotate-180" : ""}`}>
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        {aberto && (
          <div id={idDoPainel} className="mt-3.5 animate-[q-surgir_220ms_ease_both] rounded-xl border border-[#E3E9F1] bg-[#F6F9FD] px-4 pb-4 pt-[18px]">
            <p className="text-[14.5px] leading-[1.55] text-ardosia-escura [text-wrap:pretty]">{evento.descricao}</p>
            {evento.preco && (
              <div className="mt-3.5">
                <PrecoEmDestaque preco={evento.preco} claro />
              </div>
            )}
            <div className="mt-3.5 flex flex-wrap gap-2">
              {evento.item && (
                <button type="button" onClick={() => evento.item && addItem(evento.item)} className="btn-q btn-q-azul h-11 min-w-[150px] flex-1 px-3.5 text-sm">
                  Adicionar ao carrinho
                </button>
              )}
              <Link href={evento.href} className="btn-q btn-q-contorno h-11 min-w-[120px] flex-1 px-3.5 text-sm">
                Detalhes
              </Link>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
