"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Evento } from "@/lib/data";
import { paraCartao, seloDoEvento } from "@/lib/eventos";
import CartaoEvento from "../home/CartaoEvento";

type Filtro = "todos" | "abertas" | "breve";

const FILTROS: { valor: Filtro; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "abertas", rotulo: "Inscrições abertas" },
  { valor: "breve", rotulo: "Em breve" },
];

const CORES_DO_SELO = {
  aberta: "bg-sucesso-fundo text-sucesso",
  breve: "bg-azul-palido text-azul-forte",
  esgotado: "bg-[#FFF0D9] text-[#8A4B00]",
  encerrado: "bg-[#EEF2F7] text-[#4A5A70]",
};

// Arte do evento (1:1). Enquanto não há arte cadastrada, o fundo leva o logo do Quad em marca d'água.
export function ArteDoEvento({ className = "" }: { className?: string }) {
  return (
    <div className={`relative aspect-square overflow-hidden bg-marinho-900 ${className}`}>
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_10%,rgba(47,134,255,0.32),transparent_70%),linear-gradient(200deg,#12305A,#071426_75%)]" />
      <Image
        src="/images/quad-logo-branco.png"
        alt=""
        aria-hidden="true"
        width={236}
        height={88}
        className="pointer-events-none absolute left-1/2 top-1/2 w-[42%] -translate-x-1/2 -translate-y-1/2 opacity-[0.12]"
      />
    </div>
  );
}

export default function AgendaDeEventos({ eventos }: { eventos: Evento[] | null }) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const lista = eventos ?? [];
  const destaque = lista.find((e) => e.status === "aberta");
  const visiveis = lista.filter((e) => filtro === "todos" || (filtro === "abertas" ? e.status === "aberta" : e.status === "breve"));
  const fichaDoDestaque = destaque?.detalhe?.specs.filter((s) => ["Data", "Horário", "Formato"].includes(s.label)) ?? [];

  return (
    <>
      <section className="relative overflow-hidden bg-marinho-950 pb-[clamp(56px,7vw,96px)] pt-[clamp(40px,5vw,64px)] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_60%_at_25%_60%,rgba(0,107,255,0.22),transparent_70%)]" />
        <div className="conteiner relative">
          <nav aria-label="Trilha" className="mb-[clamp(28px,4vw,48px)] flex gap-2 text-[13px] text-[#7F90A8]">
            <Link href="/" className="text-prata hover:text-white">
              Início
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-[#DCE4EF]">
              Eventos
            </span>
          </nav>
          <h1 className="mb-[clamp(28px,3vw,40px)] font-display text-[clamp(2.6rem,5.6vw,5rem)] font-extrabold leading-none tracking-[-0.045em]">Agenda Quad</h1>

          {destaque ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-center gap-[clamp(32px,5vw,80px)]">
              <ArteDoEvento className="max-w-[560px] rounded-[20px] border border-white/10 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.85)]" />
              <div>
                <span className="text-[15px] font-semibold text-azul-ceu">Próximo evento</span>
                <h2 className="mb-3.5 mt-3 font-display text-[clamp(2.2rem,4.4vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">{destaque.nome}</h2>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${CORES_DO_SELO[seloDoEvento(destaque).tom]}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {seloDoEvento(destaque).texto}
                </span>
                <p className="mt-4 max-w-[560px] text-[17px] leading-[1.6] text-[#C9D5E5]">{destaque.detalhe?.lead ?? destaque.desc}</p>
                {fichaDoDestaque.length > 0 && (
                  <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
                    {fichaDoDestaque.map((s) => (
                      <div key={s.label}>
                        <dt className="text-[12.5px] text-prata">{s.label}</dt>
                        <dd className="mt-0.5 font-display text-lg font-extrabold">{s.valor}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <Link
                  href={`/eventos/${destaque.slug}`}
                  className="btn-q btn-q-azul mt-7 h-[54px] px-6 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_16px_36px_-14px_rgba(0,107,255,1)]"
                >
                  Ver evento
                </Link>
              </div>
            </div>
          ) : (
            <p className="max-w-[560px] text-[clamp(16px,1.4vw,18.5px)] leading-[1.6] text-[#B4C1D3]">
              Simulados, aulões, palestras e os grandes encontros da comunidade Quad.
            </p>
          )}
        </div>
      </section>

      <section className="bg-nevoa py-[clamp(56px,7vw,96px)]">
        <div className="conteiner">
          <div className="mb-[clamp(24px,3vw,36px)] flex flex-wrap items-end justify-between gap-4">
            <h2 className="titulo-secao">Próximos eventos</h2>
            {lista.length > 0 && (
              <div role="group" aria-label="Situação" className="flex flex-wrap gap-2">
                {FILTROS.map((f) => (
                  <button
                    key={f.valor}
                    type="button"
                    aria-pressed={filtro === f.valor}
                    onClick={() => setFiltro(f.valor)}
                    className={`h-[38px] whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors ${
                      filtro === f.valor ? "border-marinho-950 bg-marinho-950 text-white" : "border-[#D3DCE7] bg-white text-ardosia-escura hover:border-azul"
                    }`}
                  >
                    {f.rotulo}
                  </button>
                ))}
              </div>
            )}
          </div>

          {eventos === null ? (
            <p role="alert" className="rounded-2xl border border-[#9B3535]/30 bg-[#9B3535]/[0.06] p-6 text-center text-sm text-[#9B3535]">
              Não foi possível carregar a agenda agora. Tente novamente em instantes.
            </p>
          ) : visiveis.length === 0 ? (
            <div className="flex flex-col items-center gap-2.5 rounded-[18px] border-[1.5px] border-dashed border-[#C9D3E0] px-5 py-[clamp(40px,5vw,64px)] text-center">
              <span className="font-display text-[22px] font-extrabold">
                {lista.length === 0 ? "Nenhum evento com inscrições abertas" : "Nenhum evento nesta situação"}
              </span>
              <span className="max-w-[460px] text-[15px] text-ardosia">
                Aulões, palestras e encontros aparecem aqui assim que as inscrições abrirem. Os simulados ficam na central logo abaixo.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,290px),1fr))] gap-5">
              {visiveis.map((e) => (
                <CartaoEvento key={e.slug} evento={paraCartao(e)} />
              ))}
            </div>
          )}

          <Link
            href="/simulados"
            className="group mt-[clamp(48px,6vw,80px)] grid overflow-hidden rounded-[22px] bg-marinho-950 text-white shadow-[0_40px_80px_-40px_rgba(7,20,38,0.8)] hover:text-white md:grid-cols-2"
          >
            <div className="flex flex-col items-start justify-center gap-4 bg-[radial-gradient(70%_80%_at_100%_50%,rgba(0,107,255,0.18),transparent_70%)] p-[clamp(28px,4.5vw,60px)]">
              <h2 className="font-display text-[clamp(2.2rem,4.2vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">Simulados do Quad</h2>
              <p className="max-w-[480px] text-[17px] leading-[1.6] text-[#C9D5E5]">
                Escolha sua carreira e encontre simulados presenciais, digitais, impressos e combos para sua preparação.
              </p>
              <span className="btn-q btn-q-azul mt-2 h-[52px] px-6 text-base">Explorar simulados</span>
            </div>
            <ArteDoEvento className="!aspect-auto min-h-[260px]" />
          </Link>
        </div>
      </section>
    </>
  );
}
