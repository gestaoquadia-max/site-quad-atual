"use client";

import { useEffect } from "react";

// Brilho azul que acompanha o mouse dentro dos cartões marcados com data-glow (só com mouse, nunca no toque).
// Um único ouvinte na página: ele liga o cartão sob o cursor (--go) e passa a posição (--mx, --my) para o <Brilho />.
export function OuvinteDoBrilho() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let atual: HTMLElement | null = null;
    let x = 0;
    let y = 0;
    let quadro = 0;
    const apagar = () => {
      atual?.style.setProperty("--go", "0");
      atual = null;
    };
    const mover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return apagar();
      const alvo = (e.target as Element | null)?.closest?.("[data-glow]") as HTMLElement | null;
      if (alvo !== atual) {
        apagar();
        atual = alvo;
        atual?.style.setProperty("--go", "1");
      }
      if (!atual) return;
      x = e.clientX;
      y = e.clientY;
      if (!quadro)
        quadro = requestAnimationFrame(() => {
          quadro = 0;
          if (!atual) return;
          const caixa = atual.getBoundingClientRect();
          atual.style.setProperty("--mx", `${x - caixa.left}px`);
          atual.style.setProperty("--my", `${y - caixa.top}px`);
        });
    };
    document.addEventListener("pointermove", mover, { passive: true });
    document.addEventListener("pointerleave", apagar);
    return () => {
      document.removeEventListener("pointermove", mover);
      document.removeEventListener("pointerleave", apagar);
      cancelAnimationFrame(quadro);
    };
  }, []);
  return null;
}

// Camada do brilho; vai dentro de um elemento com data-glow e position relative.
export function Brilho({ raio = 300, intensidade = 0.16 }: { raio?: number; intensidade?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
      style={{
        opacity: "var(--go, 0)",
        background: `radial-gradient(${raio}px circle at var(--mx, 50%) var(--my, 50%), rgba(0,107,255,${intensidade}), transparent 65%)`,
      }}
    />
  );
}
