import { draftMode } from "next/headers";
import { dentroDaBlack } from "./periodo";

// Só no servidor. A prévia é o modo de rascunho do Next (draftMode): quem abriu o link secreto (app/api/previa) vê as
// páginas da Black antes de 27/11; para os outros, a página continua em cache e muda sozinha na abertura (o cache das
// páginas é de 60 s, então a troca leva até 1 minuto).

export async function emPrevia() {
  return (await draftMode()).isEnabled;
}

export async function blackLiberada() {
  return dentroDaBlack() || (await emPrevia());
}
