"use client";

import { useEffect, useRef } from "react";
import { emReais } from "@/lib/loja";

export type LinhaDaRevisao = { id: string; nome: string; detalhe: string; valorEmCentavos: number | null };

// Espelho do pedido antes de cobrar (30/10/2026): o aluno confere itens, desconto, acréscimo, total e a forma de
// pagamento, e só então confirma. Fecha com Esc ou "Voltar e editar" (menos durante o pagamento).
export default function RevisaoDoPedido({
  linhas,
  desconto,
  acrescimoEmCentavos,
  totalEmCentavos,
  gratuito,
  pagamento,
  rotuloDoBotao,
  enviando,
  onConfirmar,
  onVoltar,
}: {
  linhas: LinhaDaRevisao[];
  desconto: { cupom: string; valorEmCentavos: number } | null;
  acrescimoEmCentavos: number;
  totalEmCentavos: number;
  gratuito: boolean;
  pagamento: string[];
  rotuloDoBotao: string;
  enviando: boolean;
  onConfirmar: () => void;
  onVoltar: () => void;
}) {
  const confirmar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmar.current?.focus();
    const rolagem = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = rolagem;
    };
  }, []);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !enviando) onVoltar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [enviando, onVoltar]);

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-marinho-950/60 p-4 backdrop-blur-[2px]" onClick={() => !enviando && onVoltar()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="revisao-titulo"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-[520px] animate-[q-aparecer_220ms_ease_both] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_40px_80px_-30px_rgba(7,20,38,0.6)]"
      >
        <div className="border-b border-linha px-6 pb-4 pt-6">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-azul-forte">Revise antes de confirmar</span>
          <h2 id="revisao-titulo" className="mt-1.5 font-display text-[24px] font-extrabold tracking-[-0.02em] text-tinta">
            Seu pedido
          </h2>
        </div>

        <div className="overflow-y-auto px-6 py-4">
          <ul>
            {linhas.map((l) => (
              <li key={l.id} className="flex justify-between gap-4 border-b border-[#EEF2F7] py-3 text-sm">
                <span className="min-w-0">
                  <span className="block font-semibold text-tinta">{l.nome}</span>
                  <span className="text-[12.5px] text-ardosia">{l.detalhe}</span>
                </span>
                <span className="whitespace-nowrap font-semibold [font-variant-numeric:tabular-nums]">
                  {l.valorEmCentavos === null ? "—" : l.valorEmCentavos === 0 ? "Gratuito" : emReais(l.valorEmCentavos)}
                </span>
              </li>
            ))}
          </ul>

          {desconto && (
            <div className="flex justify-between gap-4 border-b border-[#EEF2F7] py-2.5 text-sm">
              <span className="text-ardosia-escura">
                Cupom <span className="font-semibold text-azul-forte">{desconto.cupom}</span>
              </span>
              <span className="font-semibold text-[#13774A]">− {emReais(desconto.valorEmCentavos)}</span>
            </div>
          )}
          {acrescimoEmCentavos > 0 && (
            <div className="flex justify-between gap-4 border-b border-[#EEF2F7] py-2.5 text-sm">
              <span className="text-ardosia-escura">Acréscimo do parcelamento</span>
              <span className="whitespace-nowrap font-semibold [font-variant-numeric:tabular-nums]">+ {emReais(acrescimoEmCentavos)}</span>
            </div>
          )}
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-display text-[26px] font-extrabold tracking-[-0.03em] [font-variant-numeric:tabular-nums]">
              {gratuito ? "Gratuito" : emReais(totalEmCentavos)}
            </span>
          </div>

          <div className="mt-4 rounded-xl bg-nevoa px-4 py-3">
            <span className="text-[11.5px] font-bold uppercase tracking-[0.1em] text-ardosia">Pagamento</span>
            {pagamento.map((p) => (
              <p key={p} className="mt-1 text-[14.5px] font-semibold text-tinta">
                {p}
              </p>
            ))}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2.5 border-t border-linha px-6 py-4 sm:flex-row">
          <button type="button" onClick={onVoltar} disabled={enviando} className="btn-q btn-q-contorno h-12 flex-1 px-5 text-[15px] disabled:opacity-60">
            Voltar e editar
          </button>
          <button
            ref={confirmar}
            type="button"
            onClick={onConfirmar}
            disabled={enviando}
            aria-busy={enviando || undefined}
            className="btn-q btn-q-azul h-12 flex-[1.4] px-5 text-[15px] disabled:cursor-progress disabled:bg-[#4D8DFF]"
          >
            {enviando ? "Processando…" : rotuloDoBotao}
          </button>
        </div>
      </div>
    </div>
  );
}
