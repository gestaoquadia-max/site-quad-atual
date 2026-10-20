"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, PixLogo } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatarValor, parsePreco } from "@/lib/format";
import type { Carreira } from "@/lib/simulados";
import { CLASSE_DO_CAMPO, CLASSE_DO_ROTULO } from "../acesso/Campos";
import { ehFisico, motivoDaIndisponibilidade, ROTULO_DO_TIPO } from "./Carrinho";
import Etapas from "./Etapas";

const metodos = ["Cartão", "PIX"] as const;

// Ícones das formas de pagamento (Phosphor, a mesma biblioteca para os dois).
const ICONE_DO_METODO = { Cartão: CreditCard, PIX: PixLogo } as const;

const MAX_PARCELAS = 3;

// Simulação até a integração com o Pagar.me e com os cupons do backend.
const cuponsValidos: Record<string, number> = {
  QUAD10: 0.1,
  BEMVINDO: 0.05,
};

const CARTAO = "rounded-[18px] border border-linha bg-white p-6";

export default function Checkout({ carreiras }: { carreiras: Carreira[] | null }) {
  const router = useRouter();
  const { items, totalValor, temItemSobConsulta, carregado } = useCart();
  const [metodo, setMetodo] = useState<(typeof metodos)[number]>("Cartão");
  const [parcelas, setParcelas] = useState(1);
  const [cupomInput, setCupomInput] = useState("");
  const [cupom, setCupom] = useState<{ codigo: string; desconto: number } | null>(null);
  const [erroCupom, setErroCupom] = useState(false);

  const subtotal = totalValor;
  const valorDesconto = cupom ? subtotal * cupom.desconto : 0;
  const total = subtotal - valorDesconto;
  const gratuito = items.length > 0 && subtotal === 0 && !temItemSobConsulta;
  const temTurma = items.some((i) => i.tipo === "turma");
  const temFisico = items.some(ehFisico);
  const temIndisponivel = items.some((i) => motivoDaIndisponibilidade(i, carreiras));

  function aplicarCupom() {
    const codigo = cupomInput.trim().toUpperCase();
    const desconto = cuponsValidos[codigo];
    if (desconto) {
      setCupom({ codigo, desconto });
      setErroCupom(false);
    } else {
      setCupom(null);
      setErroCupom(true);
    }
  }

  function removerCupom() {
    setCupom(null);
    setCupomInput("");
    setErroCupom(false);
  }

  function confirmar(e: React.FormEvent) {
    e.preventDefault();
    if (gratuito) {
      router.push("/checkout/confirmacao?status=inscricao");
    } else if (metodo === "Cartão") {
      router.push("/checkout/confirmacao?status=aprovado");
    } else {
      router.push(`/checkout/confirmacao?status=pendente&metodo=${metodo === "PIX" ? "pix" : "boleto"}`);
    }
  }

  const titulo = gratuito ? "Confirmar inscrição" : temTurma ? "Finalizar matrícula" : "Finalizar compra";

  return (
    <div className="bg-nevoa">
      <div className="mx-auto max-w-[1120px] px-[clamp(20px,4vw,32px)] pb-[clamp(64px,8vw,96px)] pt-[clamp(36px,5vw,64px)]">
        <Etapas atual="Pagamento" />
        <h1 className="mb-7 font-display text-[clamp(2rem,4vw,2.8rem)] font-extrabold tracking-[-0.03em]">{titulo}</h1>

        {/* Ainda lendo o carrinho salvo no navegador: a área reservada evita que o rodapé pule (CLS). */}
        {!carregado ? (
          <div role="status" aria-label="Carregando" className="min-h-[50vh]" />
        ) : items.length === 0 ? (
          <div className="grid justify-items-center gap-3 rounded-[18px] border border-linha bg-white p-[clamp(36px,6vw,64px)] text-center">
            <h2 className="font-display text-[22px] font-extrabold">Seu carrinho está vazio</h2>
            <p className="max-w-[400px] text-[15px] text-ardosia">Escolha uma turma, material ou evento para continuar.</p>
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
            <form onSubmit={confirmar} noValidate className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
              {gratuito ? (
                <section className={CARTAO}>
                  <h2 className="font-display text-[17px] font-extrabold">Inscrição gratuita</h2>
                  <p className="mt-2 text-[15px] leading-[1.6] text-ardosia-escura">
                    Nenhum pagamento é necessário. Ao confirmar, sua inscrição é registrada e os detalhes são enviados para o seu e-mail.
                  </p>
                </section>
              ) : (
                <fieldset className={CARTAO}>
                  <legend className="px-1.5 font-display text-[17px] font-extrabold">Forma de pagamento</legend>
                  <div role="radiogroup" aria-label="Forma de pagamento" className="mt-1 grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-2.5">
                    {metodos.map((m) => {
                      const marcado = metodo === m;
                      const Icone = ICONE_DO_METODO[m];
                      return (
                        <button
                          key={m}
                          type="button"
                          role="radio"
                          aria-checked={marcado}
                          onClick={() => setMetodo(m)}
                          className={`flex items-center gap-3 rounded-xl border-[1.5px] px-4 py-3.5 text-left transition-colors hover:border-azul ${
                            marcado ? "border-azul bg-azul-gelo" : "border-linha-forte bg-white"
                          }`}
                        >
                          <span aria-hidden="true" className={`grid h-[18px] w-[18px] place-items-center rounded-full border-2 ${marcado ? "border-azul" : "border-[#B5C1D1]"}`}>
                            {marcado && <span className="h-2 w-2 rounded-full bg-azul" />}
                          </span>
                          <span className="font-display text-[15px] font-bold">{m}</span>
                          <Icone size={24} weight={marcado ? "duotone" : "regular"} aria-hidden="true" className={`ml-auto ${marcado ? "text-azul" : "text-ardosia"}`} />
                        </button>
                      );
                    })}
                  </div>

                  {metodo === "Cartão" ? (
                    <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-4">
                      <CampoDoCartao rotulo="Número do cartão" placeholder="0000 0000 0000 0000" autoComplete="cc-number" className="col-span-full" />
                      <CampoDoCartao rotulo="Validade" placeholder="MM/AA" autoComplete="cc-exp" />
                      <CampoDoCartao rotulo="CVV" placeholder="123" autoComplete="cc-csc" />
                      <CampoDoCartao rotulo="Nome impresso no cartão" placeholder="Como está no cartão" autoComplete="cc-name" className="col-span-full" />
                      <label className="col-span-full flex flex-col gap-[7px]">
                        <span className={CLASSE_DO_ROTULO}>Parcelamento</span>
                        <select value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))} className={CLASSE_DO_CAMPO}>
                          {Array.from({ length: MAX_PARCELAS }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>
                              {n}x de {formatarValor(total / n)} sem juros
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  ) : (
                    <p className="mt-5 rounded-xl bg-nevoa p-4 text-[14.5px] leading-[1.6] text-ardosia-escura">
                      Ao confirmar, você recebe o QR Code PIX para pagamento imediato. O acesso é liberado automaticamente após a confirmação.
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-[12.5px] text-ardosia">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <rect x="4" y="11" width="16" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                    Processado com segurança via Pagar.me · Seus dados não passam pelo nosso servidor
                  </div>
                </fieldset>
              )}

              {temFisico && (
                <section className={CARTAO}>
                  <h2 className="font-display text-[17px] font-extrabold">Entrega</h2>
                  <p className="mt-1.5 text-[14.5px] text-ardosia-escura">Retirada gratuita na sede do Quad. Você recebe o aviso quando o material estiver disponível.</p>
                </section>
              )}

              {temItemSobConsulta && (
                <p role="alert" className="rounded-xl border border-[#F1C4C4] bg-[#FFF5F5] p-4 text-sm text-[#9B1C1C]">
                  Há itens com valor &ldquo;sob consulta&rdquo; no carrinho. Remova-os para pagar online ou fale com o nosso atendimento.
                </p>
              )}
              {temIndisponivel && (
                <p role="alert" className="rounded-xl border border-[#F1C4C4] bg-[#FFF5F5] p-4 text-sm text-[#9B1C1C]">
                  Há itens que deixaram de estar disponíveis.{" "}
                  <Link href="/carrinho" className="font-semibold underline underline-offset-2">
                    Revise o carrinho
                  </Link>{" "}
                  para continuar.
                </p>
              )}

              <button
                type="submit"
                disabled={temItemSobConsulta || temIndisponivel}
                className="btn-q btn-q-azul h-14 w-full rounded-xl text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_12px_26px_-14px_rgba(0,107,255,1)] disabled:cursor-not-allowed disabled:bg-[#C9D3E0] disabled:shadow-none"
              >
                {gratuito ? "Confirmar inscrição" : "Confirmar pagamento"}
              </button>
            </form>

            <aside className="flex-[1_1_300px] rounded-[18px] border border-linha bg-white p-6 lg:sticky lg:top-[120px]">
              <h2 className="mb-3.5 font-display text-lg font-extrabold">Pedido</h2>
              <ul>
                {items.map((item) => {
                  const unitario = parsePreco(item.preco);
                  return (
                    <li key={item.id} className="flex justify-between gap-3 border-b border-[#EEF2F7] py-2.5 text-sm">
                      <span>
                        <span className="block font-semibold">
                          {item.nome}
                          {item.quantidade > 1 && ` × ${item.quantidade}`}
                        </span>
                        <span className="text-[12.5px] text-ardosia">
                          {ROTULO_DO_TIPO[item.tipo]}
                          {item.tipo === "turma" && item.precoSufixo ? ` · ${item.precoSufixo.replace("/", "").trim()}` : ""}
                          {item.tag ? ` · ${item.tag}` : ""}
                        </span>
                      </span>
                      <span className="whitespace-nowrap font-semibold [font-variant-numeric:tabular-nums]">
                        {unitario === null ? "Sob consulta" : unitario === 0 ? "Gratuito" : formatarValor(unitario * item.quantidade)}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {temTurma && (
                <div className="flex justify-between border-b border-[#EEF2F7] py-2.5 text-sm">
                  <span className="text-ardosia-escura">Taxa de matrícula</span>
                  <span>R$ 0,00</span>
                </div>
              )}

              {!gratuito &&
                (cupom ? (
                  <div className="flex items-center justify-between border-b border-[#EEF2F7] py-2.5 text-sm">
                    <span className="flex items-center gap-2 text-ardosia-escura">
                      Cupom <span className="font-semibold text-azul-forte">{cupom.codigo}</span>
                      <button type="button" onClick={removerCupom} aria-label="Remover cupom" className="text-ardosia hover:text-[#B42323]">
                        ✕
                      </button>
                    </span>
                    <span className="font-semibold text-[#13774A]">− {formatarValor(valorDesconto)}</span>
                  </div>
                ) : (
                  <div className="border-b border-[#EEF2F7] py-3.5">
                    <div className="flex gap-2">
                      <label className="sr-only" htmlFor="cupom">
                        Cupom de desconto
                      </label>
                      <input
                        id="cupom"
                        value={cupomInput}
                        onChange={(e) => setCupomInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && aplicarCupom()}
                        placeholder="Cupom de desconto"
                        className="h-11 w-full rounded-[10px] border border-linha-forte bg-white px-3 text-sm text-tinta outline-none placeholder:text-[#97A3B4] focus:border-azul"
                      />
                      <button type="button" onClick={aplicarCupom} className="btn-q btn-q-contorno h-11 px-4 text-sm">
                        Aplicar
                      </button>
                    </div>
                    {erroCupom && <p className="mt-2 text-[12.5px] text-[#B42323]">Cupom inválido.</p>}
                  </div>
                ))}

              <div className="mt-3.5 flex items-baseline justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-display text-[26px] font-extrabold tracking-[-0.03em] [font-variant-numeric:tabular-nums]">
                  {gratuito ? "Gratuito" : formatarValor(total)}
                </span>
              </div>
              <Link href="/carrinho" className="mt-3 flex min-h-11 items-center justify-center text-sm font-semibold text-[#3E4A5E] hover:text-azul">
                Editar carrinho
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function CampoDoCartao({ rotulo, placeholder, autoComplete, className = "" }: { rotulo: string; placeholder: string; autoComplete: string; className?: string }) {
  return (
    <label className={`flex flex-col gap-[7px] ${className}`}>
      <span className={CLASSE_DO_ROTULO}>{rotulo}</span>
      <input type="text" inputMode={autoComplete === "cc-name" ? undefined : "numeric"} autoComplete={autoComplete} placeholder={placeholder} className={CLASSE_DO_CAMPO} />
    </label>
  );
}
