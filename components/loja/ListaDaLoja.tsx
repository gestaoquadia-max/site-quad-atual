"use client";

import { useState } from "react";
import { categoriasDaLoja, type ProdutoDaLoja } from "@/lib/conteudo";
import { CartaoProdutoDaLoja } from "../home/Cartoes";

// Grade da loja com o filtro de categorias (só aparecem as que têm produto).
export default function ListaDaLoja({ produtos }: { produtos: ProdutoDaLoja[] }) {
  const [categoria, setCategoria] = useState<string | null>(null);
  const categorias = categoriasDaLoja.filter((c) => produtos.some((p) => p.categoria === c.id));
  const visiveis = produtos.filter((p) => !categoria || p.categoria === categoria);
  const titulo = categoria ? categoriasDaLoja.find((c) => c.id === categoria)?.nome : "Todos os produtos";

  return (
    <>
      {categorias.length > 1 && (
        <div role="group" aria-label="Categorias" className="flex flex-wrap gap-2">
          {[null, ...categorias.map((c) => c.id)].map((id) => {
            const ligado = categoria === id;
            return (
              <button
                key={id ?? "todos"}
                type="button"
                aria-pressed={ligado}
                onClick={() => setCategoria(id)}
                className={`h-10 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors ${
                  ligado ? "border-marinho-950 bg-marinho-950 text-white" : "border-linha-forte bg-white text-ardosia-escura hover:border-azul hover:text-azul"
                }`}
              >
                {id ? categoriasDaLoja.find((c) => c.id === id)?.nome : "Todos"}
              </button>
            );
          })}
        </div>
      )}
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="titulo-secao">{titulo}</h2>
        <span className="text-sm text-ardosia" aria-live="polite">
          {visiveis.length === 1 ? "1 produto" : `${visiveis.length} produtos`}
        </span>
      </div>
      {visiveis.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-[clamp(16px,1.6vw,24px)]">
          {visiveis.map((p) => (
            <CartaoProdutoDaLoja key={p.id} produto={p} fundo="branco" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 rounded-[18px] border-[1.5px] border-dashed border-[#C9D3E0] px-5 py-12 text-center">
          <span className="font-display text-lg font-extrabold">Nenhum produto por aqui ainda</span>
          <span className="text-sm text-ardosia">Novos produtos aparecem aqui assim que forem cadastrados.</span>
        </div>
      )}
    </>
  );
}
