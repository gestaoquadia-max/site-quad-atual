"use client";

import { useState } from "react";
import type { Produto } from "@/lib/data";
import { useCart } from "@/lib/cart";
import { idDoItem } from "@/lib/itens";
import BotoesDeCompra from "../BotoesDeCompra";
import { formatosDo } from "@/lib/materiais";

type Formato = "digital" | "impresso";

const OPCOES: { valor: Formato; rotulo: string; dica: string }[] = [
  { valor: "digital", rotulo: "Digital", dica: "Acesso na área do aluno" },
  { valor: "impresso", rotulo: "Impresso", dica: "Retirada no Quad, sem custo" },
];

// Formato, preço e "Adicionar ao carrinho" da página do material. O envio do impresso pelo correio depende do frete.
export default function CompraDoMaterial({ produto }: { produto: Produto }) {
  const { addItem } = useCart();
  const disponiveis = OPCOES.filter((o) => formatosDo(produto).includes(o.valor));
  const [formato, setFormato] = useState<Formato>(disponiveis[0].valor);
  const temMoeda = produto.preco.startsWith("R$");

  return (
    <>
      <div className="mt-7">
        <div id="formato-do-material" className="mb-2.5 text-[13px] font-semibold text-white">
          Formato
        </div>
        <div role="radiogroup" aria-labelledby="formato-do-material" className="grid max-w-[420px] grid-cols-2 gap-2.5">
          {disponiveis.map((o) => {
            const marcado = formato === o.valor;
            return (
              <button
                key={o.valor}
                type="button"
                role="radio"
                aria-checked={marcado}
                onClick={() => setFormato(o.valor)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors ${
                  marcado ? "border-[1.5px] border-azul-vivo bg-azul/[0.14]" : "border border-white/[0.14] bg-white/[0.03] hover:border-white/30"
                }`}
              >
                <span className={`h-[18px] w-[18px] flex-none rounded-full ${marcado ? "border-[5px] border-azul-vivo bg-white" : "border-[1.5px] border-[#6B7C94]"}`} />
                <span className="flex flex-col gap-0.5">
                  <span className="font-display text-[15px] font-bold">{o.rotulo}</span>
                  <span className="text-[12.5px] text-prata">{o.dica}</span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2.5 text-[12.5px] text-prata">O envio do impresso pelo correio, com frete calculado pelo CEP, chega em breve.</p>
      </div>
      <div className="mt-7 flex items-baseline gap-2">
        {temMoeda && <span className="font-display text-lg font-bold text-prata">R$</span>}
        <span className="font-display text-[clamp(44px,5vw,56px)] font-extrabold leading-none tracking-[-0.035em] [font-variant-numeric:tabular-nums]">
          {temMoeda ? produto.preco.slice(3) : produto.preco}
        </span>
      </div>
      <BotoesDeCompra
        className="mt-6 max-w-[420px]"
        desabilitado={produto.esgotado}
        rotuloDesabilitado="Esgotado"
        adicionar={() =>
          addItem({
            id: `${idDoItem("produto", produto.slug)}${formato === "impresso" ? ":impresso" : ""}`,
            tipo: "produto",
            nome: produto.nome,
            tag: formato === "impresso" ? "Impresso · Retirar no Quad" : "Digital",
            preco: produto.preco,
            formato,
            alvo: produto.idNaApi ? { itemId: produto.idNaApi } : undefined,
          })
        }
      />
    </>
  );
}
