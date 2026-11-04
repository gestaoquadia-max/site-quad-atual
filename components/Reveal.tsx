"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      // Entrada com desfoque: o item surge desfocado e vai entrando em foco enquanto aparece. Depois de visível, o filtro
      // vira "none" (não "blur(0)"), para o invólucro não prender elementos fixos nem pesar na rolagem.
      className={`transition-[opacity,transform,filter] duration-[750ms] ease-[cubic-bezier(.2,.7,.2,1)] ${
        visible ? "translate-y-0 opacity-100 [filter:none]" : "translate-y-2 opacity-0 [filter:blur(12px)]"
      } motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:[filter:none] motion-reduce:transition-none ${className}`}
    >
      {children}
    </div>
  );
}
