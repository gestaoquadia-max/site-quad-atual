"use client";

import { useEffect, useId, useState } from "react";
import { useVeAreasEmEspera } from "@/components/AreaEmEspera";
import { useCart } from "@/lib/cart";
import {
  SUGESTOES_NO_SITE,
  alvoDoSugeridoEmTexto,
  alvosDoCarrinho,
  emAreaEmEspera,
  itemDaSugestao,
  listarSugestoes,
  type LugarDaSugestao,
  type SugestaoDaVitrine,
  type TipoDeSugestao,
} from "@/lib/sugestoes";
import CartaoDaSugestao, { type AcaoDoCartao } from "./CartaoDaSugestao";

// O bloco de sugestões de um lugar: lê na API as sugestões dos alvos, fica com os tipos aceitos, tira as repetidas
// (o mesmo sugerido por dois gatilhos aparece uma vez), as de área em espera e as que já estão no carrinho, e corta
// no máximo. Falhou, demorou ou veio vazio: não aparece nada (sem erro e sem esqueleto empurrando o botão de compra).

type Props = {
  lugar: LugarDaSugestao;
  alvos: string[];
  tipos: TipoDeSugestao[];
  maximo: number;
  titulo: string;
  // O botão de cada cartão; sem ele, "Adicionar ao carrinho".
  acao?: (s: SugestaoDaVitrine) => AcaoDoCartao;
  className?: string;
  // Título claro, para os blocos sobre fundo escuro (o aside do evento e da excursão).
  sobreEscuro?: boolean;
  // Depois de adicionar pelo bloco (ex.: o link "Ver o carrinho" do PIX vencido).
  aoAdicionar?: () => void;
};

export default function BlocoDeSugestoes({ lugar, alvos, tipos, maximo, titulo, acao, className = "", sobreEscuro = false, aoAdicionar }: Props) {
  const { items, addItem } = useCart();
  const veEmEspera = useVeAreasEmEspera();
  const [sugestoes, setSugestoes] = useState<SugestaoDaVitrine[] | null>(null);
  const idDoTitulo = useId();
  const ligado = SUGESTOES_NO_SITE[lugar];
  const chave = [...new Set(alvos)].sort().join("|");
  const chaveDosTipos = tipos.join("|");

  useEffect(() => {
    if (!ligado || !chave) return;
    let cancelado = false;
    listarSugestoes(chave.split("|")).then((lista) => {
      if (!cancelado) setSugestoes(lista ?? []);
    });
    return () => {
      cancelado = true;
    };
  }, [ligado, chave]);

  if (!ligado || !sugestoes) return null;

  const noCarrinho = new Set(alvosDoCarrinho(items));
  const vistos = new Set<string>();
  const aceitas = chaveDosTipos.split("|");
  const lista = sugestoes
    .filter((s) => aceitas.includes(s.tipo))
    .filter((s) => (s.combo ? true : !!s.produto && s.produto.aVenda))
    .filter((s) => veEmEspera || !emAreaEmEspera(s))
    .filter((s) => {
      const alvo = s.combo ? `COMBO:${s.combo.id}` : alvoDoSugeridoEmTexto(s);
      if (!alvo || vistos.has(alvo) || noCarrinho.has(alvo)) return false;
      vistos.add(alvo);
      return true;
    })
    .slice(0, maximo);
  if (lista.length === 0) return null;

  const padrao = (s: SugestaoDaVitrine): AcaoDoCartao => ({
    rotulo: "Adicionar ao carrinho",
    aoEscolher: (variacao) => {
      const item = itemDaSugestao(s, variacao);
      if (!item) return;
      addItem(item);
      aoAdicionar?.();
    },
  });

  return (
    <section aria-labelledby={idDoTitulo} className={`flex flex-col gap-3 ${className}`}>
      <h2 id={idDoTitulo} className={`font-display text-lg font-extrabold ${sobreEscuro ? "text-white" : "text-tinta"}`}>
        {titulo}
      </h2>
      <ul className="flex flex-col gap-2.5">
        {lista.map((s) => (
          <li key={s.id}>
            <CartaoDaSugestao sugestao={s} acao={(acao ?? padrao)(s)} />
          </li>
        ))}
      </ul>
    </section>
  );
}
