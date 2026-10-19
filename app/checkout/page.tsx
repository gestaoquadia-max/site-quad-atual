"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatarValor } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { parsePreco } from "@/lib/format";
import AccentCard from "@/components/AccentCard";

const metodos = ["Cartão", "PIX"] as const;

const MAX_PARCELAS = 3;

// Simulação até a integração com o Pagar.me e com os cupons do backend.
const cuponsValidos: Record<string, number> = {
  QUAD10: 0.1,
  BEMVINDO: 0.05,
};

const labelPorTipo = {
  produto: "Material",
  turma: "Turma",
  evento: "Evento",
};

export default function CheckoutPage() {
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

  function confirmar() {
    if (gratuito) {
      router.push("/checkout/confirmacao?status=inscricao");
    } else if (metodo === "Cartão") {
      router.push("/checkout/confirmacao?status=aprovado");
    } else {
      router.push(`/checkout/confirmacao?status=pendente&metodo=${metodo === "PIX" ? "pix" : "boleto"}`);
    }
  }

  const cabecalho = (
    <div className="bg-navy-deep py-header">
      <div className="mx-auto max-w-site px-6">
        <span className="eyebrow text-blue">{gratuito ? "Inscrição" : "Pagamento seguro"}</span>
        <h1 className="font-display mt-2.5 text-h1-sm font-bold uppercase text-offwhite">
          {gratuito ? "Confirmar inscrição" : temTurma ? "Finalizar matrícula" : "Finalizar compra"}
        </h1>
      </div>
    </div>
  );

  // Ainda lendo o carrinho salvo no navegador. A área reservada evita que o rodapé suba e depois desça
  // quando o conteúdo aparece (mudança de layout, que o Google mede como CLS).
  if (!carregado) {
    return (
      <>
        {cabecalho}
        <div role="status" aria-label="Carregando" className="min-h-[70vh]" />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        {cabecalho}
        <div className="mx-auto max-w-form px-6 py-section">
          <div className="border border-light bg-white p-12 text-center">
            <p className="mb-5 text-steel">Seu carrinho está vazio. Escolha uma turma, material ou evento para continuar.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/turmas" className="btn btn-blue">
                Ver turmas
              </Link>
              <Link href="/produtos" className="btn btn-outline-dark">
                Ver materiais
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {cabecalho}

      <div className="mx-auto grid max-w-form items-start gap-8 px-6 py-section lg:grid-cols-[1fr_360px]">
        <AccentCard side="t" className="p-8">
          {gratuito ? (
            <>
              <span className="eyebrow">Sem custo</span>
              <h2 className="font-display mb-4 mt-3 text-2xl font-bold uppercase">Inscrição gratuita</h2>
              <p className="mb-4 border border-light bg-offwhite p-4 text-sm text-[#4A5462]">
                Nenhum pagamento é necessário. Ao confirmar, sua inscrição é registrada e os detalhes são
                enviados para o seu e-mail.
              </p>
            </>
          ) : (
            <>
              <span className="eyebrow">Forma de pagamento</span>
              <h2 className="font-display mb-6 mt-3 text-2xl font-bold uppercase">Dados do pagamento</h2>

              <div className="mb-6 flex gap-2">
                {metodos.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMetodo(m)}
                    className={`focus-ring font-display flex-1 border p-3 text-[13px] font-semibold uppercase tracking-wide transition-colors ${
                      metodo === m
                        ? "border-navy bg-navy text-blue"
                        : "border-light bg-offwhite text-steel hover:border-blue"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {metodo === "Cartão" && (
                <>
                  <Field label="Número do cartão" placeholder="0000 0000 0000 0000" />
                  <div className="grid grid-cols-2 gap-3.5">
                    <Field label="Validade" placeholder="MM/AA" />
                    <Field label="CVV" placeholder="123" />
                  </div>
                  <Field label="Nome impresso no cartão" placeholder="Como está no cartão" />
                  <div className="mb-4">
                    <label className="font-display mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-steel">
                      Parcelamento
                    </label>
                    <select
                      value={parcelas}
                      onChange={(e) => setParcelas(Number(e.target.value))}
                      className="w-full border border-light bg-offwhite px-3.5 py-3 text-[15px] text-navy outline-none focus:border-blue"
                    >
                      {Array.from({ length: MAX_PARCELAS }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}x de {formatarValor(total / n)} sem juros
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {metodo === "PIX" && (
                <p className="mb-4 border border-light bg-offwhite p-4 text-sm text-[#4A5462]">
                  Ao confirmar, você receberá o QR Code PIX para pagamento imediato. O acesso é liberado
                  automaticamente após a confirmação.
                </p>
              )}

            </>
          )}

          {temItemSobConsulta && (
            <p className="mb-4 border border-[#9B3535]/40 bg-[#9B3535]/10 p-4 text-sm text-[#9B3535]">
              Há itens com valor &ldquo;sob consulta&rdquo; no carrinho. Remova-os para pagar online ou fale com o
              nosso atendimento.
            </p>
          )}

          <button
            onClick={confirmar}
            disabled={temItemSobConsulta}
            className="btn btn-blue mt-3 block w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {gratuito ? "Confirmar inscrição" : "Confirmar pagamento"}
          </button>

          {!gratuito && (
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-steel">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="2" y="5" width="8" height="6" rx="1" stroke="currentColor" />
                <path d="M4 5V3.5C4 2.4 4.9 1.5 6 1.5s2 .9 2 2V5" stroke="currentColor" />
              </svg>
              Processado com segurança via Pagar.me · Seus dados não passam pelo nosso servidor
            </div>
          )}
        </AccentCard>

        <div className="sticky top-[92px] bg-navy-deep p-7 text-offwhite shadow">
          <h3 className="font-display mb-5 text-base font-bold uppercase tracking-[0.1em] text-blue">
            Resumo do pedido
          </h3>

          {items.map((item) => {
            const unitario = parsePreco(item.preco);
            return (
              <div key={item.id} className="flex justify-between gap-4 border-b border-dark py-2.5 text-sm">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-steel">{labelPorTipo[item.tipo]}</div>
                  <div className="text-steel-light">
                    {item.nome}
                    {item.quantidade > 1 && ` × ${item.quantidade}`}
                    {item.tipo === "turma" && item.precoSufixo && ` (${item.precoSufixo.replace("/", "").trim()})`}
                  </div>
                </div>
                <span className="whitespace-nowrap">
                  {unitario === null
                    ? "Sob consulta"
                    : unitario === 0
                      ? "Gratuito"
                      : formatarValor(unitario * item.quantidade)}
                </span>
              </div>
            );
          })}

          {temTurma && (
            <div className="flex justify-between border-b border-dark py-2.5 text-sm">
              <span className="text-steel-light">Taxa de matrícula</span>
              <span>R$ 0,00</span>
            </div>
          )}

          {!gratuito &&
            (cupom ? (
              <div className="flex items-center justify-between border-b border-dark py-2.5 text-sm">
                <span className="flex items-center gap-2 text-steel-light">
                  Cupom <span className="text-blue">{cupom.codigo}</span>
                  <button
                    type="button"
                    onClick={removerCupom}
                    aria-label="Remover cupom"
                    className="focus-ring text-steel hover:text-[#E08A8A]"
                  >
                    ✕
                  </button>
                </span>
                <span className="text-blue">− {formatarValor(valorDesconto)}</span>
              </div>
            ) : (
              <div className="border-b border-dark py-3.5">
                <div className="flex gap-2">
                  <input
                    value={cupomInput}
                    onChange={(e) => setCupomInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && aplicarCupom()}
                    placeholder="Cupom de desconto"
                    className="w-full border border-dark bg-navy-deep px-3 py-2 text-sm text-offwhite outline-none placeholder:text-[#4A5768] focus:border-blue"
                  />
                  <button type="button" onClick={aplicarCupom} className="btn btn-outline px-4 text-xs">
                    Aplicar
                  </button>
                </div>
                {erroCupom && <p className="mt-2 text-xs text-[#E08A8A]">Cupom inválido.</p>}
              </div>
            ))}

          <div className="font-display mt-2 flex justify-between pt-4 text-xl font-bold">
            <span>Total</span>
            <span className="text-blue">{gratuito ? "Gratuito" : formatarValor(total)}</span>
          </div>

          <Link
            href="/carrinho"
            className="focus-ring mt-4 block text-center text-xs text-steel-light underline underline-offset-4 transition-colors hover:text-blue"
          >
            Editar carrinho
          </Link>
        </div>
      </div>
    </>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="mb-4">
      <label className="font-display mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-steel">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full border border-light bg-offwhite px-3.5 py-3 text-[15px] text-navy outline-none focus:border-blue"
      />
    </div>
  );
}
