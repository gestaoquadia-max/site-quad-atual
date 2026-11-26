"use client";

import Image from "next/image";
import Link from "next/link";
import type { Turma } from "@/lib/data";
import { insigniaDaModalidade } from "@/lib/turmas";
import { cartoesDaBlack, vagasRestantes } from "@/components/turmas/TopoDaBlack";

// "Turmas presenciais: últimas vagas" na Home da Black (prévia da designer de 26/11/2026): um cartão por modalidade com
// turma marcada como Black e aberta, com as vagas que restam, a barra, o preço de/por e "Garantir vaga". Tudo da API;
// sem turma da Black aberta, a seção não aparece.

const INSIGNIA_FIXA: Record<string, string> = {
  rondesp: "/images/home/black/rondesp.webp",
  patamo: "/images/home/black/patamo.webp",
  bope: "/images/home/black/bope.webp",
};

export default function UltimasVagasDasTurmas({ turmas }: { turmas: Turma[] | null }) {
  const daBlack = (turmas ?? []).filter((t) => t.black && !t.isolada);
  const cartoes = cartoesDaBlack(daBlack, turmas).filter((c) => c.turmas.some((t) => t.status === "aberta"));
  if (cartoes.length === 0) return null;

  // O subtítulo só com o que é igual em todas: as vagas por turma e o preço por vaga.
  const abertas = cartoes.flatMap((c) => c.turmas.filter((t) => t.status === "aberta"));
  const totais = new Set(abertas.map((t) => t.detalhe?.vagasTotal));
  const precos = new Set(abertas.map((t) => t.preco));
  const subtitulo = [
    totais.size === 1 && [...totais][0] ? `${[...totais][0]} vagas por turma` : null,
    precos.size === 1 && abertas[0].preco !== "Consulte" ? `${abertas[0].preco} por vaga` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section aria-labelledby="titulo-ultimas-vagas" className="relative pb-[clamp(40px,5vw,64px)] pt-[clamp(32px,4vw,56px)] text-white">
      <div className="conteiner flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
          <h2 id="titulo-ultimas-vagas" className="font-display text-[clamp(2rem,3.4vw,2.5rem)] font-extrabold tracking-[-0.035em]">
            Turmas presenciais: últimas vagas
          </h2>
          {subtitulo && <span className="text-[17px] text-[#D6CCC5]">{subtitulo}</span>}
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-4">
          {cartoes.map((c) => {
            const ref = c.turmas.find((t) => t.status === "aberta") ?? c.turmas[0];
            const vagas = c.turmas.map(vagasRestantes);
            const restam = vagas.every((v) => v !== null) ? vagas.reduce<number>((s, v) => s + (v ?? 0), 0) : null;
            const total = c.turmas.reduce((s, t) => s + (t.detalhe?.vagasTotal ?? 0), 0);
            const pct = restam !== null && total ? Math.round(((total - restam) / total) * 100) : null;
            const insignia = INSIGNIA_FIXA[c.id] ?? insigniaDaModalidade(turmas, c.id);
            const preco = ref.preco === "Consulte" ? null : ref.preco;
            return (
              <article key={c.id} className="flex items-center gap-5 rounded-[20px] border border-[#2E241E] bg-[#17120F] p-[clamp(18px,2vw,24px)]">
                {insignia && (
                  <Image
                    src={insignia}
                    alt=""
                    width={84}
                    height={84}
                    className="h-[clamp(64px,6vw,84px)] w-auto flex-none object-contain [filter:drop-shadow(0_10px_14px_rgba(0,0,0,0.6))]"
                  />
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-[22px] font-extrabold">{c.nome}</h3>
                    {restam !== null && <span className="whitespace-nowrap text-[15px] font-extrabold text-[#FF7A2E]">restam {restam}</span>}
                  </div>
                  {pct !== null && (
                    <div
                      className="h-1.5 overflow-hidden rounded-full bg-[#2E241E]"
                      role="progressbar"
                      aria-label="Vagas preenchidas"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,#FF8A3D,#E5530A)]" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="text-[15px] text-[#A39790]">
                      {preco && ref.precoCheio ? (
                        <>
                          de {ref.precoCheio} por <b className="font-semibold text-[#D6CCC5]">{preco}</b>
                        </>
                      ) : (
                        (preco ?? "Valor a confirmar")
                      )}
                    </span>
                    <Link href={`/turmas?m=${c.id}`} className="whitespace-nowrap font-display text-[15px] font-extrabold text-[#FF7A2E] hover:text-[#FFB27A]">
                      Garantir vaga →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
