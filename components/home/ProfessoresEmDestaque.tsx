"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Professor } from "@/lib/data";
import { getIniciais } from "@/lib/format";
import Reveal from "@/components/Reveal";
import { SetaDoLink } from "@/components/Trilho";

// Fundo do avatar sem foto: um dos azuis da marca, sempre o mesmo para o mesmo professor.
const FUNDOS = [
  "linear-gradient(135deg,#006BFF 0%,#0B2A55 100%)",
  "linear-gradient(135deg,#5AA2FF 0%,#14315C 100%)",
  "linear-gradient(135deg,#1E5BD8 0%,#071426 100%)",
  "linear-gradient(135deg,#3D8BFF 0%,#1B3A63 100%)",
];

function fundoDe(nome: string) {
  let soma = 0;
  for (const letra of nome) soma = (soma * 31 + letra.charCodeAt(0)) >>> 0;
  return FUNDOS[soma % FUNDOS.length];
}

function CartaoDaFaixa({ professor, copia }: { professor: Professor; copia: boolean }) {
  return (
    <Link
      href={`/professores/${professor.slug}`}
      aria-hidden={copia || undefined}
      tabIndex={copia ? -1 : undefined}
      className="group/cartao flex w-[290px] flex-none items-center gap-4 rounded-[18px] border border-white/[0.08] bg-white/[0.04] p-3 pr-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[border-color,background-color,transform] duration-200 hover:-translate-y-[3px] hover:border-[rgba(111,174,255,0.55)] hover:bg-white/[0.08] hover:text-white sm:w-[320px]"
    >
      <span className="relative grid size-[68px] flex-none place-items-center overflow-hidden rounded-[14px] font-display text-[22px] font-extrabold tracking-[-0.03em] text-white shadow-[0_10px_24px_-12px_rgba(0,107,255,0.8)]" style={{ background: fundoDe(professor.nome) }}>
        {getIniciais(professor.nome)}
        {professor.fotoUrl && <Image src={professor.fotoUrl} alt="" fill sizes="68px" className="object-cover" />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate font-display text-[17px] font-extrabold tracking-[-0.015em]">{professor.nome}</span>
        {professor.materia && <span className="truncate text-[11.5px] font-semibold uppercase tracking-[0.08em] text-azul-ceu">{professor.materia}</span>}
      </span>
      <span aria-hidden="true" className="flex-none text-white/30 transition-[color,transform] duration-200 group-hover/cartao:translate-x-0.5 group-hover/cartao:text-azul-ceu">
        <SetaDoLink />
      </span>
    </Link>
  );
}

// Uma faixa que roda sozinha: duas cópias lado a lado, então -50% volta ao começo sem salto (globals.css).
function Faixa({ professores, sentido }: { professores: Professor[]; sentido: "ida" | "volta" }) {
  const duracao = `${Math.max(40, professores.length * 7)}s`;
  return (
    <div className="[mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <div className="trilha-professores flex w-max" data-sentido={sentido} style={{ ["--duracao" as string]: duracao }}>
        {[false, true].map((copia) => (
          <div key={String(copia)} className="flex flex-none gap-4 pr-4">
            {professores.map((p) => (
              <CartaoDaFaixa key={p.slug} professor={p} copia={copia} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Professores na Home: título e números do time, e duas faixas que rolam em sentidos opostos.
// Param ao passar o mouse, ao focar um cartão e pelo botão (WCAG 2.2.2). Sem minibio: ela fica na página do professor.
export default function ProfessoresEmDestaque({ professores }: { professores: Professor[] }) {
  const [pausado, setPausado] = useState(false);
  const materias = new Set(professores.map((p) => p.materia).filter(Boolean)).size;
  // Poucos professores: uma faixa só, para não repetir os mesmos nomes nas duas.
  const faixas = professores.length < 8 ? [professores] : [professores.filter((_, i) => i % 2 === 0), professores.filter((_, i) => i % 2 === 1)];

  return (
    <section id="professores" className="secao relative overflow-hidden bg-marinho-950 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_60%_at_0%_0%,rgba(0,107,255,0.2),transparent_70%),radial-gradient(40%_55%_at_100%_100%,rgba(0,107,255,0.14),transparent_70%)]" />
      <div className="conteiner relative">
        <Reveal className="mb-[clamp(32px,4vw,52px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div className="max-w-[620px]">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-azul-ceu">Corpo docente</span>
            <h2 className="titulo-secao mt-2">Conheça nossos professores</h2>
            <p className="mt-3 text-[clamp(15.5px,1.3vw,17px)] leading-[1.6] text-prata [text-wrap:pretty]">
              Especialistas em cada matéria do edital, prontos para te levar até a aprovação.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-x-9 gap-y-4">
            <div>
              <div className="font-display text-[clamp(2.4rem,4.4vw,3.6rem)] font-extrabold leading-none tracking-[-0.04em]">{professores.length}</div>
              <div className="mt-1.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-prata">professores</div>
            </div>
            {materias > 1 && (
              <div>
                <div className="font-display text-[clamp(2.4rem,4.4vw,3.6rem)] font-extrabold leading-none tracking-[-0.04em] text-azul-ceu">{materias}</div>
                <div className="mt-1.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-prata">matérias</div>
              </div>
            )}
            <Link href="/professores" className="btn-q btn-q-azul h-12 rounded-[11px] px-5 text-[15px]">
              Ver todos os professores
              <SetaDoLink />
            </Link>
          </div>
        </Reveal>
      </div>

      <div className="faixa-professores relative flex flex-col gap-4" data-pausado={pausado} aria-label="Professores do Quad" role="region">
        {faixas.map((lista, i) => (
          <Faixa key={i} professores={lista} sentido={i === 0 ? "ida" : "volta"} />
        ))}
      </div>

      <div className="conteiner relative mt-5 flex justify-end">
        <button
          type="button"
          onClick={() => setPausado((p) => !p)}
          aria-pressed={pausado}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-white/15 px-4 text-[13px] font-semibold text-prata transition-colors hover:border-azul-ceu hover:text-white"
        >
          <span aria-hidden="true">{pausado ? "▶" : "❚❚"}</span>
          {pausado ? "Continuar" : "Pausar"}
        </button>
      </div>
    </section>
  );
}
