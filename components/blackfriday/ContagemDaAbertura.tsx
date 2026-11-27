"use client";

import { useSyncExternalStore } from "react";
import { ABERTURA_DAS_VENDAS } from "@/lib/black/periodo";

// A contagem até a abertura das vendas da Black (09:00 de 27/11; pedido de 27/11/2026), no lugar de "Abre 27/11 às
// 09:00": "Abre em 01:23:45". No servidor (e no primeiro desenho), "--:--:--". Zerada, "Abrindo…" (a página se refaz em
// até 1 minuto com os produtos à venda).

function assinar(avisar: () => void) {
  const t = setInterval(avisar, 1000);
  return () => clearInterval(t);
}
const segundoAtual = () => Math.floor(Date.now() / 1000);
const semRelogio = () => null;
const dois = (n: number) => String(n).padStart(2, "0");

// Segundos que faltam para as vendas abrirem (null no servidor).
export function useFaltaParaAbrir() {
  const agora = useSyncExternalStore(assinar, segundoAtual, semRelogio);
  return agora === null ? null : Math.max(0, Math.floor(ABERTURA_DAS_VENDAS / 1000) - agora);
}

export function textoDaContagem(faltam: number | null) {
  return faltam === null ? "--:--:--" : `${dois(Math.floor(faltam / 3600))}:${dois(Math.floor(faltam / 60) % 60)}:${dois(faltam % 60)}`;
}

export default function ContagemDaAbertura({ className = "" }: { className?: string }) {
  const faltam = useFaltaParaAbrir();
  return (
    <span className={`[font-variant-numeric:tabular-nums] ${className}`} role="timer" aria-label="Tempo até a abertura das vendas">
      {faltam === 0 ? "Abrindo…" : `Abre em ${textoDaContagem(faltam)}`}
    </span>
  );
}
