"use server";

import { updateTag } from "next/cache";
import { ETIQUETA_DA_VITRINE, SEGUNDOS_DE_CACHE } from "./vitrine";

// Quando a vitrine foi descartada pela última vez (milissegundos). Um processo Node só, numa máquina só: o freio vale
// para o site inteiro. Não é exportada: arquivo "use server" só exporta função async.
let ultimoDescarte = 0;

// Depois de reservar ou liberar vagas no carrinho do servidor: descarta a vitrine guardada pelo site, e o menu, a barra
// de avisos e as páginas são refeitos já com as vagas novas (a ação devolve a página atualizada para quem chamou).
// Só descarta o cache: não recebe nem devolve dados.
// No máximo um descarte a cada SEGUNDOS_DE_CACHE (pedido A-vag-site da API, de 26/11/2026):
// a cota ANONIMO da API é de 120 chamadas por minuto por IP, e toda busca da vitrine sai do IP do servidor do site; cada
// descarte custa umas 6 buscas, e na abertura da Black os descartes de cada comprador estourariam a cota (429 por até
// 60 s, com o menu e as listas vazios). Efeito aceito: as vagas mostradas podem levar até um minuto para mudar; quem
// confere a vaga é a API, que recusa a reserva quando esgota.
export async function atualizarVagas() {
  const agora = Date.now();
  if (agora - ultimoDescarte < SEGUNDOS_DE_CACHE * 1000) return;
  ultimoDescarte = agora;
  updateTag(ETIQUETA_DA_VITRINE);
}
