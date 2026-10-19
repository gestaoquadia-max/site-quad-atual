"use client";

import { useState } from "react";
import type { Evento, Turma } from "@/lib/data";

type Aviso = { rotulo: string; texto: string };

// Avisos sem nada aberto na vitrine.
const AVISOS_FIXOS: Aviso[] = [
  { rotulo: "Quad Concursos", texto: "Preparação para concursos militares em Feira de Santana desde 2013" },
  { rotulo: "Simulados", texto: "Simulados do Quad — presenciais, individuais e combos" },
  { rotulo: "Turmas", texto: "Novas turmas presenciais em breve — acompanhe a agenda" },
];

// Enquanto a barra não é editável (Etapa 5, Bloco 3), os avisos saem das turmas e eventos abertos na vitrine da API.
function montarAvisos(turmas: Turma[], eventos: Evento[]): Aviso[] {
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

// Texto em movimento precisa poder ser pausado (WCAG 2.2.2): botão de pausa, pausa ao passar o mouse e parado
// para quem pede menos movimento no sistema. Leitores de tela recebem a lista uma vez só, sem a animação.
export default function NewsTicker({ turmas, eventos }: { turmas: Turma[]; eventos: Evento[] }) {
  const [pausado, setPausado] = useState(false);
  const noticias = montarAvisos(turmas, eventos);
  const faixa = Array.from({ length: REPETICOES }, () => noticias).flat();

  return (
    <aside aria-label="Avisos" className="group relative flex h-[34px] items-center overflow-hidden whitespace-nowrap bg-azul-forte text-white">
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
        className="absolute right-0 top-0 flex h-full items-center bg-azul-forte px-2.5 text-[10px] font-bold text-white motion-reduce:hidden"
      >
        {pausado ? "▶" : "❚❚"}
      </button>
    </aside>
  );
}
