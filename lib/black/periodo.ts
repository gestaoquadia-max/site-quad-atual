// O período da Black Friday, no horário de Brasília (sem horário de verão desde 2019: fuso -03:00). Vale no servidor e
// no navegador. A prévia (lib/black/liberada.ts) mostra as páginas antes da abertura.
// Dois horários (pedido de 27/11/2026): as páginas da Black abrem para todo mundo às 00h00 de 27/11; as vendas só às
// 09h00, a hora em que os combos e as turmas da Black entram na vitrine da API (quem trava a venda é a API). Entre um e
// outro, as páginas mostram "Abre 27/11 às 09:00" no lugar do preço do que ainda não está à venda.
// O fim é 23h59 de 30/11.

export const ABERTURA_DAS_PAGINAS = Date.parse("2026-11-27T00:00:00-03:00");
export const ABERTURA_DAS_VENDAS = Date.parse("2026-11-27T09:00:00-03:00");
// A hora mostrada em "Abre …" (as vendas).
export const ABERTURA_DA_BLACK = ABERTURA_DAS_VENDAS;
export const FIM_DA_BLACK = Date.parse("2026-12-01T00:00:00-03:00");

// As páginas da Black no ar.
export function dentroDaBlack(agora = Date.now()) {
  return agora >= ABERTURA_DAS_PAGINAS && agora < FIM_DA_BLACK;
}

// As vendas da Black abertas (antes disso, a vitrine da API ainda não tem os produtos da Black).
export function vendasAbertas(agora = Date.now()) {
  return agora >= ABERTURA_DAS_VENDAS && agora < FIM_DA_BLACK;
}
