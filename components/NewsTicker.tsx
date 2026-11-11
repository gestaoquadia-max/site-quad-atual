"use client";

import { useState } from "react";
import type { Evento, Turma } from "@/lib/data";
import { institucional } from "@/lib/institucional";
import { noticiasDaBarra } from "@/lib/noticias";
import { BLACK_FRIDAY } from "@/lib/black-friday";

type Aviso = { rotulo: string; texto: string };

// Avisos sem nada aberto na vitrine.
const AVISOS_FIXOS: Aviso[] = [
  {
    rotulo: "Quad Concursos",
    texto: `Preparação para concursos militares em Feira de Santana${institucional.anoDeFundacao ? ` desde ${institucional.anoDeFundacao}` : ""}`,
  },
  { rotulo: "Simulados", texto: "Simulados do Quad — presenciais, individuais e combos" },
  { rotulo: "Turmas", texto: "Novas turmas presenciais em breve — acompanhe a agenda" },
];

// Primeiro as notícias de concursos (lib/noticias.ts); sem nenhuma, as turmas e eventos abertos na vitrine da API.
function montarAvisos(turmas: Turma[], eventos: Evento[]): Aviso[] {
  const noticias = noticiasDaBarra();
  if (noticias.length > 0) return noticias;
  const avisos: Aviso[] = [
    // O turno (começo do resumo) separa turmas de mesmo nome, como as duas "Core".
    ...turmas
      .filter((t) => t.status === "aberta")
      .map((t) => ({ rotulo: "Turmas", texto: `${t.nome} · ${t.desc.split(" · ")[0]} — ${t.statusLabel.toLowerCase()}` })),
    ...eventos.filter((e) => e.status === "aberta").map((e) => ({ rotulo: "Eventos", texto: `${e.nome} — ${e.tag}` })),
  ].slice(0, 6);
  return avisos.length > 0 ? avisos : AVISOS_FIXOS;
}

const REPETICOES = 4;

// Texto em movimento precisa poder ser pausado (WCAG 2.2.2): botão de pausa e pausa ao passar o mouse. Com
// "menos movimento" no sistema, rola mais devagar (app/globals.css). Leitores de tela recebem a lista uma vez só, sem a animação.
// Transparente (05/11/2026): só um véu leve e o desfoque do que passa por trás. A sombra no texto o mantém legível
// quando um bloco claro passa por trás ao rolar. O botão de pausa fica por cima do texto que rola: um pouco mais
// fechado, para o texto não aparecer através dele.
const VEUS = {
  azul: { fundo: "bg-[rgba(7,20,38,0.22)]", botao: "bg-[rgba(7,20,38,0.55)]" },
  vinho: { fundo: "bg-[rgba(60,12,22,0.22)]", botao: "bg-[rgba(60,12,22,0.55)]" },
  black: { fundo: "bg-[rgba(20,16,14,0.3)]", botao: "bg-[rgba(20,16,14,0.6)]" },
};
export type TomDoTopo = keyof typeof VEUS;

// `tom`: nas páginas das Mentorias a faixa acompanha a cor delas (components/Navbar.tsx).
export default function NewsTicker({ turmas, eventos, tom = "azul" }: { turmas: Turma[]; eventos: Evento[]; tom?: TomDoTopo }) {
  const fundo = `border-b border-white/[0.1] backdrop-blur-[16px] backdrop-saturate-150 ${VEUS[tom].fundo}`;
  const fundoDoBotao = `backdrop-blur-[16px] ${VEUS[tom].botao}`;
  const [pausado, setPausado] = useState(false);
  const noticias = montarAvisos(turmas, eventos);
  const faixa = Array.from({ length: REPETICOES }, () => noticias).flat();

  // Black Friday no site todo (lib/black-friday.ts, 11/11/2026): no lugar das notícias de concursos, a faixa laranja
  // "BLACK FRIDAY · 27/11 · OFERTAS DO QUAD" rolando, com o mesmo botão de pausa.
  if (BLACK_FRIDAY.site) {
    const trecho = Array.from({ length: 8 }, (_, i) => (
      <span key={i} className="inline-flex items-center gap-[18px] pr-[18px]">
        <span className="text-white">BLACK FRIDAY</span>
        <span className="text-breu-800">27/11</span>
        <span className="text-white">OFERTAS DO QUAD</span>
        <span className="text-breu-800">✦</span>
      </span>
    ));
    return (
      <aside
        aria-label="Black Friday do Quad em 27 de novembro"
        className="group relative flex h-[34px] items-center overflow-hidden whitespace-nowrap border-b border-white/[0.18] bg-[linear-gradient(180deg,#FF7A2E,#E5530A)] font-[family-name:var(--font-campanha)] text-[15px] italic"
      >
        <p className="sr-only">Black Friday do Quad em 27 de novembro: ofertas do Quad.</p>
        <div aria-hidden="true" className={`animate-marquee inline-flex w-max ${pausado ? "[animation-play-state:paused]" : ""}`}>
          {[0, 1].map((copia) => (
            <span key={copia} className="inline-flex">
              {trecho}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPausado((v) => !v)}
          aria-pressed={pausado}
          aria-label={pausado ? "Retomar a faixa" : "Pausar a faixa"}
          className="absolute right-0 top-0 flex h-full items-center bg-[#E5530A] px-2.5 font-sans text-[10px] font-bold not-italic text-white"
        >
          {pausado ? "▶" : "❚❚"}
        </button>
      </aside>
    );
  }

  return (
    <aside aria-label="Avisos" className={`group relative flex h-[34px] items-center overflow-hidden whitespace-nowrap text-white transition-colors [text-shadow:0_1px_3px_rgba(0,0,0,0.75)] ${fundo}`}>
      <ul className="sr-only">
        {noticias.map((n, i) => (
          <li key={i}>
            {n.rotulo}: {n.texto}
          </li>
        ))}
      </ul>
      <div aria-hidden="true" className={`animate-marquee inline-flex w-max ${pausado ? "[animation-play-state:paused]" : ""}`}>
        {[0, 1].map((copia) => (
          <span key={copia} className="inline-flex">
            {faixa.map((n, i) => (
              <span key={i} className="inline-flex items-center gap-2.5 px-[22px] text-[13px] font-medium">
                <span className="font-display text-[11px] font-extrabold uppercase tracking-[0.14em] opacity-85">{n.rotulo}</span>
                <span>{n.texto}</span>
                <span className="ml-[22px] h-[5px] w-[5px] bg-white/55" />
              </span>
            ))}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setPausado((v) => !v)}
        aria-pressed={pausado}
        aria-label={pausado ? "Retomar os avisos" : "Pausar os avisos"}
        className={`absolute right-0 top-0 flex h-full items-center px-2.5 text-[10px] font-bold text-white ${fundoDoBotao}`}
      >
        {pausado ? "▶" : "❚❚"}
      </button>
    </aside>
  );
}
