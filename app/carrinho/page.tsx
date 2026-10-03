"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatarValor } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import AccentCard from "@/components/AccentCard";
import Kicker from "@/components/Kicker";

const labelPorTipo = {
  produto: "Material",
  turma: "Turma",
  evento: "Evento",
};

export default function CarrinhoPage() {
  const { items, removeItem, updateQuantidade, totalCount, totalValor, temItemSobConsulta } = useCart();

  return (
    <>
      <PageHeader
        eyebrow="Sua seleção"
        title="Carrinho"
        desc={totalCount > 0 ? `${totalCount} ${totalCount === 1 ? "item" : "itens"} no carrinho.` : undefined}
      />
      <section className="py-section">
        <div className="mx-auto max-w-site px-6">
          {items.length === 0 ? (
            <div className="border border-light bg-white p-12 text-center">
              <p className="mb-5 text-steel">Seu carrinho está vazio.</p>
              <Link href="/produtos" className="btn btn-blue">Ver materiais</Link>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
              <div className="border border-light bg-white">
                {items.map((item, i) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between gap-4 px-5 py-4 ${
                      i !== items.length - 1 ? "border-b border-light" : ""
                    }`}
                  >
                    <div>
                      <Kicker>
                        {labelPorTipo[item.tipo]} {item.tag ? `· ${item.tag}` : ""}
                      </Kicker>
                      <div className="text-[15px] font-semibold">{item.nome}</div>
                    </div>
                    <div className="flex items-center gap-5">
                      {item.tipo === "produto" && (
                        <div className="flex items-center border border-light">
                          <button
                            type="button"
                            onClick={() => updateQuantidade(item.id, item.quantidade - 1)}
                            className="focus-ring px-3 py-1.5 text-steel transition-colors hover:text-navy"
                            aria-label="Diminuir quantidade"
                          >
                            −
                          </button>
                          <span className="px-3 text-sm font-semibold">{item.quantidade}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantidade(item.id, item.quantidade + 1)}
                            className="focus-ring px-3 py-1.5 text-steel transition-colors hover:text-navy"
                            aria-label="Aumentar quantidade"
                          >
                            +
                          </button>
                        </div>
                      )}
                      <span className="font-display w-24 text-right text-base font-bold text-navy">
                        {item.preco}
                        {item.precoSufixo && <small className="text-xs font-medium text-steel">{item.precoSufixo}</small>}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label="Remover"
                        className="focus-ring text-steel transition-colors hover:text-[#9B3535]"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <AccentCard side="t" className="h-fit p-7">
                <h3 className="font-display mb-5 text-base font-bold uppercase tracking-[0.1em] text-blue-dark">
                  Resumo
                </h3>
                <div className="mb-5 flex items-center justify-between border-t border-light pt-4 text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-display font-bold text-navy">{formatarValor(totalValor)}</span>
                </div>
                {temItemSobConsulta && (
                  <p className="mb-5 text-xs text-steel">
                    Um ou mais itens têm valor “sob consulta” e não entram nesse total.
                  </p>
                )}
                <Link href="/checkout" className="btn btn-blue block w-full text-center">
                  Finalizar compra
                </Link>
              </AccentCard>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
