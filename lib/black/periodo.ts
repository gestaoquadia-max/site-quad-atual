// O período das ofertas da Black Friday: de 09h00 de 27/11 até 23h59 de 30/11, no horário de Brasília. O LEIA-ME da
// entrega de 25/11/2026 dizia 00h00, mas as vendas começam às 09h00 (pedido de 26/11/2026), a mesma hora em que os
// combos e as turmas da Black entram na vitrine da API. Brasília não tem horário de verão desde 2019: fuso -03:00.
// Vale no servidor e no navegador. A prévia (lib/black/liberada.ts) mostra as páginas antes da abertura.

export const ABERTURA_DA_BLACK = Date.parse("2026-11-27T09:00:00-03:00");
export const FIM_DA_BLACK = Date.parse("2026-12-01T00:00:00-03:00");

const DIA = 86_400_000;
const FUSO_DE_BRASILIA = -3 * 3_600_000;

export function dentroDaBlack(agora = Date.now()) {
  return agora >= ABERTURA_DA_BLACK && agora < FIM_DA_BLACK;
}

// O fim do dia de hoje em Brasília (a meia-noite seguinte), em milissegundos: o alvo da contagem "Preço válido só hoje".
export function fimDoDiaEmBrasilia(agora = Date.now()) {
  const inicioDoDia = Math.floor((agora + FUSO_DE_BRASILIA) / DIA) * DIA - FUSO_DE_BRASILIA;
  return inicioDoDia + DIA;
}
