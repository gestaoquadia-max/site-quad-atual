"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

const ESTILO_DO_TITULO = "font-display font-extrabold leading-none tracking-[-0.03em]";
// Embaixo, na largura toda: o tamanho de sempre. Ao lado da insígnia, um pouco menor no computador, para os nomes
// curtos ("RONDESP 19/11") caberem ao lado da insígnia grande.
const CLASSES_DO_TITULO = `${ESTILO_DO_TITULO} text-[clamp(1.9rem,2.6vw,2.4rem)]`;
const CLASSES_DO_TITULO_AO_LADO = `${ESTILO_DO_TITULO} text-[clamp(1.9rem,2.3vw,2.1rem)]`;

// Topo do cartão da próxima turma (Home): rótulo, nome e insígnia. Quando o nome cabe numa linha, ele fica ao lado da
// insígnia, centralizado na altura dela; quando não cabe, vai para baixo, na largura toda do cartão.
export default function CabecalhoDaTurma({ nome, insignia }: { nome: string; insignia: string | null }) {
  const coluna = useRef<HTMLDivElement>(null);
  const medida = useRef<HTMLSpanElement>(null);
  const [umaLinha, setUmaLinha] = useState(true);

  // Mede o nome numa linha só (sem quebra) e compara com o espaço ao lado da insígnia. Mede de novo quando o cartão
  // muda de largura ou a fonte termina de carregar (o tamanho do texto muda).
  useLayoutEffect(() => {
    const c = coluna.current;
    const m = medida.current;
    if (!c || !m) return;
    const medir = () => setUmaLinha(m.offsetWidth <= c.clientWidth);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(c);
    observador.observe(m);
    return () => observador.disconnect();
  }, [nome]);

  const rotulo = <span className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-azul-ceu">Turma presencial</span>;

  // Sem insígnia, o logo do Quad fica pequeno no canto e o nome vai embaixo.
  if (!insignia) {
    return (
      <>
        <div className="flex items-start justify-between gap-4">
          {rotulo}
          <Image src="/images/quad-logo-branco.png" alt="" width={64} height={64} unoptimized className="h-8 w-auto flex-none object-contain opacity-70" />
        </div>
        <h2 className={`mt-4 ${CLASSES_DO_TITULO}`}>{nome}</h2>
      </>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div ref={coluna} className="relative flex w-0 min-w-0 flex-1 flex-col self-stretch">
          {rotulo}
          {/* Cópia invisível do nome, sem quebra, só para medir a largura. */}
          <span ref={medida} aria-hidden="true" className={`pointer-events-none invisible absolute left-0 top-0 whitespace-nowrap ${CLASSES_DO_TITULO_AO_LADO}`}>
            {nome}
          </span>
          {umaLinha && (
            <div className="flex flex-1 items-center pt-2">
              <h2 className={`whitespace-nowrap ${CLASSES_DO_TITULO_AO_LADO}`}>{nome}</h2>
            </div>
          )}
        </div>
        <Image src={insignia} alt="" width={112} height={112} unoptimized className="h-24 w-24 flex-none object-contain sm:h-28 sm:w-28" />
      </div>
      {!umaLinha && <h2 className={`mt-4 ${CLASSES_DO_TITULO}`}>{nome}</h2>}
    </>
  );
}
