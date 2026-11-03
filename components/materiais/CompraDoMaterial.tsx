"use client";

import { useState } from "react";
import type { Produto } from "@/lib/data";
import { useCart } from "@/lib/cart";
import { idDoItem } from "@/lib/itens";
import BotoesDeCompra from "../BotoesDeCompra";
import { FORMATOS_DO_MATERIAL, aVenda, alvoDaOferta, formatoInicial, ofertaDo, rotuloDeIndisponivel, type FormatoDoMaterial } from "@/lib/materiais";

const OPCOES: Record<FormatoDoMaterial, { rotulo: string; dica: string }> = {
  digital: { rotulo: "Digital (PDF)", dica: "Download na área do aluno" },
  impresso: { rotulo: "Impresso", dica: "Retirada no Quad, sem custo" },
};

// Formato, preço e "Adicionar ao carrinho" da página do material. Os dois formatos aparecem sempre; o que o material
// não tem fica desativado. Cada formato tem preço próprio (na API, é um item). O envio do impresso depende do frete.
export default function CompraDoMaterial({ produto }: { produto: Produto }) {
  const { addItem } = useCart();
  const [formato, setFormato] = useState<FormatoDoMaterial>(formatoInicial(produto));
  const oferta = ofertaDo(produto, formato);
  const preco = oferta?.preco ?? produto.preco;
  const temMoeda = preco.startsWith("R$");

  return (
    <>
      <div className="mt-7">
        <div id="formato-do-material" className="mb-2.5 text-[13px] font-semibold text-white">
          Formato
        </div>
        <div role="radiogroup" aria-labelledby="formato-do-material" className="grid max-w-[420px] grid-cols-2 gap-2.5">
          {FORMATOS_DO_MATERIAL.map((f) => {
            const opcao = ofertaDo(produto, f);
            const marcado = formato === f;
            return (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={marcado}
                aria-disabled={!opcao || undefined}
                onClick={opcao ? () => setFormato(f) : undefined}
                className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors ${
                  marcado
                    ? "border-[1.5px] border-azul-vivo bg-azul/[0.14]"
                    : opcao
                      ? "border border-white/[0.14] bg-white/[0.03] hover:border-white/30"
                      : "cursor-not-allowed border border-white/[0.08] opacity-50"
                }`}
              >
                <span className={`h-[18px] w-[18px] flex-none rounded-full ${marcado ? "border-[5px] border-azul-vivo bg-white" : "border-[1.5px] border-[#6B7C94]"}`} />
                <span className="flex flex-col gap-0.5">
                  <span className="font-display text-[15px] font-bold">{OPCOES[f].rotulo}</span>
                  <span className="text-[12.5px] text-prata">{!opcao ? "Indisponível neste material" : !aVenda(opcao) ? `${opcao.preco} · ${rotuloDeIndisponivel(opcao)}` : `${opcao.preco} · ${OPCOES[f].dica}`}</span>
                </span>
              </button>
            );
          })}
        </div>
        {formato === "impresso" && (
          <p className="mt-2.5 text-[12.5px] text-prata">O envio do impresso pelo correio, com frete calculado pelo CEP, chega em breve.</p>
        )}
        {formato === "digital" && (
          <p className="mt-2.5 text-[12.5px] text-prata">Depois do pagamento, o PDF fica em Minhas compras, na área do aluno. Cada conta compra uma vez.</p>
        )}
      </div>
      <div className="mt-7 flex items-baseline gap-2">
        {temMoeda && <span className="font-display text-lg font-bold text-prata">R$</span>}
        <span className="font-display text-[clamp(44px,5vw,56px)] font-extrabold leading-none tracking-[-0.035em] [font-variant-numeric:tabular-nums]">
          {temMoeda ? preco.slice(3) : preco}
        </span>
      </div>
      <BotoesDeCompra
        className="mt-6 max-w-[420px]"
        desabilitado={!aVenda(oferta)}
        rotuloDesabilitado={oferta ? rotuloDeIndisponivel(oferta) : "Indisponível"}
        adicionar={() => {
          if (!oferta) return;
          addItem({
            id: `${idDoItem("produto", oferta.slug)}${formato === "impresso" ? ":impresso" : ""}`,
            tipo: "produto",
            nome: produto.nome,
            tag: formato === "impresso" ? "Impresso · Retirar no Quad" : "PDF · Download na área do aluno",
            preco: oferta.preco,
            formato,
            alvo: oferta.idNaApi ? alvoDaOferta(oferta, formato) : undefined,
          });
        }}
      />
    </>
  );
}
