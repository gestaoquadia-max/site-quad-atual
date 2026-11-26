"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PreviaDoModulo } from "@/lib/black/catalogo";

// A prévia de um módulo em tela cheia (LEIA-ME 3.4): as 6 páginas, setas, miniaturas, "N de 6", o download do PDF e
// "Quero o módulo completo →", que só fecha o visor. Esc fecha; as setas do teclado trocam de página.
export default function VisorDaPrevia({ previa, concurso, aoFechar }: { previa: PreviaDoModulo; concurso: string; aoFechar: () => void }) {
  const [pagina, setPagina] = useState(0);
  const total = previa.paginas.length;
  const caixa = useRef<HTMLDivElement>(null);
  // Num ref: quem chama passa uma função nova a cada desenho, e o efeito não precisa se refazer por isso.
  const fechar = useRef(aoFechar);
  useEffect(() => {
    fechar.current = aoFechar;
  }, [aoFechar]);

  useEffect(() => {
    caixa.current?.focus();
    const teclas = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar.current();
      if (e.key === "ArrowRight") setPagina((p) => Math.min(total - 1, p + 1));
      if (e.key === "ArrowLeft") setPagina((p) => Math.max(0, p - 1));
    };
    window.addEventListener("keydown", teclas);
    const rolagem = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", teclas);
      document.body.style.overflow = rolagem;
    };
  }, [total]);

  const seta = "grid h-12 w-12 flex-none place-items-center rounded-full border border-white/20 bg-black/50 text-xl text-white hover:border-white/60 disabled:opacity-30";

  return (
    <div className="fixed inset-0 z-[95] flex flex-col bg-[rgba(8,6,5,0.96)] text-white" onClick={aoFechar}>
      <div
        ref={caixa}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Prévia do ${previa.materia}, ${concurso}`}
        onClick={(e) => e.stopPropagation()}
        className="mx-auto flex h-full w-full max-w-[1100px] flex-col gap-3 px-4 py-4 outline-none sm:px-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-[12px] font-extrabold uppercase tracking-[0.16em] text-laranja-suave">Prévia · {concurso}</p>
            <p className="truncate font-display text-[18px] font-extrabold">{previa.materia}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#D6CCC5] [font-variant-numeric:tabular-nums]">
              {pagina + 1} de {total}
            </span>
            <button type="button" onClick={aoFechar} aria-label="Fechar a prévia" className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-lg hover:border-white/60">
              ✕
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 items-center gap-2 sm:gap-4">
          <button type="button" aria-label="Página anterior" disabled={pagina === 0} onClick={() => setPagina(pagina - 1)} className={`${seta} hidden sm:grid`}>
            ←
          </button>
          <div className="relative h-full min-w-0 flex-1">
            <Image
              key={previa.paginas[pagina]}
              src={previa.paginas[pagina]}
              alt={`Página ${pagina + 1} de ${total} da prévia`}
              fill
              sizes="(min-width: 1100px) 900px, 100vw"
              className="object-contain"
              priority
            />
          </div>
          <button type="button" aria-label="Próxima página" disabled={pagina === total - 1} onClick={() => setPagina(pagina + 1)} className={`${seta} hidden sm:grid`}>
            →
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 sm:hidden">
          <button type="button" aria-label="Página anterior" disabled={pagina === 0} onClick={() => setPagina(pagina - 1)} className={seta}>
            ←
          </button>
          <button type="button" aria-label="Próxima página" disabled={pagina === total - 1} onClick={() => setPagina(pagina + 1)} className={seta}>
            →
          </button>
        </div>

        <ul className="flex justify-center gap-2 overflow-x-auto pb-1">
          {previa.miniaturas.map((m, i) => (
            <li key={m} className="flex-none">
              <button
                type="button"
                aria-label={`Ir para a página ${i + 1}`}
                aria-current={i === pagina || undefined}
                onClick={() => setPagina(i)}
                className={`relative block h-[64px] w-[46px] overflow-hidden rounded-[4px] border-2 ${i === pagina ? "border-laranja" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                <Image src={m} alt="" fill sizes="46px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap justify-center gap-2.5">
          <a
            href={previa.pdf}
            download={previa.arquivo}
            className="btn-q h-12 gap-2 rounded-xl border border-[#4A3B32] px-5 text-[15px] text-white hover:border-white/50 hover:text-white"
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12m0 0-5-5m5 5 5-5M4 21h16" />
            </svg>
            Baixar prévia (PDF)
          </a>
          <button
            type="button"
            onClick={aoFechar}
            className="btn-q h-12 rounded-xl bg-[linear-gradient(180deg,#FF7A2E,#E5530A)] px-5 text-[15px] text-white shadow-[0_10px_26px_-8px_rgba(242,90,12,0.8)]"
          >
            Quero o módulo completo →
          </button>
        </div>
      </div>
    </div>
  );
}
