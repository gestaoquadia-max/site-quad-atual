"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { emReais } from "@/lib/loja";
import { paginaDoSugerido, precoDaSugestao, variacoesAVenda, type SugestaoDaVitrine, type VariacaoSugerida } from "@/lib/sugestoes";

// O cartão de uma sugestão de venda, o mesmo em todos os lugares: imagem, o rótulo do tipo, o nome, a chamada, o
// preço e um botão. Só com as classes e cores do tema (fica certo no azul e no laranja e preto da Black Friday).

export function rotuloDaSugestao(s: SugestaoDaVitrine) {
  if (s.combo) return "Leve o combo";
  return s.tipo === "UP_SELL" ? "Mais completo" : s.tipo === "CROSS_SELL" ? "Leve junto" : "Mais em conta";
}

export type AcaoDoCartao = { rotulo: string; aoEscolher: (variacao?: VariacaoSugerida) => void };

export default function CartaoDaSugestao({ sugestao, acao, grande = false }: { sugestao: SugestaoDaVitrine; acao: AcaoDoCartao; grande?: boolean }) {
  const variacoes = sugestao.combo ? [] : variacoesAVenda(sugestao);
  const [variacaoId, setVariacaoId] = useState("");
  const variacao = variacoes.find((v) => v.id === variacaoId);
  const precisaEscolher = variacoes.length > 0;
  const centavos = precoDaSugestao(sugestao, variacao);
  const nome = sugestao.combo?.nome ?? sugestao.produto?.nome ?? "";
  const imagem = sugestao.combo?.imagemUrl ?? sugestao.produto?.imagemUrl ?? null;
  const pagina = paginaDoSugerido(sugestao);
  const precoCheio = sugestao.combo?.precoCheioEmCentavos ?? null;
  const ehCombo = !!sugestao.combo;

  const titulo = (
    <span className={`font-display font-extrabold leading-[1.2] tracking-[-0.01em] text-tinta ${grande ? "text-[22px]" : "text-[15.5px]"}`}>{nome}</span>
  );

  return (
    <article className={`flex gap-3.5 rounded-[16px] border border-linha bg-superficie p-3.5 shadow-cartao ${grande ? "flex-col sm:flex-row sm:p-5" : ""}`}>
      <div className={`relative flex-none overflow-hidden rounded-[10px] bg-nevoa ${grande ? "aspect-square w-full sm:w-[220px]" : "h-[72px] w-[72px]"}`}>
        {imagem ? (
          <Image src={imagem} alt="" fill sizes={grande ? "(min-width: 640px) 220px, 100vw" : "72px"} className="object-cover" />
        ) : (
          <span aria-hidden="true" className="grid h-full w-full place-items-center font-display text-lg font-extrabold text-azul">
            Q
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="inline-flex h-5 items-center self-start rounded-[5px] bg-azul-palido px-[7px] text-[10.5px] font-bold uppercase tracking-[0.08em] text-azul-forte">
          {rotuloDaSugestao(sugestao)}
        </span>
        {pagina && !ehCombo ? (
          <Link href={pagina} className="hover:underline">
            {titulo}
          </Link>
        ) : (
          titulo
        )}
        {sugestao.chamada && <p className="text-[13.5px] leading-[1.45] text-ardosia">{sugestao.chamada}</p>}

        {precisaEscolher && (
          <label className="mt-1 flex flex-col gap-1 text-[12.5px] font-semibold text-ardosia">
            Escolha a opção
            <select
              value={variacaoId}
              onChange={(e) => setVariacaoId(e.target.value)}
              className="h-10 rounded-[9px] border border-linha-forte bg-superficie px-2.5 text-[14px] font-medium text-tinta"
            >
              <option value="">Selecione</option>
              {variacoes.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-2 pt-1">
          {centavos !== null && (
            <span className="flex flex-col">
              {ehCombo && precoCheio !== null && precoCheio > centavos && (
                <s className="text-[12.5px] text-ardosia [font-variant-numeric:tabular-nums]">{emReais(precoCheio)}</s>
              )}
              <span className="whitespace-nowrap font-display text-[17px] font-extrabold text-tinta [font-variant-numeric:tabular-nums]">
                {centavos === 0 ? "Gratuito" : emReais(centavos)}
              </span>
            </span>
          )}
          {ehCombo ? (
            pagina && (
              <Link href={pagina} aria-label={`Ver o combo ${nome}`} className="btn-q btn-q-azul h-10 whitespace-nowrap rounded-[10px] px-4 text-[14px]">
                Ver o combo
              </Link>
            )
          ) : (
            <button
              type="button"
              onClick={() => acao.aoEscolher(variacao)}
              disabled={precisaEscolher && !variacao}
              aria-label={`${acao.rotulo}: ${nome}`}
              className="btn-q btn-q-azul h-10 whitespace-nowrap rounded-[10px] px-4 text-[14px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {acao.rotulo}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
