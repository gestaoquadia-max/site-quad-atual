"use client";

import { useState } from "react";
import type { Evento, Turma } from "@/lib/data";

// Avisos sem nada aberto na vitrine.
const AVISOS_FIXOS = [
  "QUAD CONCURSOS · Preparação para concursos militares em Feira de Santana desde 2013",
  "TURMAS · Novas turmas presenciais em breve — acompanhe a agenda",
];

// Enquanto a barra não é editável (Etapa 5, Bloco 3), os avisos saem das turmas e eventos abertos na vitrine da API.
function montarAvisos(turmas: Turma[], eventos: Evento[]) {
  const avisos = [
    // O turno (começo do resumo) separa turmas de mesmo nome, como as duas "Core".
    ...turmas
      .filter((t) => t.status === "aberta")
      .map((t) => `TURMAS · ${t.nome} · ${t.desc.split(" · ")[0]} — ${t.statusLabel.toLowerCase()}`),
    ...eventos.filter((e) => e.status === "aberta").map((e) => `EVENTOS · ${e.nome} — ${e.tag}`),
  ].slice(0, 6);
  return avisos.length > 0 ? avisos : AVISOS_FIXOS;
}

const SEPARADOR = "     •     ";
const REPETICOES = 4;

// Texto em movimento precisa poder ser pausado (WCAG 2.2.2): botão de pausa, pausa ao passar o mouse e parado
// para quem pede menos movimento no sistema. Leitores de tela recebem a lista uma vez só, sem a animação.
export default function NewsTicker({ turmas, eventos }: { turmas: Turma[]; eventos: Evento[] }) {
  const [pausado, setPausado] = useState(false);
  const noticias = montarAvisos(turmas, eventos);
  const texto = (noticias.join(SEPARADOR) + SEPARADOR).repeat(REPETICOES);

  return (
    <aside aria-label="Avisos" className="group relative flex items-center overflow-hidden whitespace-nowrap bg-blue py-1.5">
      <ul className="sr-only">
        {noticias.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>
      <div aria-hidden="true" className={`animate-marquee inline-flex w-max ${pausado ? "[animation-play-state:paused]" : ""}`}>
        <span className="font-display text-xs font-semibold uppercase tracking-wide text-navy-deep">{texto}</span>
        <span className="font-display text-xs font-semibold uppercase tracking-wide text-navy-deep">{texto}</span>
      </div>
      <button
        type="button"
        onClick={() => setPausado((v) => !v)}
        aria-pressed={pausado}
        aria-label={pausado ? "Retomar os avisos" : "Pausar os avisos"}
        className="focus-ring absolute right-0 top-0 flex h-full items-center bg-blue px-2.5 text-[10px] font-bold text-navy-deep motion-reduce:hidden"
      >
        {pausado ? "▶" : "❚❚"}
      </button>
    </aside>
  );
}
