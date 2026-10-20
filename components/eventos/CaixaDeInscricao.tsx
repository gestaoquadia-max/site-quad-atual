"use client";

import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/lib/cart";

// Preço, ocupação e botão de inscrição da página do evento. O botão põe a inscrição no carrinho e segue
// para o checkout (evento gratuito pula o pagamento lá).
export default function CaixaDeInscricao({
  preco,
  nota,
  cta,
  desabilitado,
  vagas,
  item,
}: {
  preco: string;
  nota: string;
  cta: string;
  desabilitado: boolean;
  vagas?: { total: number; ocupadas: number };
  item: Omit<CartItem, "quantidade">;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const pct = vagas ? Math.round((vagas.ocupadas / vagas.total) * 100) : 0;

  return (
    <div className="mt-6 rounded-[18px] border border-white/10 bg-marinho-900 p-[clamp(20px,2.4vw,26px)]">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="font-display text-[clamp(30px,3.2vw,38px)] font-extrabold tracking-[-0.03em]">{preco}</span>
        <span className="text-[13px] text-prata">{nota}</span>
      </div>
      {vagas && (
        <div className="mt-4">
          <div className="mb-2 flex justify-between gap-3 text-[13px] text-prata">
            <span>Inscrições confirmadas</span>
            <strong className="font-semibold text-white">
              {vagas.ocupadas} de {vagas.total} vagas preenchidas
            </strong>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10" role="img" aria-label={`${pct}% das vagas preenchidas`}>
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#2F86FF,#6FAEFF)]" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
      <button
        type="button"
        disabled={desabilitado}
        onClick={() => {
          addItem(item);
          router.push("/checkout");
        }}
        className="btn-q btn-q-azul mt-5 h-[54px] w-full text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_16px_36px_-14px_rgba(0,107,255,1)] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-prata disabled:shadow-none"
      >
        {cta}
      </button>
      <p className="mt-3 text-xs text-prata-escura">Pagamento seguro via Pagar.me</p>
    </div>
  );
}
