"use client";

import { Fragment, useSyncExternalStore } from "react";

// Contagem regressiva até a abertura das ofertas da Black Friday. O relógio só existe no navegador: no servidor (e
// no primeiro desenho) os números aparecem como "--", para não mostrar um tempo errado.
function assinar(avisar: () => void) {
  const t = setInterval(avisar, 1000);
  return () => clearInterval(t);
}
const segundoAtual = () => Math.floor(Date.now() / 1000);
const semRelogio = () => null;

const dois = (n: number) => String(n).padStart(2, "0");

// `compacta`: a versão menor, do bloco da Black Friday na Home.
export default function ContagemDaBlackFriday({ alvo, dataPorExtenso, compacta = false }: { alvo: string; dataPorExtenso: string; compacta?: boolean }) {
  const agora = useSyncExternalStore(assinar, segundoAtual, semRelogio);
  const restante = agora === null ? null : Math.max(0, Math.floor(new Date(alvo).getTime() / 1000) - agora);

  if (restante === 0) {
    return (
      <p className={`${compacta ? "mt-[clamp(26px,3vw,36px)]" : "mt-[clamp(40px,5vw,64px)]"} font-display text-[clamp(14px,1.3vw,16px)] font-extrabold uppercase tracking-[0.2em] text-[#CFC5BE]`}>
        A Black Friday começou
      </p>
    );
  }

  const unidades = [
    { rotulo: "dias", valor: restante === null ? null : Math.floor(restante / 86400) },
    { rotulo: "horas", valor: restante === null ? null : Math.floor(restante / 3600) % 24 },
    { rotulo: "minutos", valor: restante === null ? null : Math.floor(restante / 60) % 60 },
    { rotulo: "segundos", valor: restante === null ? null : restante % 60 },
  ];

  return (
    <>
      <p className={`${compacta ? "mt-[clamp(26px,3vw,36px)]" : "mt-[clamp(40px,5vw,64px)]"} flex flex-wrap items-center justify-center gap-x-3.5 gap-y-2.5 font-display text-[clamp(14px,1.3vw,16px)] font-extrabold uppercase tracking-[0.2em] text-[#CFC5BE]`}>
        As ofertas abrem em
        <span className="inline-flex h-10 items-center rounded-lg bg-laranja px-4 text-[clamp(18px,1.8vw,22px)] normal-case tracking-[-0.01em] text-white shadow-[0_10px_30px_-10px_rgba(242,90,12,0.9)]">
          {dataPorExtenso}
        </span>
      </p>
      {/* Leitores de tela: o tempo restante por extenso, sem anunciar a cada segundo. */}
      <p className="sr-only">{restante === null ? "" : `Faltam ${unidades.map((u) => `${u.valor} ${u.rotulo}`).join(", ")}.`}</p>
      <div aria-hidden="true" className={`${compacta ? "mt-[22px]" : "mt-[34px]"} flex items-start justify-center gap-[clamp(10px,2.6vw,36px)]`}>
        {unidades.map((u, i) => (
          <Fragment key={u.rotulo}>
            {i > 0 && <span className="-mt-[1.6em] h-[9px] w-[9px] self-center rounded-[2px] bg-laranja" />}
            <div className="flex min-w-[1.9ch] flex-col items-center gap-1.5">
              <span className={`font-display ${compacta ? "text-[clamp(2.6rem,6.4vw,4.8rem)]" : "text-[clamp(3.4rem,9vw,7.4rem)]"} font-extrabold leading-none tracking-[-0.05em] text-white [font-variant-numeric:tabular-nums]`}>
                {u.valor === null ? "--" : dois(u.valor)}
              </span>
              <span className="font-display text-[clamp(14px,1.3vw,17px)] font-bold text-laranja-suave">{u.rotulo}</span>
            </div>
          </Fragment>
        ))}
      </div>
    </>
  );
}
