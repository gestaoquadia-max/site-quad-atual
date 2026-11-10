// Excursões para o dia da prova (10/11/2026): itens EXCURSOES da vitrine da API (lib/vitrine.ts), vendidos como os
// produtos da loja (carrinho e fechamento), e mostrados em Eventos: no menu, numa seção de /eventos, na página de
// cada excursão (/excursoes/[slug]) e no trilho "Próximos eventos" da home.
// A API ainda não tem data, destino e concurso em campos próprios: saem do nome, no padrão
// "EXCURSÃO [OPÇÃO] — CONCURSO ANO (DD/MM)" ("EXCURSÃO C/ CAFÉ — PMPE 2027 (19/02)"). Fora do padrão, a excursão
// aparece com o nome cadastrado e sem data.
import type { CartItem } from "./cart";
import type { DadosDoCartaoEvento } from "./eventos";
import { idDoItem } from "./itens";

export type Excursao = {
  slug: string;
  idNaApi: string;
  nomeCadastrado: string;
  // "Excursão PMPE 2027": o mesmo para as opções da mesma viagem.
  titulo: string;
  // "Com café", "Sem café"; null quando a viagem tem uma opção só.
  opcao: string | null;
  // "PMPE"
  concurso: string | null;
  // "2027-02-19"; null fora do padrão do nome.
  data: string | null;
  // Uma linha por item da descrição cadastrada ("• Destino: Salvador–BA."), sem o marcador.
  detalhes: string[];
  // "R$ 89", null = a confirmar.
  preco: string | null;
  precoCheio: string | null;
  lote: string | null;
  // Vagas; null = sem limite informado.
  restantes: number | null;
  ofertadas: number | null;
  imagemUrl: string | null;
};

// As opções da mesma viagem (com e sem café), como os turnos de uma turma.
export type ViagemDeExcursao = {
  titulo: string;
  concurso: string | null;
  data: string | null;
  opcoes: Excursao[];
};

const PADRAO_DO_NOME = /^\s*excurs[ãa]o\b\s*(.*?)\s*[—–-]\s*(.+?)\s*\((\d{1,2})\/(\d{1,2})\)\s*$/i;

// "C/ CAFÉ" → "Com café"; "S/ CAFÉ" → "Sem café"; outra opção, só com a primeira letra maiúscula.
function nomeDaOpcao(texto: string) {
  const t = texto.trim();
  if (!t) return null;
  const expandido = t.replace(/^c\/\s*/i, "com ").replace(/^s\/\s*/i, "sem ").toLowerCase();
  return expandido.charAt(0).toUpperCase() + expandido.slice(1);
}

export function lerNomeDaExcursao(nome: string): Pick<Excursao, "titulo" | "opcao" | "concurso" | "data"> {
  const m = nome.match(PADRAO_DO_NOME);
  if (!m) return { titulo: nome.trim(), opcao: null, concurso: null, data: null };
  const [, opcao, destino, dia, mes] = m;
  const ano = destino.match(/\b(20\d{2})\b/)?.[1];
  const concurso = destino.replace(/\b20\d{2}\b/, "").trim() || null;
  return {
    titulo: `Excursão ${destino.trim()}`,
    opcao: nomeDaOpcao(opcao),
    concurso,
    data: ano ? `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}` : null,
  };
}

// "• Destino: Salvador–BA.\n• Data da viagem: …" → ["Destino: Salvador–BA.", "Data da viagem: …"]
export function linhasDaDescricao(descricao: string | null): string[] {
  return (descricao ?? "")
    .split("\n")
    .map((l) => l.replace(/^\s*[•\-*]\s*/, "").trim())
    .filter(Boolean);
}

// Junta as opções da mesma viagem (mesmo título e data), na ordem da data; sem data, no fim.
export function agruparViagens(excursoes: Excursao[]): ViagemDeExcursao[] {
  const porChave = new Map<string, ViagemDeExcursao>();
  for (const e of excursoes) {
    const chave = `${e.titulo}|${e.data ?? ""}`;
    const viagem = porChave.get(chave) ?? { titulo: e.titulo, concurso: e.concurso, data: e.data, opcoes: [] };
    viagem.opcoes.push(e);
    porChave.set(chave, viagem);
  }
  return [...porChave.values()].sort((a, b) => (a.data ?? "9999").localeCompare(b.data ?? "9999"));
}

export function esgotada(e: Excursao) {
  return e.restantes !== null && e.restantes <= 0;
}

// A viagem já saiu: a data da excursão ficou para trás (no fuso da Bahia).
export function jaPassou(data: string | null) {
  if (!data) return false;
  const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bahia" }).format(new Date());
  return data < hoje;
}

export function itemDoCarrinho(e: Excursao): Omit<CartItem, "quantidade"> | null {
  if (!e.preco || esgotada(e)) return null;
  return {
    id: idDoItem("excursao", e.slug),
    tipo: "excursao",
    nome: e.opcao ? `${e.titulo} · ${e.opcao}` : e.titulo,
    tag: [e.data && diaBarraMes(e.data), "Embarque no Quad"].filter(Boolean).join(" · "),
    preco: e.preco,
    alvo: { itemId: e.idNaApi },
  };
}

// "2027-02-19" → "19/02"
export function diaBarraMes(data: string) {
  return `${data.slice(8, 10)}/${data.slice(5, 7)}`;
}

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

// "R$ 400" → 400, para achar a opção mais barata.
function valor(preco: string | null) {
  if (!preco) return Infinity;
  return Number(preco.replace(/[^\d,]/g, "").replace(",", ".")) || Infinity;
}

// O cartão da viagem (home e /eventos), no mesmo formato dos eventos. Com uma opção só, já vai para o carrinho.
export function paraCartaoDeExcursao(v: ViagemDeExcursao): DadosDoCartaoEvento {
  const maisBarata = [...v.opcoes].sort((a, b) => valor(a.preco) - valor(b.preco))[0];
  const abertas = v.opcoes.filter((o) => !esgotada(o));
  const vagas = abertas.reduce((soma, o) => (o.restantes === null || soma === null ? null : soma + o.restantes), 0 as number | null);
  const selo: DadosDoCartaoEvento["selo"] =
    abertas.length === 0
      ? { texto: "Esgotada", tom: "esgotado" }
      : { texto: vagas === null ? "Vagas abertas" : vagas === 1 ? "1 vaga" : `${vagas} vagas`, tom: "aberta" };
  // Com mais de uma opção, o preço do cartão é o da mais barata, e o texto avisa ("A partir de").
  const opcoes = v.opcoes.length > 1 ? `${v.opcoes.map((o) => o.opcao).filter(Boolean).join(" ou ")}, a partir de ${maisBarata.preco ?? "valor a confirmar"}. ` : "";
  return {
    id: `excursao:${maisBarata.slug}`,
    titulo: v.titulo,
    href: `/excursoes/${maisBarata.slug}`,
    descricao: `Viagem para o dia da prova, com embarque no Quad. ${opcoes}${maisBarata.detalhes[0] ?? ""}`.trim(),
    selo,
    data: v.data ? { dia: v.data.slice(8, 10), mes: MESES[Number(v.data.slice(5, 7)) - 1], local: "Excursão" } : undefined,
    preco: maisBarata.preco ?? undefined,
    item: v.opcoes.length === 1 ? (itemDoCarrinho(maisBarata) ?? undefined) : undefined,
  };
}
