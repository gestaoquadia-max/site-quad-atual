// Cartões de evento (Home e Agenda), montados a partir dos eventos da vitrine da API (lib/vitrine.ts).
import type { CartItem } from "./cart";
import type { Evento } from "./data";
import { parsePreco } from "./format";
import { idDoItem } from "./itens";

export type TomDoSelo = "aberta" | "breve" | "esgotado" | "encerrado";

export type DadosDoCartaoEvento = {
  id: string;
  titulo: string;
  href: string;
  descricao: string;
  selo: { texto: string; tom: TomDoSelo };
  // Selo de data sobre a arte ("09 AGO · Presencial · SIC/SIQ").
  data?: { dia: string; mes: string; local: string };
  preco?: string;
  // Presente quando a inscrição pode ir para o carrinho.
  item?: Omit<CartItem, "quantidade">;
};

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

// Na Home, o primeiro cartão da agenda é sempre a Central de Simulados.
export const CARTAO_DOS_SIMULADOS: DadosDoCartaoEvento = {
  id: "simulados",
  titulo: "Simulados do Quad",
  href: "/simulados",
  descricao: "Escolha sua carreira e encontre simulados presenciais, digitais, impressos e combos para sua preparação.",
  selo: { texto: "Presenciais, individuais e combos", tom: "breve" },
};

export function seloDoEvento(e: Evento): DadosDoCartaoEvento["selo"] {
  if (e.status === "encerrada") return { texto: "Esgotado", tom: "esgotado" };
  if (e.status === "breve") return { texto: "Inscrições em breve", tom: "breve" };
  return { texto: e.statusLabel, tom: "aberta" };
}

export function paraCartao(e: Evento): DadosDoCartaoEvento {
  const inicio = e.detalhe?.inicio;
  const vendavel = e.status === "aberta" && parsePreco(e.preco) !== null;
  return {
    id: e.slug,
    titulo: e.nome,
    href: `/eventos/${e.slug}`,
    descricao: e.desc,
    selo: seloDoEvento(e),
    data: inicio
      ? { dia: inicio.slice(8, 10), mes: MESES[Number(inicio.slice(5, 7)) - 1], local: e.tag.split(" · ").slice(1).join(" · ") }
      : undefined,
    preco: e.preco,
    item: vendavel ? { id: idDoItem("evento", e.slug), tipo: "evento", nome: e.nome, tag: e.tag, preco: e.preco } : undefined,
  };
}
