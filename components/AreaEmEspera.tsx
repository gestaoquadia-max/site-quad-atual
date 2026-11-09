"use client";

import type { ReactNode } from "react";
import { useUsuarioAtual } from "@/lib/usuario";

// Só a conta de administrador vê as áreas em espera (lib/em-espera.ts), para acompanhar o desenvolvimento. Alunos,
// professores e visitantes veem o aviso, inclusive enquanto a conta carrega.
export function useVeAreasEmEspera() {
  return useUsuarioAtual()?.tipo === "ADMINISTRADOR";
}

// `aviso`: o que todos veem; `children`: a área de verdade, só para o administrador, com uma faixa avisando que
// os alunos ainda não a veem. O conteúdo chega ao navegador de todos (a página é a mesma para todos, em cache), mas
// só é desenhado para o administrador: a trava das compras continua sendo a da API.
export default function AreaEmEspera({ aviso, children }: { aviso: ReactNode; children: ReactNode }) {
  if (!useVeAreasEmEspera()) return <>{aviso}</>;
  return (
    <>
      <div role="note" className="bg-[#FFF4D6] px-4 py-2 text-center text-[13.5px] font-semibold text-[#6B4E00]">
        Área em espera: só administradores veem esta parte. Os alunos veem o aviso &quot;Em desenvolvimento&quot;.
      </div>
      {children}
    </>
  );
}
