"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { INCLUSO_NA_MENTORIA, MENTORIAS_DA_BLACK, PRECO_DA_MENTORIA } from "@/lib/black/mentorias";
import { ContagemAteOFim, SeloDaContagem } from "@/components/blackfriday/materiais/PartesDosMateriais";
import TelasDaMentoria from "./TelasDaMentoria";

// /mentorias no período da Black (prévia da designer de 26/11/2026, "Preview Site Dia 27", aba Mentorias): o topo com as
// telas da plataforma, "O que você recebe" e o quadro do preço. "Garantir minha mentoria" abre a escolha do concurso,
// e cada concurso leva à página dele (/mentorias/<id>), que segue para o checkout da Tutory.

const IMG = "/images/home/black";

export const FUNDO_DA_PAGINA =
  "bg-[radial-gradient(520px_520px_at_0%_420px,rgba(255,110,20,0.6),rgba(242,90,12,0.2)_45%,transparent_75%),radial-gradient(520px_380px_at_100%_0%,rgba(255,122,46,0.35),transparent_70%),linear-gradient(180deg,#1A0F0A_0,#120F0D_520px)]";
export const QUADRO_DO_PRECO =
  "flex flex-col gap-2.5 rounded-3xl border-[1.5px] border-laranja bg-[rgba(12,9,7,0.92)] px-[22px] py-5 text-white shadow-[0_0_0_1px_rgba(255,140,60,0.25),0_0_40px_-4px_rgba(242,90,12,0.55),0_30px_60px_-20px_rgba(0,0,0,0.8)]";
export const BOTAO_LARANJA =
  "btn-q h-14 w-full rounded-[14px] bg-[linear-gradient(180deg,#FF7A2E,#E5530A)] text-[19px] text-white shadow-[0_10px_26px_-8px_rgba(242,90,12,0.8)] hover:text-white disabled:cursor-not-allowed disabled:bg-none disabled:bg-[#2A221D] disabled:text-[#A39790] disabled:shadow-none";

export function ListaDoIncluso() {
  return (
    <ul className="flex flex-col gap-3.5">
      {INCLUSO_NA_MENTORIA.map((t) => (
        <li key={t} className="flex items-center gap-3.5 text-[clamp(16px,1.5vw,19px)] text-[#F3EEEA]">
          <span
            aria-hidden="true"
            className="grid h-7 w-7 flex-none place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#FFB27A,#F25A0C_60%,#B23E06)] text-[15px] font-extrabold text-white shadow-[0_0_12px_rgba(255,110,20,0.7)]"
          >
            ✓
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}

export function RodapeDoPreco() {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-[#2E241E] pt-3 text-[15px] text-[#D6CCC5]">
      <span>Preço válido até 30/11</span>
      <SeloDaContagem />
    </div>
  );
}

const CARTOES = [
  { t: "Aulas na plataforma", d: "Aulas gravadas com os professores do Quad, organizadas pelo edital.", img: `${IMG}/tela-aula.webp` },
  { t: "Metas diárias", d: "Você sabe o que estudar a cada dia, com cronograma semanal.", img: `${IMG}/tela-ipad.webp` },
  { t: "Módulos no celular", d: "Material teórico do seu concurso para estudar onde estiver.", img: null },
];

// A escolha do concurso, sobre a página: um cartão por concurso, com o brasão, que leva à página da mentoria dele.
export function EscolhaDoConcurso({ aoFechar }: { aoFechar: () => void }) {
  const fechar = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    fechar.current?.focus();
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && aoFechar();
    document.addEventListener("keydown", tecla);
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tecla);
      document.body.style.overflow = antes;
    };
  }, [aoFechar]);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-escolha-da-mentoria"
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-2.5 overflow-y-auto bg-[radial-gradient(60%_50%_at_50%_70%,rgba(242,90,12,0.28),transparent_70%),rgba(8,6,5,0.9)] p-6 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && aoFechar()}
    >
      <button
        ref={fechar}
        type="button"
        onClick={aoFechar}
        aria-label="Fechar"
        className="absolute right-7 top-6 grid h-11 w-11 place-items-center rounded-full border border-[#3A2E27] bg-[#17120F] text-[#D6CCC5] hover:text-white"
      >
        ✕
      </button>
      <span className="font-display text-[13px] font-extrabold tracking-[0.18em] text-[#FF9A5C]">MENTORIA · 12 MESES</span>
      <h2
        id="titulo-escolha-da-mentoria"
        className="text-center font-display text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-white"
      >
        Escolha o seu <span className="bg-[linear-gradient(180deg,#FF7A2E,#FF6A1A)] bg-clip-text text-transparent">concurso</span>
      </h2>
      <p className="max-w-[560px] text-center text-[17px] text-[#D6CCC5]">Cada mentoria é montada pelo edital da sua carreira. Toque no brasão para seguir.</p>
      <div className="my-2 grid w-[min(720px,100%)] grid-cols-2 gap-3.5 sm:grid-cols-3">
        {MENTORIAS_DA_BLACK.map((m) => (
          <Link
            key={m.id}
            href={`/mentorias/${m.id}`}
            className="flex aspect-square flex-col items-center justify-center gap-2.5 rounded-[20px] border-[1.5px] border-[#4A3B32] bg-[linear-gradient(180deg,#241B16,#120F0D)] px-2.5 py-3.5 text-white shadow-[0_14px_28px_-14px_rgba(0,0,0,0.9)] transition-[transform,box-shadow,border-color,background] duration-200 hover:-translate-y-1 hover:border-laranja hover:bg-[linear-gradient(180deg,#3A2418,#1A120E)] hover:text-white hover:shadow-[0_0_0_1px_rgba(255,140,60,0.35),0_0_30px_-4px_rgba(242,90,12,0.7)]"
          >
            <Image
              src={m.brasao}
              alt=""
              width={96}
              height={96}
              className="h-[44%] w-auto max-w-[70%] object-contain [filter:drop-shadow(0_8px_12px_rgba(0,0,0,0.6))]"
            />
            <span className="text-center font-display text-[clamp(13px,2.2vw,17px)] font-extrabold leading-tight">{m.nome}</span>
            <span className="font-display text-[11px] font-extrabold tracking-[0.16em] text-[#FF9A5C]">MENTORIA</span>
          </Link>
        ))}
      </div>
      <span className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 rounded-full border-[1.5px] border-laranja px-[18px] py-2 font-display text-base font-extrabold text-white [font-variant-numeric:tabular-nums]">
        <span aria-hidden="true" className="text-[#FF7A2E]">
          ⏱
        </span>
        Todas por {PRECO_DA_MENTORIA} até 30/11 · <ContagemAteOFim />
      </span>
    </div>
  );
}

export default function MentoriasDaBlack({ abrirEscolha = false }: { abrirEscolha?: boolean }) {
  const [escolhendo, setEscolhendo] = useState(abrirEscolha);
  return (
    <div className={`${FUNDO_DA_PAGINA} text-white`}>
      <div className="conteiner flex flex-col gap-8 pb-24 pt-10">
        <nav aria-label="Trilha" className="flex gap-2 text-[15px] text-[#A39790]">
          <Link href="/" className="hover:text-white">
            Início
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold text-white">
            Mentorias
          </span>
        </nav>

        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-[26px]">
            <h1 className="font-display text-[clamp(2.4rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]">
              Mentoria com acompanhamento de <span className="bg-[linear-gradient(180deg,#FF7A2E,#FF6A1A)] bg-clip-text text-transparent">12 meses</span>
            </h1>
            <ListaDoIncluso />
          </div>
          <div className="relative hidden h-[520px] min-w-0 overflow-hidden bg-[radial-gradient(50%_50%_at_50%_45%,rgba(255,110,20,0.4),transparent_70%)] lg:block">
            <TelasDaMentoria className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="grid items-start gap-10 pt-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-[clamp(2rem,3.4vw,2.5rem)] font-extrabold tracking-[-0.035em]">O que você recebe</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-4">
              {CARTOES.map((c) => (
                <div key={c.t} className="flex flex-col gap-3 rounded-[18px] border border-[#2E241E] bg-[#17120F] p-[22px]">
                  {c.img ? (
                    <div className="relative h-[150px] overflow-hidden rounded-xl bg-[#0B0B0C]">
                      <Image src={c.img} alt="" fill sizes="(min-width: 1024px) 280px, 90vw" className="object-cover object-top" />
                    </div>
                  ) : (
                    <div className="relative h-[150px] overflow-hidden rounded-xl bg-[radial-gradient(70%_80%_at_50%_60%,rgba(242,90,12,0.45),#0B0B0C_75%)]">
                      <div className="absolute left-1/2 top-3.5 w-24 -translate-x-[62%] -rotate-[5deg] [filter:drop-shadow(0_14px_18px_rgba(0,0,0,0.75))]">
                        <div className="rounded-[10px] border border-[#3A3A3E] bg-[#0B0B0C] p-[5px]">
                          <div className="relative aspect-[3/4] overflow-hidden rounded-[5px]">
                            <Image src="/images/black-friday/capas/modulo-cfo.webp" alt="" fill sizes="90px" className="object-cover" />
                          </div>
                        </div>
                      </div>
                      <div className="absolute left-1/2 top-[30px] w-[52px] translate-x-[30%] rotate-6 [filter:drop-shadow(0_14px_18px_rgba(0,0,0,0.8))]">
                        <div className="rounded-[11px] border border-[#3A3A3E] bg-[#0B0B0C] p-[3px]">
                          <div className="relative aspect-[9/19] overflow-hidden rounded-lg">
                            <Image src={`${IMG}/tela-celular.webp`} alt="" fill sizes="50px" className="object-cover object-[center_60%]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <b className="font-display text-xl">{c.t}</b>
                  <span className="text-[15px] leading-[1.45] text-[#D6CCC5]">{c.d}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={QUADRO_DO_PRECO}>
            <span className="font-display text-base font-extrabold tracking-[0.14em]">MENTORIA · 12 MESES</span>
            <span className="mb-1.5 mt-3.5 self-center whitespace-nowrap font-display text-[clamp(56px,5.4vw,72px)] font-extrabold leading-none tracking-[-0.045em]">
              {PRECO_DA_MENTORIA}
            </span>
            <button type="button" onClick={() => setEscolhendo(true)} className={BOTAO_LARANJA}>
              Garantir minha mentoria →
            </button>
            <RodapeDoPreco />
          </div>
        </div>
      </div>
      {escolhendo && <EscolhaDoConcurso aoFechar={() => setEscolhendo(false)} />}
    </div>
  );
}
