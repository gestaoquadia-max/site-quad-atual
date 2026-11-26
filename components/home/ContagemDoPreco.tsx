"use client";

import { Fragment, useSyncExternalStore } from "react";
import { FIM_DA_BLACK } from "@/lib/black/periodo";

// "Este preço acaba em": a contagem grande do bloco da Mentoria na Home da Black, até o fim da Black (23h59 de 30/11).
// No servidor (e no primeiro desenho), "--".

function assinar(avisar: () => void) {
  const t = setInterval(avisar, 1000);
  return () => clearInterval(t);
}
const segundoAtual = () => Math.floor(Date.now() / 1000);
const semRelogio = () => null;
const dois = (n: number | null) => (n === null ? "--" : String(n).padStart(2, "0"));

export default function ContagemDoPreco() {
  const agora = useSyncExternalStore(assinar, segundoAtual, semRelogio);
  const resta = agora === null ? null : Math.max(0, Math.floor(FIM_DA_BLACK / 1000) - agora);
  const dias = resta === null ? null : Math.floor(resta / 86400);
  const unidades = [
    ...(dias ? [{ r: dias === 1 ? "dia" : "dias", v: dias }] : []),
    { r: "horas", v: resta === null ? null : Math.floor(resta / 3600) % 24 },
    { r: "minutos", v: resta === null ? null : Math.floor(resta / 60) % 60 },
    { r: "segundos", v: resta === null ? null : resta % 60 },
  ];
  return (
    <div className="mt-[clamp(26px,3vw,36px)] flex flex-col items-center gap-3">
      <span className="font-display text-[clamp(14px,1.3vw,16px)] font-extrabold uppercase tracking-[0.2em] text-[#CFC5BE]">Este preço acaba em</span>
      <div className="flex items-start gap-[clamp(10px,2vw,24px)]" role="timer" aria-label="Tempo até o fim do preço da Black Friday">
        {unidades.map((u, i) => (
          <Fragment key={u.r}>
            {i > 0 && (
              <span aria-hidden="true" className="mt-[clamp(18px,2.4vw,30px)] h-2 w-2 rounded-full bg-laranja">
                {" "}
              </span>
            )}
            <span className="flex min-w-[clamp(56px,7vw,96px)] flex-col items-center">
              <span className="font-display text-[clamp(44px,6.4vw,80px)] font-extrabold leading-none tracking-[-0.04em] text-white [font-variant-numeric:tabular-nums]">
                {dois(u.v)}
              </span>
              <span className="mt-1.5 text-[15px] font-semibold text-laranja-claro">{u.r}</span>
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
