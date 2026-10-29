"use server";

import { updateTag } from "next/cache";
import { ETIQUETA_DA_VITRINE } from "./vitrine";

// Depois de reservar ou liberar vagas no carrinho do servidor: descarta a vitrine guardada pelo site, e o menu, a barra
// de avisos e as páginas são refeitos já com as vagas novas (a ação devolve a página atualizada para quem chamou).
// Sem isso, o número levaria até SEGUNDOS_DE_CACHE para mudar. Só descarta o cache: não recebe nem devolve dados.
export async function atualizarVagas() {
  updateTag(ETIQUETA_DA_VITRINE);
}
