"use client";

import Link from "next/link";
import { useState } from "react";
import type { Produto } from "@/lib/data";
import { useCart } from "@/lib/cart";
import { idDoItem } from "@/lib/itens";
import { Brilho } from "../Brilho";
import CapaDoLivro, { CORES_DA_CAPA } from "../CapaDoLivro";
import { formatosDo } from "@/lib/materiais";


type Formato = "digital" | "impresso";

// "R$ 49,90" → moeda à parte, em fonte menor, como no protótipo.
export function PrecoEmDestaque({ preco, claro = false }: { preco: string; claro?: boolean }) {
  const temMoeda = preco.startsWith("R$");
  return (
    <div className="flex items-baseline gap-[5px]">
      {temMoeda && <span className={`font-display text-sm font-bold ${claro ? "text-[#64748B]" : "text-prata"}`}>R$</span>}
      <span className="font-display text-[28px] font-extrabold leading-none tracking-[-0.03em] [font-variant-numeric:tabular-nums]">
        {temMoeda ? preco.slice(3) : preco}
      </span>
    </div>
  );
}

function Capa({ titulo, cor }: { titulo: string; cor: string }) {
  return (
    <div className="relative flex justify-center bg-[radial-gradient(60%_70%_at_50%_35%,rgba(47,134,255,0.22),transparent_75%),linear-gradient(180deg,#14304F,#102641)] pb-[30px] pt-8">
      <div aria-hidden="true" className="absolute bottom-[18px] left-[18%] right-[18%] h-[18px] rounded-full bg-black/55 blur-[10px]" />
      <div className="relative w-[58%]">
        <CapaDoLivro titulo={titulo} cor={cor} />
      </div>
    </div>
  );
}

function OpcaoDeEntrega({ marcada, desativada, rotulo, dica, onEscolher }: {
  marcada: boolean;
  desativada?: boolean;
  rotulo: string;
  dica: string;
  onEscolher?: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={marcada}
      aria-disabled={desativada}
      onClick={desativada ? undefined : onEscolher}
      className={`flex min-h-[46px] items-center gap-2.5 rounded-[9px] px-2.5 py-1.5 text-left text-white transition-colors ${
        marcada ? "border border-[rgba(47,134,255,0.7)] bg-azul/[0.16]" : "border border-white/10"
      } ${desativada ? "cursor-not-allowed opacity-55" : ""}`}
    >
      <span className={`h-4 w-4 flex-none rounded-full ${marcada ? "border-[5px] border-azul-vivo bg-white" : "border-[1.5px] border-[#6B7C94]"}`} />
      <span className="flex min-w-0 flex-col items-start gap-px">
        <span className="font-display text-[13.5px] font-bold">{rotulo}</span>
        <span className="text-[11.5px] text-[#8FA0B8]">{dica}</span>
      </span>
    </button>
  );
}

export default function CartaoMaterial({ produto, indice }: { produto: Produto; indice: number }) {
  const { addItem } = useCart();
  const formatos = formatosDo(produto);
  const [formato, setFormato] = useState<Formato>(formatos[0]);
  const impresso = formato === "impresso";

  function adicionar() {
    addItem({
      id: `${idDoItem("produto", produto.slug)}${impresso ? ":impresso" : ""}`,
      tipo: "produto",
      nome: produto.nome,
      tag: impresso ? "Impresso · Retirar no Quad" : "Digital",
      preco: produto.preco,
      formato,
      alvo: produto.idNaApi ? { itemId: produto.idNaApi } : undefined,
    });
  }

  return (
    <article
      data-glow=""
      className="relative flex h-full flex-col overflow-hidden rounded-[18px] border border-white/[0.08] bg-marinho-800 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-[3px] hover:border-[rgba(111,174,255,0.45)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_28px_50px_-26px_rgba(0,0,0,0.8)]"
    >
      <Brilho />
      <Capa titulo={produto.nome} cor={CORES_DA_CAPA[indice % CORES_DA_CAPA.length]} />
      <div className="relative flex flex-1 flex-col p-5">
        <h3 className="mb-1.5 font-display text-[19px] font-extrabold leading-[1.2] tracking-[-0.02em]">{produto.nome}</h3>
        <p className="text-sm leading-[1.5] text-prata">{produto.desc}</p>

        {/* Com um formato só (da API, hoje só o impresso), não há o que escolher. */}
        {formatos.length > 1 && (
        <div role="radiogroup" aria-label={`Formato de ${produto.nome}`} className="mt-4 grid grid-cols-2 rounded-[10px] border border-white/[0.08] bg-black/25 p-[3px]">
          {formatos.map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={formato === f}
              onClick={() => setFormato(f)}
              className={`h-9 rounded-lg font-display text-[13px] font-bold transition-colors ${
                formato === f ? "bg-white text-marinho-950 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4)]" : "text-prata"
              }`}
            >
              {f === "digital" ? "Digital" : "Impresso"}
            </button>
          ))}
        </div>
        )}

        {impresso && (
          <div className="mt-2.5 animate-[q-surgir_200ms_ease_both] rounded-xl border border-white/[0.08] bg-black/[0.22] p-3">
            <div className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-prata-escura">Entrega do impresso</div>
            <div role="radiogroup" aria-label="Entrega do impresso" className="flex flex-col gap-1.5">
              <OpcaoDeEntrega marcada rotulo="Retirar no Quad" dica="Sem custo" />
              {/* Depende da integração com a transportadora (frete por CEP). */}
              <OpcaoDeEntrega marcada={false} desativada rotulo="Enviar para casa" dica="Em breve · frete pelo CEP" />
            </div>
          </div>
        )}

        {/* Empurra preço e botões para o pé do cartão, alinhados entre cartões de alturas diferentes. */}
        <div className="flex-1" />
        <div className="mt-[18px] flex flex-col gap-3.5 border-t border-white/[0.08] pt-4">
          <PrecoEmDestaque preco={produto.preco} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={adicionar}
              disabled={produto.esgotado}
              className="btn-q btn-q-azul h-11 flex-1 px-3 text-[13.5px] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-prata disabled:shadow-none"
            >
              {produto.esgotado ? "Esgotado" : "Adicionar ao carrinho"}
            </button>
            <Link href={`/produtos/${produto.slug}`} className="btn-q btn-q-contorno-escuro h-11 px-3.5 text-[13.5px]">
              Detalhes
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
