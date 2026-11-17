"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/lib/cart";
import type { Evento } from "@/lib/data";
import { parsePreco } from "@/lib/format";
import { ErroDaApi } from "@/lib/http";
import { alvoDoItem } from "@/lib/itens";
import { inscreverSeDeGraca } from "@/lib/loja";
import { rotaComDestino } from "@/lib/redirecionamento";
import { useSessaoAtiva } from "@/lib/usuario";

type Variacao = NonNullable<Evento["variacoes"]>[number];

// Preço, ocupação e botão de inscrição da página do evento.
// Evento pago: vai para o carrinho e segue para o checkout. Gratuito: inscreve direto na API, sem checkout
// (pede login antes, e volta para esta página depois de entrar).
// Com variações (API, 17/11/2026: "Sem camisa", "Com camisa G"): o aluno escolhe uma antes, o preço passa a ser o
// dela e o carrinho reserva com o variacaoId. Sempre pelo checkout, que também fecha o total gratuito.
export default function CaixaDeInscricao({
  preco,
  nota,
  cta,
  desabilitado,
  vagas,
  item,
  variacoes,
}: {
  preco: string;
  nota: string;
  cta: string;
  desabilitado: boolean;
  vagas?: { total: number; ocupadas: number };
  item: Omit<CartItem, "quantidade">;
  variacoes?: Variacao[];
}) {
  const router = useRouter();
  const caminho = usePathname();
  const sessaoAtiva = useSessaoAtiva();
  const { addItem } = useCart();
  const [inscrevendo, setInscrevendo] = useState(false);
  const [erro, setErro] = useState("");
  const comVariacoes = (variacoes?.length ?? 0) > 0;
  const disponiveis = variacoes?.filter((v) => !v.esgotada) ?? [];
  // Uma só à venda: já vem escolhida.
  const [escolhida, setEscolhida] = useState<string | null>(disponiveis.length === 1 ? disponiveis[0].id : null);
  const variacao = variacoes?.find((v) => v.id === escolhida) ?? null;
  const pct = vagas ? Math.round((vagas.ocupadas / vagas.total) * 100) : 0;
  const gratuito = !comVariacoes && parsePreco(preco) === 0;
  const todasEsgotadas = comVariacoes && disponiveis.length === 0;
  // Antes da escolha, o menor preço entre as que estão à venda.
  const menor = [...(disponiveis.length ? disponiveis : (variacoes ?? []))].sort((a, b) => (parsePreco(a.preco) ?? Infinity) - (parsePreco(b.preco) ?? Infinity))[0];
  const precoNaTela = !comVariacoes ? preco : variacao ? variacao.preco : menor.preco;
  const precoCheio = variacao?.precoCheio;

  async function inscrever() {
    if (comVariacoes) {
      if (!variacao) return setErro("Escolha uma opção antes de continuar.");
      setErro("");
      addItem({
        ...item,
        nome: `${item.nome} (${variacao.nome})`,
        preco: variacao.preco,
        alvo: item.alvo?.atividade ? { atividade: item.alvo.atividade, variacaoId: variacao.id } : item.alvo,
      });
      router.push("/checkout");
      return;
    }
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
      {comVariacoes && (
        <fieldset className="mb-5" disabled={desabilitado}>
          <legend className="mb-2 text-[13px] text-prata">
            Escolha uma opção{variacao && (
              <>
                {" "}
                · <strong className="font-semibold text-white">{variacao.nome}</strong>
              </>
            )}
          </legend>
          <div className="flex flex-wrap gap-2">
            {variacoes!.map((v) => {
              const marcada = v.id === escolhida;
              return (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={marcada}
                  disabled={v.esgotada}
                  onClick={() => {
                    setEscolhida(v.id);
                    setErro("");
                  }}
                  className={`inline-flex min-h-11 flex-col items-center justify-center rounded-[10px] px-4 py-1.5 font-display text-[15px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    marcada ? "bg-white text-marinho-950 ring-2 ring-azul ring-offset-2 ring-offset-marinho-900" : "border border-white/15 text-white hover:border-white/40"
                  }`}
                >
                  {v.nome}
                  <span className={`text-[11px] font-semibold ${marcada ? "text-ardosia" : "text-prata"}`}>{v.esgotada ? "Esgotado" : v.preco}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        {comVariacoes && !variacao && <span className="text-[13px] text-prata">A partir de</span>}
        {precoCheio && <span className="text-[15px] text-prata line-through">{precoCheio}</span>}
        <span className="font-display text-[clamp(30px,3.2vw,38px)] font-extrabold tracking-[-0.03em]">{precoNaTela}</span>
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
        disabled={desabilitado || inscrevendo || todasEsgotadas}
        onClick={inscrever}
        className="btn-q btn-q-azul mt-5 h-[54px] w-full text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_16px_36px_-14px_rgba(0,107,255,1)] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-prata disabled:shadow-none"
      >
        {inscrevendo ? "Inscrevendo…" : todasEsgotadas ? "Inscrições esgotadas" : cta}
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
