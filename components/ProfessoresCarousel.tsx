"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Professor } from "@/lib/data";
import { getIniciais } from "@/lib/format";

export default function ProfessoresCarousel({ professores }: { professores: Professor[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  function scrollByCards(direction: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    if (!card) return;
    const gap = 20;
    const delta = direction * (card.offsetWidth + gap);

    const start = el.scrollLeft;
    const startTime = performance.now();
    const duration = 400;

    function step(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el!.scrollLeft = start + delta * eased;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  return (
    <div>
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-hidden scroll-smooth pb-2"
      >
        {professores.map((p) => (
          <Link
            key={p.slug}
            href={`/professores/${p.slug}`}
            onMouseEnter={() => setHovered(p.slug)}
            onMouseLeave={() => setHovered(null)}
            className={`focus-ring w-full flex-shrink-0 snap-start overflow-hidden bg-navy-mid transition-all duration-300 sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)] ${
              hovered && hovered !== p.slug ? "opacity-60 blur-sm" : "opacity-100 blur-0"
            }`}
          >
            <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-gradient-to-br from-navy to-navy-mid">
              {p.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.fotoUrl} alt={p.nome} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <span className="font-display text-5xl font-bold text-white/10">{getIniciais(p.nome)}</span>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-deep/95 to-transparent px-4 pb-3 pt-10">
                <div className="font-display text-base font-bold text-offwhite">{p.nome}</div>
              </div>
            </div>
            <div className="p-4">
              <p className="mb-3 text-xs leading-relaxed text-steel-light">{p.bio}</p>
              <span className="inline-block rounded-full bg-blue/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue">
                {p.materia}
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => scrollByCards(-1)}
          aria-label="Anterior"
          className="focus-ring flex h-10 w-10 items-center justify-center border border-white/20 text-offwhite transition-colors hover:border-blue hover:text-blue"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => scrollByCards(1)}
          aria-label="Próximo"
          className="focus-ring flex h-10 w-10 items-center justify-center border border-white/20 text-offwhite transition-colors hover:border-blue hover:text-blue"
        >
          →
        </button>
      </div>
    </div>
  );
}
