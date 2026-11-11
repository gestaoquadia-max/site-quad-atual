"use client";

import { useEffect, useState } from "react";

// O preço do título da Black Friday ("R$ 277,00") aparece letra a letra, como se estivesse sendo digitado, com o
// cursor piscando no fim. O texto inteiro fica reservado (invisível) por baixo, então o título não muda de largura
// enquanto digita. Leitores de tela recebem o texto inteiro de uma vez; com "menos movimento" no sistema, ele já
// aparece completo.
const ATRASO_INICIAL = 450;
const POR_LETRA = 110;
const CURSOR_DEPOIS = 2600;

export default function PrecoDigitando({ texto, className = "" }: { texto: string; className?: string }) {
  const [letras, setLetras] = useState(0);
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (semMovimento) {
      timers.push(setTimeout(() => (setLetras(texto.length), setCursor(false)), 0));
    } else {
      for (let i = 1; i <= texto.length; i++) timers.push(setTimeout(() => setLetras(i), ATRASO_INICIAL + i * POR_LETRA));
      timers.push(setTimeout(() => setCursor(false), ATRASO_INICIAL + texto.length * POR_LETRA + CURSOR_DEPOIS));
    }
    return () => timers.forEach(clearTimeout);
  }, [texto]);

  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className="sr-only">{texto}</span>
      {/* Reserva a largura do texto inteiro. */}
      <span aria-hidden="true" className="invisible">
        {texto}
      </span>
      {/* O degradê ocupa a largura do texto inteiro: cada letra já nasce na cor final dela. */}
      <span aria-hidden="true" className={`absolute inset-0 flex items-baseline ${className}`}>
        <span>{texto.slice(0, letras)}</span>
        {cursor && (
          <span className="ml-[0.04em] inline-block h-[0.8em] w-[0.06em] translate-y-[0.06em] animate-[q-cursor_1s_steps(1)_infinite] self-center bg-laranja-claro" />
        )}
      </span>
    </span>
  );
}
