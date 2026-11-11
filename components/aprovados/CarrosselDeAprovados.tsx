"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { FotoDeAprovado } from "@/lib/aprovados";

// Carrossel dos aprovados (entrega da designer, 11/11/2026): 4 fotos por vez no computador (2 no tablet, 1 no
// celular), em molduras com borda em degradê e brilho, inclinadas em -2°, 1,5°, -1° e 2°, com a faixa
// "APROVADO · concurso" na base. As cores da moldura e da faixa vêm de app/globals.css (.moldura-de-aprovado), e o
// tema Black Friday troca para o laranja (app/tema-black.css).
const INCLINACOES = ["-rotate-2", "rotate-[1.5deg]", "-rotate-1", "rotate-2"];
const VAO = 24; // px entre as fotos

function porVez() {
  if (typeof window === "undefined") return 4;
  if (window.matchMedia("(min-width: 1024px)").matches) return 4;
  if (window.matchMedia("(min-width: 640px)").matches) return 2;
  return 1;
}

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 10.5l3 3 7-7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CarrosselDeAprovados({ fotos }: { fotos: FotoDeAprovado[] }) {
  const [vis, setVis] = useState(4);
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const ajustar = () => setVis(porVez());
    ajustar();
    window.addEventListener("resize", ajustar);
    return () => window.removeEventListener("resize", ajustar);
  }, []);

  const ultimo = Math.max(0, fotos.length - vis);
  const atual = Math.min(indice, ultimo);
  const ir = (i: number) => setIndice(Math.max(0, Math.min(ultimo, i)));
  const seta = "grid size-14 place-items-center rounded-full text-[22px] transition-opacity disabled:cursor-default disabled:opacity-40";

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-wrap items-center gap-7">
          <h1 className="font-display text-[clamp(2.6rem,5vw,4.2rem)] font-extrabold leading-none tracking-[-0.045em] text-tinta">Aprovados</h1>
          <p className="max-w-[520px] border-l border-tinta/20 pl-6 text-[clamp(16px,1.5vw,20px)] leading-[1.45] text-ardosia-escura">
            Histórias reais de alunos que confiaram no nosso método e hoje fazem parte das forças de segurança.
          </p>
        </div>
        <span className="flex gap-3">
          <button type="button" aria-label="Fotos anteriores" onClick={() => ir(atual - 1)} disabled={atual === 0} className={`${seta} border border-linha-forte text-tinta`}>
            ←
          </button>
          <button type="button" aria-label="Próximas fotos" onClick={() => ir(atual + 1)} disabled={atual === ultimo} className={`${seta} bg-azul text-white`}>
            →
          </button>
        </span>
      </div>

      {/* Folga em volta para o brilho e a inclinação das molduras não serem cortados. */}
      <div className="-mx-5 -mb-10 -mt-7 overflow-hidden px-5 pb-14 pt-11 sm:-mx-10 sm:px-10">
        <ul
          className="flex transition-transform duration-[450ms] [transition-timing-function:cubic-bezier(.2,.7,.2,1)]"
          style={{ gap: VAO, transform: `translateX(calc(${-atual} * (${100 / vis}% + ${VAO / vis}px)))` }}
        >
          {fotos.map((f, i) => (
            <li
              key={f.src}
              aria-hidden={i < atual || i >= atual + vis ? true : undefined}
              className="min-w-0 flex-none"
              style={{ flexBasis: `calc(${100 / vis}% - ${(VAO * (vis - 1)) / vis}px)` }}
            >
              <figure className={`moldura-de-aprovado rounded-[22px] p-1.5 ${INCLINACOES[i % 4]}`}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-[17px] bg-marinho-900">
                  <Image src={`/images/aprovados/${f.src}`} alt={f.alt} fill sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw" className="object-cover" />
                  <figcaption className="faixa-de-aprovado absolute inset-x-0 bottom-0 flex items-center gap-3 px-4 py-3.5">
                    <span className="grid size-9 flex-none place-items-center rounded-full bg-azul">
                      <Check />
                    </span>
                    <span className="flex flex-col leading-[1.1] text-white">
                      <b className="font-display text-lg font-extrabold uppercase">{f.palavra}</b>
                      <span className="text-[15px] font-semibold uppercase">{f.concurso}</span>
                    </span>
                  </figcaption>
                </div>
              </figure>
            </li>
          ))}
        </ul>
      </div>

      {ultimo > 0 && (
        <div className="flex justify-center gap-2.5">
          {Array.from({ length: ultimo + 1 }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir para o grupo ${i + 1} de fotos`}
              aria-current={i === atual ? "true" : undefined}
              onClick={() => ir(i)}
              className={`size-3 rounded-full transition-colors ${i === atual ? "bg-azul" : "bg-[#94A3B8]"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
