import { precoSemCentavosZerados } from "./format";

// Turma no formato da planilha da coordenação (aba TURMAS), que vai ser igual à tabela do banco:
// CATEGORIA, MODALIDADE, EDIÇÃO, CARGO, CONCURSO, TURNO, DATA DE INÍCIO, DATA DE TÉRMINO, HORA INÍCIO/FIM 01 e 02,
// SALA, VALOR QUADCOINS, VALOR CENTAVOS, QTDE VAGAS QUADCOINS, QTDE VAGAS CENTAVOS, DESCRIÇÃO, IMAGEM, LOTE, SLUG.
// Cada linha da planilha é UM turno; a página junta os turnos da mesma turma (mesma modalidade, edição, cargo e concurso).
// O site mostra só o lado em reais (valor e vagas em centavos); o lado em Quad Coins é do app.

export type Turno = "MANHA" | "TARDE" | "NOITE" | "INTEGRAL";

export const ORDEM_DOS_TURNOS: Turno[] = ["MANHA", "TARDE", "NOITE", "INTEGRAL"];

export const NOME_DO_TURNO: Record<Turno, string> = { MANHA: "Manhã", TARDE: "Tarde", NOITE: "Noite", INTEGRAL: "Integral" };

export type OfertaDaTurma = {
  // id da atividade na API e endereço da página (cada turno tem o seu)
  id: string;
  slug: string;
  modalidade: string | null; // "RONDESP"
  edicao: number | null; // 2
  cargo: string | null; // "Soldado"
  concurso: string | null; // "PMBA"
  turno: Turno | null;
  inicio: string | null; // "2026-11-19"
  termino: string | null;
  // Os dois blocos de aula do dia (HORA INÍCIO/FIM 01 e 02); o segundo é opcional.
  horarios: { inicio: string; fim: string }[];
  precoEmCentavos: number | null;
  // Vagas do lado em reais (QTDE VAGAS CENTAVOS); null = sem limite.
  vagas: { total: number; ocupadas: number } | null;
  descricao: string | null;
  imagemUrl: string | null;
  lote: string | null; // "FINAL", "1", "2"…
  // Nome que a API usa hoje, para quando a modalidade não pôde ser lida
  nomeOriginal: string;
};

export type TurmaComTurnos = {
  // "RONDESP 2"
  nome: string;
  modalidade: string | null;
  edicao: number | null;
  cargo: string | null;
  concurso: string | null;
  ofertas: OfertaDaTurma[];
};

// MODALIDADE + EDIÇÃO fazem o nome ("RONDESP 2"); sem modalidade, fica o nome cadastrado.
export function nomeDaTurma(o: Pick<OfertaDaTurma, "modalidade" | "edicao" | "nomeOriginal">) {
  if (!o.modalidade) return o.nomeOriginal;
  return o.edicao ? `${o.modalidade} ${o.edicao}` : o.modalidade;
}

// Níveis de preparação da PMBA (Soldado e CFO). Fora da PMBA (PCBA, Bombeiros, outros estados) a MODALIDADE é um
// nome livre ("INVESTIGADOR") e não há níveis: é uma turma por concurso.
export const NIVEIS_DA_PMBA = ["RONDESP", "PATAMO", "BOPE"] as const;

export function ehNivelDaPmba(modalidade: string | null): boolean {
  return !!modalidade && (NIVEIS_DA_PMBA as readonly string[]).includes(modalidade.toUpperCase());
}

const TURNO_PELO_NOME: Record<string, Turno> = { MANHA: "MANHA", TARDE: "TARDE", NOITE: "NOITE", INTEGRAL: "INTEGRAL" };

// Enquanto o banco não tem as colunas da planilha, elas saem do nome cadastrado, no padrão
// "MODALIDADE EDIÇÃO - CARGO CONCURSO - TURNO" (ex.: "RONDESP 2 - SD PMBA - Manhã", "INVESTIGADOR 1 - IPC PCBA - Noite").
// Nome fora do padrão (sem " - ") devolve null, e quem chama usa as deduções antigas.
export function lerNomeDaTurma(nome: string) {
  const partes = nome.split(/\s+[-–—]\s+/).map((p) => p.trim()).filter(Boolean);
  if (partes.length < 2) return null;
  const primeira = partes[0].match(/^(.*?)\s*(\d+)?$/);
  const modalidade = primeira?.[1]?.trim().toUpperCase() || null;
  const edicao = primeira?.[2] ? Number(primeira[2]) : null;
  const palavras = partes[1].split(/\s+/);
  const concurso = palavras.length ? palavras[palavras.length - 1].toUpperCase() : null;
  const cargo = palavras.length > 1 ? palavras.slice(0, -1).join(" ") : null;
  const turnoTexto = partes[2]
    ?.normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase();
  return { modalidade, edicao, cargo, concurso, turno: (turnoTexto && TURNO_PELO_NOME[turnoTexto]) || null };
}

// Abreviações de cargo usadas no selo ("SD • PMBA"). Cargo fora da lista aparece como cadastrado.
const SIGLA_DO_CARGO: Record<string, string> = { SOLDADO: "SD" };

// "Soldado" + "PMBA" → "SD • PMBA"; sem os dois → "Todos os concursos".
export function seloDoCargoEConcurso(cargo: string | null, concurso: string | null) {
  const partes = [cargo && (SIGLA_DO_CARGO[cargo.toUpperCase()] ?? cargo.toUpperCase()), concurso?.toUpperCase()].filter(Boolean);
  return partes.length ? partes.join(" • ") : "Todos os concursos";
}

// Turmas iguais em turnos diferentes têm a mesma chave. Sem modalidade não dá para agrupar: cada uma fica sozinha.
export function chaveDaTurma(o: OfertaDaTurma) {
  if (!o.modalidade) return o.id;
  return [o.modalidade, o.edicao ?? "", o.cargo ?? "", o.concurso ?? ""].join("|").toLowerCase();
}

export function juntarTurnos(ofertas: OfertaDaTurma[]): TurmaComTurnos {
  const ordenadas = [...ofertas].sort((a, b) => ORDEM_DOS_TURNOS.indexOf(a.turno ?? "INTEGRAL") - ORDEM_DOS_TURNOS.indexOf(b.turno ?? "INTEGRAL"));
  const primeira = ordenadas[0];
  return {
    nome: nomeDaTurma(primeira),
    modalidade: primeira.modalidade,
    edicao: primeira.edicao,
    cargo: primeira.cargo,
    concurso: primeira.concurso,
    ofertas: ordenadas,
  };
}

// "19:00:00" → "19h"; "20:30" → "20h30"
export function hora(texto: string) {
  const [h, m] = texto.split(":");
  return m && m !== "00" ? `${Number(h)}h${m}` : `${Number(h)}h`;
}

// "19h às 20h30 · 20h40 às 22h"
export function horarioDoDia(horarios: OfertaDaTurma["horarios"]) {
  return horarios.map((h) => `${hora(h.inicio)} às ${hora(h.fim)}`).join(" · ");
}

export function precoDaOferta(o: OfertaDaTurma) {
  return o.precoEmCentavos === null ? null : precoSemCentavosZerados(o.precoEmCentavos / 100);
}

// "FINAL" → "Lote final"; "2" → "2º lote"
export function textoDoLote(lote: string | null) {
  if (!lote) return null;
  if (/^\d+$/.test(lote)) return `${lote}º lote`;
  if (/^[uú]nico$/i.test(lote)) return "Lote único";
  return `Lote ${lote.toLowerCase()}`;
}

export function esgotada(o: OfertaDaTurma) {
  return o.vagas !== null && o.vagas.ocupadas >= o.vagas.total;
}
