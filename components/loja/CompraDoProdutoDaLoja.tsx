"use client";

import { useState } from "react";
import type { ProdutoDaLoja } from "@/lib/conteudo";
import { useCart } from "@/lib/cart";
import { precoSemCentavosZerados } from "@/lib/format";

const MAXIMO = 20;

// Preço, estoque, variações (tamanho), quantidade, entrega e "Adicionar ao carrinho" do produto da loja.
export default function CompraDoProdutoDaLoja({ produto }: { produto: ProdutoDaLoja }) {
  const { addItem } = useCart();
  const variacoes = produto.variacoes.filter((v) => v.opcoes.length > 0);
  // Começa na primeira opção com estoque de cada variação.
  const [escolha, setEscolha] = useState<Record<string, string | undefined>>(() =>
    Object.fromEntries(variacoes.map((v) => [v.nome, v.opcoes.find((o) => !v.esgotadas.includes(o))])),
  );
  const [quantidade, setQuantidade] = useState(1);

  const esgotado = (produto.estoque !== null && produto.estoque <= 0) || variacoes.some((v) => !escolha[v.nome]);
  const preco = produto.preco === null ? null : precoSemCentavosZerados(produto.preco);
  const estoque =
    produto.estoque === null
      ? { texto: "Disponibilidade a confirmar", classe: "bg-[#EEF2F7] text-ardosia-escura" }
      : esgotado
        ? { texto: "Esgotado", classe: "bg-[#FFF0D9] text-[#8A4B00]" }
        : { texto: "Em estoque", classe: "bg-[#E3F3EA] text-[#13774A]" };
  const textoDaVariacao = variacoes.map((v) => `${v.nome} ${escolha[v.nome]}`).join(" · ");

  function adicionar() {
    if (!preco || esgotado) return;
    addItem(
      {
        id: `loja:${produto.id}${variacoes.map((v) => `:${escolha[v.nome]}`).join("")}`,
        tipo: "loja",
        nome: produto.nome,
        tag: [textoDaVariacao, "Retirar no Quad"].filter(Boolean).join(" · "),
        preco,
      },
      quantidade,
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-baseline gap-3.5">
        <span className="font-display text-[34px] font-extrabold tracking-[-0.03em]">{preco ?? "A confirmar"}</span>
        <span className={`inline-flex h-[26px] items-center whitespace-nowrap rounded-full px-2.5 text-[12.5px] font-semibold ${estoque.classe}`}>{estoque.texto}</span>
      </div>
      {produto.descricao && <p className="text-base leading-[1.6] text-[#3E4A5E]">{produto.descricao}</p>}

      {variacoes.map((v) => (
        <div key={v.nome} role="radiogroup" aria-label={v.nome} className="flex flex-col gap-2.5">
          <span className="font-display text-[14.5px] font-bold">
            {v.nome}
            {escolha[v.nome] && <span className="font-medium text-ardosia"> · {escolha[v.nome]}</span>}
          </span>
          <div className="flex flex-wrap gap-2">
            {v.opcoes.map((o) => {
              const marcada = escolha[v.nome] === o;
              const semEstoque = v.esgotadas.includes(o);
              return (
                <button
                  key={o}
                  type="button"
                  role="radio"
                  aria-checked={marcada}
                  disabled={semEstoque}
                  aria-label={semEstoque ? `${o} (esgotado)` : o}
                  onClick={() => setEscolha((e) => ({ ...e, [v.nome]: o }))}
                  className={`h-[46px] min-w-[52px] rounded-[10px] border px-3.5 font-display text-[15px] font-bold transition-colors ${
                    marcada ? "border-marinho-900 bg-marinho-900 text-white" : "border-linha-forte bg-white text-tinta hover:border-azul"
                  } disabled:cursor-not-allowed disabled:border-linha disabled:bg-nevoa disabled:text-[#97A3B4] disabled:line-through`}
                >
                  {o}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-2.5">
        <span className="font-display text-[14.5px] font-bold" id="quantidade-rotulo">
          Quantidade
        </span>
        <div role="group" aria-labelledby="quantidade-rotulo" className="inline-flex items-center self-start rounded-[11px] border border-linha-forte bg-white">
          <button type="button" aria-label="Diminuir" disabled={quantidade <= 1} onClick={() => setQuantidade((q) => Math.max(1, q - 1))} className="h-[46px] w-[46px] text-xl disabled:opacity-40">
            −
          </button>
          <span aria-live="polite" className="min-w-9 text-center font-display text-base font-extrabold">
            {quantidade}
          </span>
          <button type="button" aria-label="Aumentar" disabled={quantidade >= MAXIMO} onClick={() => setQuantidade((q) => Math.min(MAXIMO, q + 1))} className="h-[46px] w-[46px] text-xl disabled:opacity-40">
            +
          </button>
        </div>
      </div>

      <div role="radiogroup" aria-labelledby="entrega-rotulo" className="flex flex-col gap-2 rounded-[14px] border border-linha bg-white p-4">
        <span id="entrega-rotulo" className="font-display text-[15px] font-extrabold">
          Entrega
        </span>
        <button type="button" role="radio" aria-checked="true" className="flex min-h-12 items-center gap-3 rounded-[10px] border-[1.5px] border-azul bg-azul-gelo px-3 py-2 text-left">
          <span aria-hidden="true" className="h-[18px] w-[18px] flex-none rounded-full border-[5px] border-azul bg-white" />
          <span className="flex-1 font-display text-[14.5px] font-bold">Retirar no Quad</span>
        </button>
        <button type="button" role="radio" aria-checked="false" aria-disabled="true" className="flex min-h-12 cursor-not-allowed items-center gap-3 rounded-[10px] border border-linha bg-white px-3 py-2 text-left opacity-60">
          <span aria-hidden="true" className="h-[18px] w-[18px] flex-none rounded-full border-[1.5px] border-[#A3B0C2] bg-white" />
          <span className="flex-1 font-display text-[14.5px] font-bold">Receber no meu endereço</span>
          <span className="text-xs font-semibold text-ardosia">Em breve</span>
        </button>
        <span className="flex items-center gap-2 rounded-[10px] bg-[#E3F3EA] px-3 py-2.5 text-[13.5px] font-medium text-[#13774A]">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8.5l3.2 3L13 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Retirada gratuita no Quad Concursos.
        </span>
      </div>

      <button
        type="button"
        onClick={adicionar}
        disabled={!preco || esgotado}
        className="btn-q btn-q-azul h-14 w-full rounded-xl text-[16.5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_14px_30px_-14px_rgba(0,107,255,1)] disabled:cursor-not-allowed disabled:bg-[#C9D3E0] disabled:shadow-none"
      >
        {esgotado ? "Esgotado" : !preco ? "Preço a confirmar" : "Adicionar ao carrinho"}
      </button>
    </>
  );
}
