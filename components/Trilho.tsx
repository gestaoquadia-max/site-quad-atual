"use client";

import Link from "next/link";
import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Reveal from "./Reveal";

type Tema = "claro" | "escuro" | "vinho";

const CORES: Record<Tema, { link: string; seta: string }> = {
  claro: {
    // #144AFF e não #006BFF: sobre o fundo cinza-claro (#F4F7FB) o azul padrão fica abaixo do contraste 4,5 (WCAG AA).
    link: "text-azul-forte hover:text-marinho-600",
    seta: "border-linha-forte text-tinta hover:border-azul hover:bg-azul-gelo hover:text-azul",
  },
  escuro: {
    link: "text-azul-ceu hover:text-white",
    seta: "border-white/20 text-white hover:border-azul-ceu hover:bg-azul/[0.12]",
  },
  vinho: {
    link: "text-vinho-rosa hover:text-white",
    seta: "border-white/20 text-white hover:border-vinho-rosa hover:bg-azul/[0.12]",
  },
};

// Largura de cada cartão: 3 ou 4 por linha no computador; no celular, um cartão e meio à vista.
const COLUNAS = {
  3: { gridAutoColumns: "min(86%, max(280px, calc((100% - 48px) / 3)))", gap: 24 },
  4: { gridAutoColumns: "min(80%, max(250px, calc((100% - 60px) / 4)))", gap: 20 },
};

function Seta({ direcao }: { direcao: "anterior" | "proximo" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d={direcao === "anterior" ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SetaDoLink() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Seção da Home com título, link "Ver todos" e os cartões numa faixa que rola para o lado.
// As setas só aparecem quando os cartões não cabem na largura.
export default function Trilho({
  titulo,
  link,
  rotulo,
  tema = "claro",
  colunas = 3,
  children,
}: {
  titulo: string;
  link?: { href: string; label: string };
  rotulo: string;
  tema?: Tema;
  colunas?: 3 | 4;
  children: ReactNode;
}) {
  const faixa = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState({ sobra: false, inicio: true, fim: false });

  const medir = useCallback(() => {
    const el = faixa.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const novo = { sobra: max > 8, inicio: el.scrollLeft <= 8, fim: el.scrollLeft >= max - 8 };
    setEstado((e) => (e.sobra === novo.sobra && e.inicio === novo.inicio && e.fim === novo.fim ? e : novo));
  }, []);

  useEffect(() => {
    const el = faixa.current;
    if (!el) return;
    medir();
    el.addEventListener("scroll", medir, { passive: true });
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => {
      el.removeEventListener("scroll", medir);
      observador.disconnect();
    };
  }, [medir]);

  // Avança uma "página" de cartões.
  function rolar(direcao: 1 | -1) {
    const el = faixa.current;
    if (!el) return;
    const cartao = el.firstElementChild?.getBoundingClientRect().width ?? 300;
    const gap = COLUNAS[colunas].gap;
    const porPagina = Math.max(1, Math.floor((el.clientWidth + gap) / (cartao + gap)));
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direcao * porPagina * (cartao + gap), behavior: reduzir ? "auto" : "smooth" });
  }

  const cores = CORES[tema];
  const classeDaSeta = (desativada: boolean) =>
    `grid h-11 w-11 place-items-center rounded-xl border bg-transparent transition-colors ${cores.seta} ${desativada ? "pointer-events-none opacity-35" : ""}`;

  return (
    <>
      <Reveal className="mb-[clamp(28px,3.4vw,40px)] flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <h2 className="titulo-secao flex-auto">{titulo}</h2>
        <div className="flex items-center gap-[18px]">
          {link && (
            <Link href={link.href} className={`inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap font-display text-[15px] font-bold ${cores.link}`}>
              {link.label}
              <SetaDoLink />
            </Link>
          )}
          {estado.sobra && (
            <div className="flex gap-2">
              <button type="button" aria-label="Anterior" disabled={estado.inicio} onClick={() => rolar(-1)} className={classeDaSeta(estado.inicio)}>
                <Seta direcao="anterior" />
              </button>
              <button type="button" aria-label="Próximo" disabled={estado.fim} onClick={() => rolar(1)} className={classeDaSeta(estado.fim)}>
                <Seta direcao="proximo" />
              </button>
            </div>
          )}
        </div>
      </Reveal>
      <div
        ref={faixa}
        role="region"
        aria-label={rotulo}
        tabIndex={0}
        className="sem-barra -mx-1 -mb-[18px] -mt-1.5 grid snap-x snap-mandatory grid-flow-col items-stretch overflow-x-auto overscroll-x-contain scroll-smooth px-1 pb-[18px] pt-1.5 [scroll-padding-inline:4px]"
        style={{ gridAutoColumns: COLUNAS[colunas].gridAutoColumns, gap: COLUNAS[colunas].gap }}
      >
        {Children.map(children, (filho, i) => (
          <Reveal className="h-full min-w-0 snap-start" delay={Math.min(i, 5) * 60}>
            {filho}
          </Reveal>
        ))}
      </div>
    </>
  );
}
