"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/lib/cart";
import { parsePreco } from "@/lib/format";
import { ErroDaApi } from "@/lib/http";
import { alvoDoItem } from "@/lib/itens";
import { inscreverSeDeGraca } from "@/lib/loja";
import { rotaComDestino } from "@/lib/redirecionamento";
import { useSessaoAtiva } from "@/lib/usuario";

// Preço, ocupação e botão de inscrição da página do evento.
// Evento pago: vai para o carrinho e segue para o checkout. Gratuito: inscreve direto na API, sem checkout
// (pede login antes, e volta para esta página depois de entrar).
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
  const caminho = usePathname();
  const sessaoAtiva = useSessaoAtiva();
  const { addItem } = useCart();
  const [inscrevendo, setInscrevendo] = useState(false);
  const [erro, setErro] = useState("");
  const pct = vagas ? Math.round((vagas.ocupadas / vagas.total) * 100) : 0;
  const gratuito = parsePreco(preco) === 0;

  async function inscrever() {
    if (!gratuito) {
      addItem(item);
      router.push("/checkout");
      return;
    }
    if (!sessaoAtiva) {
      router.push(rotaComDestino("/entrar", caminho));
      return;
    }
    const atividade = alvoDoItem({ ...item, quantidade: 1 })?.atividade;
    if (!atividade || atividade.tipo === "TURMA") return setErro("Não foi possível identificar este evento. Atualize a página e tente de novo.");
    setErro("");
    setInscrevendo(true);
    try {
      await inscreverSeDeGraca(atividade.tipo, atividade.id);
      router.push("/checkout/confirmacao?status=inscricao");
    } catch (e) {
      setErro(e instanceof ErroDaApi ? e.message : "Não foi possível fazer a inscrição. Verifique sua internet e tente novamente.");
      setInscrevendo(false);
    }
  }

  return (
    <div className="mt-6 rounded-[18px] border border-white/10 bg-marinho-900 p-[clamp(20px,2.4vw,26px)]">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="font-display text-[clamp(30px,3.2vw,38px)] font-extrabold tracking-[-0.03em]">{preco}</span>
        <span className="text-[13px] text-prata">{nota}</span>
      </div>
      {vagas && (
        <div className="mt-4">
          <div className="mb-2 flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-[13px] text-prata">
            <span>Inscrições confirmadas</span>
            <strong className="whitespace-nowrap font-semibold text-white">
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
        disabled={desabilitado || inscrevendo}
        onClick={inscrever}
        className="btn-q btn-q-azul mt-5 h-[54px] w-full text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_16px_36px_-14px_rgba(0,107,255,1)] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-prata disabled:shadow-none"
      >
        {inscrevendo ? "Inscrevendo…" : cta}
      </button>
      {erro && (
        <p role="alert" className="mt-3 text-[13px] text-[#F3A3B1]">
          {erro}
        </p>
      )}
      <p className="mt-3 text-xs text-prata-escura">{gratuito ? "Inscrição gratuita, registrada na sua conta" : "Pagamento seguro via Pagar.me"}</p>
    </div>
  );
}
