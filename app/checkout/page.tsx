"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatarValor } from "@/lib/format";
import AccentCard from "@/components/AccentCard";

const metodos = ["Cartão", "PIX", "Boleto"] as const;

const cuponsValidos: Record<string, number> = {
  QUAD10: 0.1,
  BEMVINDO: 0.05,
};

export default function CheckoutPage() {
  const router = useRouter();
  const [metodo, setMetodo] = useState<(typeof metodos)[number]>("Cartão");
  const subtotal = 497;
  const [cupomInput, setCupomInput] = useState("");
  const [cupom, setCupom] = useState<{ codigo: string; desconto: number } | null>(null);
  const [erroCupom, setErroCupom] = useState(false);

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

  const valorDesconto = cupom ? subtotal * cupom.desconto : 0;
  const total = subtotal - valorDesconto;

  return (
    <>
      <div className="bg-navy-deep py-header">
        <div className="mx-auto max-w-site px-6">
          <span className="eyebrow">Pagamento seguro</span>
          <h1 className="font-display mt-2.5 text-h1-sm font-bold uppercase text-offwhite">
            Finalizar matrícula
          </h1>
        </div>
      </div>

      <div className="mx-auto grid max-w-form items-start gap-8 px-6 py-section lg:grid-cols-[1fr_360px]">
        <AccentCard side="t" className="p-8">
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
                <select className="w-full border border-light bg-offwhite px-3.5 py-3 text-[15px] text-navy outline-none focus:border-blue">
                  <option>1x de R$ 497,00 sem juros</option>
                  <option>2x de R$ 248,50 sem juros</option>
                  <option>3x de R$ 165,67 sem juros</option>
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

          {metodo === "Boleto" && (
            <>
              <Field label="CPF" placeholder="000.000.000-00" />
              <p className="mb-4 border border-light bg-offwhite p-4 text-sm text-[#4A5462]">
                O boleto vence em 3 dias úteis. O acesso é liberado após a compensação (1–2 dias
                úteis após o pagamento).
              </p>
            </>
          )}

          <button
            onClick={() => router.push("/checkout/confirmacao")}
            className="btn btn-blue mt-3 block w-full"
          >
            Confirmar pagamento
          </button>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-steel">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="2" y="5" width="8" height="6" rx="1" stroke="currentColor" />
              <path d="M4 5V3.5C4 2.4 4.9 1.5 6 1.5s2 .9 2 2V5" stroke="currentColor" />
            </svg>
            Processado com segurança via Pagar.me · Seus dados não passam pelo nosso servidor
          </div>
        </AccentCard>

        <div className="sticky top-[92px] bg-navy-deep p-7 text-offwhite shadow">
          <h3 className="font-display mb-5 text-base font-bold uppercase tracking-[0.1em] text-blue">
            Resumo do pedido
          </h3>
          <div className="flex justify-between border-b border-dark py-2.5 text-sm">
            <span className="text-steel-light">Turma CFP 2025.2 — 1ª mensalidade</span>
            <span>R$ 497,00</span>
          </div>
          <div className="flex justify-between border-b border-dark py-2.5 text-sm">
            <span className="text-steel-light">Taxa de matrícula</span>
            <span>R$ 0,00</span>
          </div>

          {cupom ? (
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
          )}

          <div className="font-display mt-2 flex justify-between pt-4 text-xl font-bold">
            <span>Total</span>
            <span className="text-blue">{formatarValor(total)}</span>
          </div>
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
