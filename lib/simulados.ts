// Central de Simulados do Quad (redesenho, out/2026): carreiras → edições → formatos → compra.
// As carreiras e edições vêm da vitrine da API (listarCarreiras em lib/vitrine.ts); aqui ficam os tipos e as regras de venda.
// Depois da aplicação, a edição é vendida para estudo: a versão em PDF (desde 13/11/2026) e a impressa (quando a API
// tiver), cada uma com o seu preço (docs/simulados-no-site-guia-da-api.txt). "Plataforma" ainda não existe na API.
import { precoSemCentavosZerados } from "./format";

export type Inscricao = "a-confirmar" | "abertas" | "encerradas" | "esgotado";
export type FormatoDeEstudo = "pdf" | "plataforma" | "impresso";

type Oferta = { preco: number | null; sku: string };

export type Edicao = {
  numero: number;
  // "AAAA-MM-DD"; null = ainda sem data.
  data: string | null;
  horario: string | null;
  local: string | null;
  // Situação das inscrições definida pela equipe. A data não abre nem fecha vendas.
  inscricao: Inscricao;
  publicado: boolean;
  exemplo?: boolean;
  // vendaAte: até quando a inscrição presencial se vende (ISO-8601 UTC, exclusivo; null = sem fim marcado), da API.
  presencial?: Oferta & { vagas: number | null; vagasRestantes: number | null; vendaAte?: string | null };
  pdf?: Oferta & { disponivel: boolean };
  plataforma?: Oferta & { disponivel: boolean };
  impresso?: Oferta & { disponivel: boolean; estoque: number | null };
};

export type Carreira = {
  id: string;
  nome: string;
  curto: string;
  descricao?: string;
  exemplo?: boolean;
  edicoes: Edicao[];
};

export const ROTULO_DO_FORMATO: Record<FormatoDeEstudo, { nome: string; curto: string; dica: string }> = {
  pdf: { nome: "PDF digital", curto: "PDF", dica: "Arquivo para baixar e estudar" },
  plataforma: { nome: "Realizar na plataforma", curto: "Plataforma", dica: "Responda às questões na plataforma do Quad" },
  impresso: { nome: "Versão impressa", curto: "Impresso", dica: "Retirada gratuita no Quad" },
};

// "Hoje" no horário de Brasília, para comparar com as datas das edições.
export function hojeEmBrasilia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

// Fim das vendas do presencial (recado da API de 19/11/2026): é o `vendaAte` da vitrine (exclusivo), e quem decide é a
// API, não o relógio do site (a regra provisória de 14/11, "véspera às 11:50", saiu). Sem fim informado no console, a
// API fecha às 11h50 do sábado do fim de semana da prova; no instante do vendaAte a edição sai da vitrine (e da
// Central). O selo "Inscrições encerradas" fica para os até 60 s de cache e para o caso de a API voltar a mandar a
// edição encerrada. Quem já comprou não perde nada: a inscrição fica na API e na área do aluno.
export function vendaEncerrada(vendaAte: string | null | undefined, agora = Date.now()) {
  if (!vendaAte) return false;
  const fim = Date.parse(vendaAte);
  return !Number.isNaN(fim) && agora >= fim;
}

export type Situacao = {
  // Situação temporal, derivada da data.
  temporal: "futuro" | "em-realizacao" | "realizado";
  inscricao: Inscricao;
  // Data, horário e local definidos.
  confirmada: boolean;
  vendePresencial: boolean;
  // Algum formato de estudo à venda (disponível e com preço).
  vendeEstudo: boolean;
};

export function situacaoDa(e: Edicao, hoje = hojeEmBrasilia(), agora = Date.now()): Situacao {
  const temporal = !e.data ? "futuro" : e.data < hoje ? "realizado" : e.data === hoje ? "em-realizacao" : "futuro";
  const semVaga = e.presencial?.vagasRestantes != null && e.presencial.vagasRestantes <= 0;
  const inscricao: Inscricao =
    temporal === "realizado" || vendaEncerrada(e.presencial?.vendaAte, agora) ? "encerradas" : semVaga ? "esgotado" : e.inscricao;
  const confirmada = !!(e.data && e.horario && e.local);
  // Regra de produção da designer: só vende com preço cadastrado (o protótipo abria exceção para os exemplos).
  const vendePresencial =
    temporal === "futuro" &&
    confirmada &&
    inscricao === "abertas" &&
    !!e.presencial &&
    e.presencial.preco != null &&
    !semVaga;
  const vendeEstudo = formatosAVenda(e).length > 0;
  return { temporal, inscricao, confirmada, vendePresencial, vendeEstudo };
}

// Formatos de estudo cadastrados na edição (disponíveis ou não).
export function formatosDa(e: Edicao) {
  return (["pdf", "plataforma", "impresso"] as const).filter((f) => e[f]).map((f) => ({ formato: f, oferta: e[f]! }));
}

export function formatosAVenda(e: Edicao) {
  return formatosDa(e).filter((f) => f.oferta.disponivel && f.oferta.preco != null);
}

// Validação única de compra: chamada ao pôr no carrinho; o backend precisa repetir ao criar o pedido e ao confirmar o pagamento.
export function validarCompra(
  carreiras: Carreira[],
  idDaCarreira: string,
  numero: number,
  modalidade: "presencial" | FormatoDeEstudo,
): { ok: true } | { ok: false; motivo: string } {
  const e = carreiras.find((c) => c.id === idDaCarreira)?.edicoes.find((x) => x.numero === numero && x.publicado);
  if (!e) return { ok: false, motivo: "Edição não encontrada ou não publicada." };
  const s = situacaoDa(e);
  if (modalidade === "presencial") {
    if (!s.confirmada) return { ok: false, motivo: "Data, horário ou local ainda não confirmados." };
    if (!s.vendePresencial) return { ok: false, motivo: s.inscricao === "esgotado" ? "Vagas esgotadas." : "Inscrições não disponíveis para esta edição." };
    return { ok: true };
  }
  const f = e[modalidade];
  return f && f.disponivel && f.preco != null ? { ok: true } : { ok: false, motivo: "Formato indisponível para esta edição." };
}

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// "2026-10-24" → "Sáb, 24/10"
export function dataCurta(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return `${DIAS[new Date(a, m - 1, d).getDay()]}, ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
}

export function precoOuACadastrar(preco: number | null) {
  return preco == null ? "Valor a cadastrar" : preco === 0 ? "Gratuito" : precoSemCentavosZerados(preco);
}
