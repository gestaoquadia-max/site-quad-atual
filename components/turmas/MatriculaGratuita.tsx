"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ErroDaApi } from "@/lib/http";
import { matricularSeDeGraca } from "@/lib/loja";
import { rotaComDestino } from "@/lib/redirecionamento";
import { useSessaoAtiva } from "@/lib/usuario";

// Turma gratuita: matrícula direta na conta do aluno, sem carrinho. Sem login, vai para o login e volta para a turma.
export default function MatriculaGratuita({ turmaId }: { turmaId: string }) {
  const router = useRouter();
  const caminho = usePathname();
  const sessaoAtiva = useSessaoAtiva();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function matricular() {
    if (!sessaoAtiva) return router.push(rotaComDestino("/entrar", caminho));
    setErro("");
    setEnviando(true);
    try {
      await matricularSeDeGraca(turmaId);
      router.push("/checkout/confirmacao?status=matricula");
    } catch (e) {
      // 409 JA_MATRICULADO, SALA_LOTADA, TURMA_ENCERRADA…: a mensagem da API já diz o que houve.
      setErro(e instanceof ErroDaApi ? e.message : "Não foi possível fazer a matrícula. Verifique sua internet e tente novamente.");
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <button
        type="button"
        onClick={matricular}
        disabled={enviando}
        aria-busy={enviando || undefined}
        className="btn-q btn-q-azul h-14 w-full rounded-xl text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_16px_36px_-14px_rgba(0,107,255,1)] hover:-translate-y-0.5 disabled:cursor-wait"
      >
        {enviando ? "Matriculando…" : "Fazer matrícula gratuita"}
      </button>
      {erro && (
        <p role="alert" className="rounded-xl border border-[#F1C4C4] bg-[#FFF5F5] p-3 text-[13.5px] leading-[1.5] text-[#9B1C1C]">
          {erro}
        </p>
      )}
    </div>
  );
}
