"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PRECO_DA_MENTORIA, type MentoriaDaBlack } from "@/lib/black/mentorias";
import { BOTAO_LARANJA, EscolhaDoConcurso, FUNDO_DA_PAGINA, ListaDoIncluso, QUADRO_DO_PRECO, RodapeDoPreco } from "./MentoriasDaBlack";

// /mentorias/<id> na Black (prévia da designer de 26/11/2026): "Você escolheu Mentoria X", o preço e o checkout da Tutory
// daquele concurso. Como no desenho, segue sozinho para o pagamento em 5 s (a barra mostra o tempo); "Trocar de
// concurso" para a contagem e abre a escolha de novo.

const SEGUNDOS = 5;

export default function MentoriaEscolhida({ mentoria }: { mentoria: MentoriaDaBlack }) {
  const [restam, setRestam] = useState(SEGUNDOS * 10);
  const [parado, setParado] = useState(false);
  const [escolhendo, setEscolhendo] = useState(false);

  useEffect(() => {
    if (parado || escolhendo) return;
    if (restam <= 0) {
      window.location.assign(mentoria.checkout);
      return;
    }
    const t = setTimeout(() => setRestam((r) => r - 1), 100);
    return () => clearTimeout(t);
  }, [restam, parado, escolhendo, mentoria.checkout]);

  const segundos = Math.ceil(restam / 10);
  const pct = Math.round(((SEGUNDOS * 10 - restam) / (SEGUNDOS * 10)) * 100);

  return (
    <div className={`${FUNDO_DA_PAGINA} text-white`}>
      <div className="conteiner flex flex-col gap-8 pb-24 pt-10">
        <nav aria-label="Trilha" className="flex flex-wrap gap-2 text-[15px] text-[#A39790]">
          <Link href="/" className="hover:text-white">
            Início
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/mentorias" className="hover:text-white">
            Mentorias
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold text-white">
            Mentoria {mentoria.nome}
          </span>
        </nav>

        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-[26px]">
            <div className="flex items-center gap-[22px]">
              <Image
                src={mentoria.brasao}
                alt={`Brasão ${mentoria.nome}`}
                width={120}
                height={120}
                className="h-[clamp(84px,9vw,120px)] w-auto [filter:drop-shadow(0_0_24px_rgba(255,110,20,0.45))_drop-shadow(0_14px_18px_rgba(0,0,0,0.7))]"
              />
              <div className="flex flex-col gap-2">
                <span className="font-display text-[13px] font-extrabold tracking-[0.18em] text-[#FF9A5C]">VOCÊ ESCOLHEU</span>
                <h1 className="font-display text-[clamp(2.2rem,4.4vw,3.25rem)] font-extrabold leading-[1.02] tracking-[-0.04em]">
                  Mentoria <span className="bg-[linear-gradient(180deg,#FF7A2E,#FF6A1A)] bg-clip-text text-transparent">{mentoria.nome}</span>
                </h1>
              </div>
            </div>
            <ListaDoIncluso />
            <button
              type="button"
              onClick={() => setEscolhendo(true)}
              className="self-start rounded-full border border-[#3A2E27] px-[18px] py-[9px] font-display text-[15px] font-bold text-[#D6CCC5] hover:border-[#5A4536] hover:text-white"
            >
              Trocar de concurso
            </button>
          </div>

          <div className={`${QUADRO_DO_PRECO} gap-3.5 p-[22px]`}>
            <span className="font-display text-base font-extrabold tracking-[0.14em]">MENTORIA · 12 MESES</span>
            <span className="mb-1 mt-2 self-center whitespace-nowrap font-display text-[clamp(56px,5.4vw,72px)] font-extrabold leading-none tracking-[-0.045em]">
              {PRECO_DA_MENTORIA}
            </span>
            <div className="flex flex-col gap-2 rounded-[14px] border border-[#2E241E] bg-[#17120F] p-3.5">
              <span className="text-[15px] text-[#F3EEEA] [font-variant-numeric:tabular-nums]" aria-live="polite">
                {parado || escolhendo ? "Clique abaixo para ir ao pagamento." : `Direcionando para o pagamento em ${segundos}s…`}
              </span>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#2A221D]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#FF8A3D,#E5530A)] transition-[width] duration-100 ease-linear"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {!parado && !escolhendo && (
                <button
                  type="button"
                  onClick={() => setParado(true)}
                  className="self-start text-[13px] font-semibold text-[#A39790] underline hover:text-white"
                >
                  Ficar nesta página
                </button>
              )}
            </div>
            <a href={mentoria.checkout} className={BOTAO_LARANJA}>
              Ir para o pagamento →
            </a>
            <span className="text-center text-sm text-[#A39790]">Pagamento em ambiente seguro · checkout da Mentoria {mentoria.nome}</span>
            <RodapeDoPreco />
          </div>
        </div>
      </div>
      {escolhendo && <EscolhaDoConcurso aoFechar={() => setEscolhendo(false)} />}
    </div>
  );
}
