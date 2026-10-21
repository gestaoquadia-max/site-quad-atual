"use client";

import Link from "next/link";
import { useState } from "react";
import { temQuantidade, useCart, type CartItem } from "@/lib/cart";
import { formatarValor, parsePreco } from "@/lib/format";
import { validarCompra, type Carreira, type FormatoDeEstudo } from "@/lib/simulados";
import Etapas from "./Etapas";

export const ROTULO_DO_TIPO: Record<CartItem["tipo"], string> = {
  produto: "Material",
  turma: "Turma",
  evento: "Evento",
  simulado: "Simulado",
  loja: "Loja",
};

// Simulado no carrinho que deixou de estar à venda (edição despublicada, esgotada, formato retirado...).
// Sem os dados da API (carreiras = null), não bloqueia: a compra é conferida de novo no pagamento.
export function motivoDaIndisponibilidade(item: CartItem, carreiras: Carreira[] | null): string | null {
  if (!item.simulado || !carreiras) return null;
  const { carreira, edicao, modalidade, edicoesDoCombo } = item.simulado;
  const tipo = modalidade as "presencial" | FormatoDeEstudo;
  const edicoes = edicao !== null ? [edicao] : (edicoesDoCombo ?? []);
  if (edicoes.length === 0) return "Combo sem edições.";
  for (const n of edicoes) {
    const r = validarCompra(carreiras, carreira, n, tipo);
    if (!r.ok) return r.motivo;
  }
  return null;
}

export function ehFisico(item: CartItem) {
  return item.formato === "impresso" || item.tipo === "loja";
}

function IconeDoCarrinho() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

const SELO = "inline-flex h-5 items-center rounded-[5px] px-[7px] text-[10.5px] font-bold uppercase tracking-[0.08em]";

function Quantidade({ item }: { item: CartItem }) {
  const { updateQuantidade } = useCart();
  return (
    <div className="mt-2 inline-flex items-center rounded-[9px] border border-linha-forte">
      <button
        type="button"
        onClick={() => updateQuantidade(item.id, item.quantidade - 1)}
        disabled={item.quantidade <= 1}
        aria-label={`Diminuir quantidade de ${item.nome}`}
        className="grid h-8 w-8 place-items-center text-ardosia transition-colors hover:text-tinta disabled:opacity-40"
      >
        −
      </button>
      <span className="min-w-6 text-center text-sm font-semibold" aria-live="polite">
        {item.quantidade}
      </span>
      <button
        type="button"
        onClick={() => updateQuantidade(item.id, item.quantidade + 1)}
        aria-label={`Aumentar quantidade de ${item.nome}`}
        className="grid h-8 w-8 place-items-center text-ardosia transition-colors hover:text-tinta"
      >
        +
      </button>
    </div>
  );
}

export default function Carrinho({ carreiras }: { carreiras: Carreira[] | null }) {
  const { items, removeItem, totalCount, totalValor, temItemSobConsulta, carregado } = useCart();
  const [entrega, setEntrega] = useState<"retirada">("retirada");
  const fisicos = items.filter(ehFisico);
  const indisponiveis = new Map(items.map((i) => [i.id, motivoDaIndisponibilidade(i, carreiras)]));
  const temIndisponivel = [...indisponiveis.values()].some(Boolean);

  return (
    <div className="bg-nevoa">
      <div className="mx-auto max-w-[1120px] px-[clamp(20px,4vw,32px)] pb-[clamp(64px,8vw,96px)] pt-[clamp(36px,5vw,64px)]">
        <Etapas atual="Carrinho" />
        <h1 className="mb-7 font-display text-[clamp(2rem,4vw,2.8rem)] font-extrabold tracking-[-0.03em]">Carrinho</h1>

        {!carregado ? (
          <div role="status" aria-label="Carregando" className="min-h-[40vh]" />
        ) : items.length === 0 ? (
          <div className="grid justify-items-center gap-3 rounded-[18px] border border-linha bg-white p-[clamp(36px,6vw,64px)] text-center">
            <div className="grid h-14 w-14 place-items-center rounded-[14px] bg-azul-palido text-azul">
              <IconeDoCarrinho />
            </div>
            <h2 className="mt-2 font-display text-[22px] font-extrabold">Seu carrinho está vazio</h2>
            <p className="max-w-[380px] text-[15px] text-ardosia">Escolha uma turma, um material, um simulado ou um evento para continuar.</p>
            <div className="mt-2.5 flex flex-wrap justify-center gap-2.5">
              <Link href="/turmas" className="btn-q btn-q-azul h-12 px-[22px] text-[15px]">
                Ver turmas
              </Link>
              <Link href="/produtos" className="btn-q btn-q-contorno h-12 px-[22px] text-[15px]">
                Ver materiais
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
              <ul className="overflow-hidden rounded-[18px] border border-linha bg-white">
                {items.map((item, i) => {
                  const motivo = indisponiveis.get(item.id);
                  const unitario = parsePreco(item.preco);
                  return (
                    <li key={item.id} className={`flex items-center gap-4 px-5 py-[18px] ${i > 0 ? "border-t border-[#EEF2F7]" : ""}`}>
                      <div
                        aria-hidden="true"
                        className="grid aspect-square w-[clamp(64px,8vw,88px)] flex-none place-items-center rounded-xl border border-linha bg-[linear-gradient(160deg,#12305A,#071426)] font-display text-xs font-extrabold uppercase tracking-[0.1em] text-prata"
                      >
                        {ROTULO_DO_TIPO[item.tipo].slice(0, 3)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-azul-forte">{ROTULO_DO_TIPO[item.tipo]}</span>
                          {ehFisico(item) && <span className={`${SELO} bg-[#EEF2F7] text-[#3E4A5E]`}>{item.tipo === "loja" ? "Físico" : "Impresso"}</span>}
                          {item.formato === "digital" && <span className={`${SELO} bg-azul-palido text-azul-forte`}>Digital</span>}
                        </div>
                        <div className="mt-1 font-display text-[17px] font-extrabold tracking-[-0.015em]">{item.nome}</div>
                        {item.tag && <div className="mt-0.5 text-[13px] text-ardosia">{item.tag}</div>}
                        {temQuantidade(item) && !motivo && <Quantidade item={item} />}
                        {motivo && (
                          <div role="alert" className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-[#FDECEC] px-2.5 py-1 text-[12.5px] font-semibold text-[#B42323]">
                            Indisponível: {motivo} Remova para continuar.
                          </div>
                        )}
                      </div>
                      <div className="flex flex-none flex-col items-end gap-1.5 text-right">
                        <div className="whitespace-nowrap font-display text-lg font-extrabold [font-variant-numeric:tabular-nums]">
                          {unitario === null ? item.preco : unitario === 0 ? "Gratuito" : formatarValor(unitario * item.quantidade)}                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remover ${item.nome}`}
                          className="min-h-8 px-1 text-[13px] font-medium text-ardosia transition-colors hover:text-[#B42323]"
                        >
                          Remover
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {fisicos.length > 0 && (
                <section aria-labelledby="entrega-titulo" className="rounded-[18px] border border-linha bg-white px-[22px] pb-5 pt-[22px]">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
                    <h2 id="entrega-titulo" className="font-display text-lg font-extrabold">
                      Entrega dos produtos físicos
                    </h2>
                    <span className="text-[12.5px] text-ardosia">
                      {fisicos.length === 1 ? "1 item físico" : `${fisicos.length} itens físicos`}
                    </span>
                  </div>
                  <p className="mb-4 mt-1.5 text-[13.5px] text-ardosia">
                    Vale para materiais impressos e produtos da Loja. Turmas, eventos e itens digitais não precisam de entrega.
                  </p>
                  <div role="radiogroup" aria-label="Forma de entrega" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-2.5">
                    <OpcaoDeEntrega marcada={entrega === "retirada"} aoEscolher={() => setEntrega("retirada")} titulo="Retirar no Quad" dica="Grátis · na sede do Quad" />
                    <OpcaoDeEntrega marcada={false} desativada titulo="Receber em casa" dica="Em breve: envio pelos Correios" />
                  </div>
                  <div className="mt-3.5 flex items-center gap-2.5 rounded-[11px] bg-[#E3F3EA] px-3.5 py-3 text-sm font-medium text-[#13774A]">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8.5l3.2 3L13 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Retirada gratuita na sede do Quad. Você recebe o aviso quando o material estiver disponível.
                  </div>
                </section>
              )}
            </div>

            <aside className="flex-[1_1_300px] rounded-[18px] border border-linha bg-white p-6 lg:sticky lg:top-[130px]">
              <h2 className="mb-3.5 font-display text-lg font-extrabold">Resumo</h2>
              <div className="flex justify-between py-1.5 text-[14.5px] text-[#3E4A5E]">
                <span>{totalCount === 1 ? "1 item" : `${totalCount} itens`}</span>
                <span className="[font-variant-numeric:tabular-nums]">{formatarValor(totalValor)}</span>
              </div>
              {fisicos.length > 0 && (
                <div className="flex justify-between py-1.5 text-[14.5px] text-[#3E4A5E]">
                  <span>Retirada no Quad</span>
                  <span className="font-semibold text-[#13774A]">Grátis</span>
                </div>
              )}
              <div className="mt-2.5 flex items-baseline justify-between border-t border-[#E3E9F1] pt-4">
                <span className="font-semibold">Total</span>
                <span className="font-display text-[28px] font-extrabold tracking-[-0.03em] [font-variant-numeric:tabular-nums]">{formatarValor(totalValor)}</span>
              </div>
              {temItemSobConsulta && <p className="mt-2 text-[12.5px] text-[#8A4B00]">Há itens com valor a confirmar. O total exibido não os inclui.</p>}
              {temIndisponivel ? (
                <>
                  <span aria-disabled="true" className="mt-5 flex h-[52px] cursor-not-allowed items-center justify-center rounded-[11px] bg-[#C9D3E0] font-display text-[15.5px] font-bold text-white">
                    Finalizar compra
                  </span>
                  <p className="mt-2 text-[12.5px] text-[#B42323]">Há itens indisponíveis no carrinho.</p>
                </>
              ) : (
                <Link
                  href="/checkout"
                  className="btn-q btn-q-azul mt-5 h-[52px] w-full text-[15.5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_12px_26px_-14px_rgba(0,107,255,1)]"
                >
                  Finalizar compra
                </Link>
              )}
              <Link href="/" className="mt-2.5 flex min-h-11 items-center justify-center text-sm font-semibold text-[#3E4A5E] hover:text-azul">
                Continuar comprando
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function OpcaoDeEntrega({
  marcada,
  desativada,
  aoEscolher,
  titulo,
  dica,
}: {
  marcada: boolean;
  desativada?: boolean;
  aoEscolher?: () => void;
  titulo: string;
  dica: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={marcada}
      aria-disabled={desativada || undefined}
      onClick={desativada ? undefined : aoEscolher}
      className={`flex items-center gap-3 rounded-xl border-[1.5px] px-4 py-3.5 text-left transition-colors ${
        marcada ? "border-azul bg-azul-gelo" : "border-linha-forte bg-white"
      } ${desativada ? "cursor-not-allowed opacity-60" : "hover:border-azul"}`}
    >
      <span aria-hidden="true" className={`grid h-[18px] w-[18px] flex-none place-items-center rounded-full border-2 ${marcada ? "border-azul" : "border-[#B5C1D1]"}`}>
        {marcada && <span className="h-2 w-2 rounded-full bg-azul" />}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="font-display text-[15px] font-bold">{titulo}</span>
        <span className="text-[12.5px] text-ardosia">{dica}</span>
      </span>
    </button>
  );
}
