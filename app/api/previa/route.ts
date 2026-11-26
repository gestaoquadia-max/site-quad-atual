import { createHash, timingSafeEqual } from "node:crypto";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

// Link secreto da prévia da Black Friday (25/11/2026): /api/previa?chave=… liga o modo de rascunho do Next neste
// navegador (cookie __prerender_bypass, que vale até fechar o navegador) e leva às páginas da Black antes de 27/11.
// /api/previa?sair=1 desliga. A chave não fica no código: só o SHA-256 dela. Para trocar a chave, gerar outra e pôr o
// SHA-256 novo aqui.
const RESUMO_DA_CHAVE = "d469cf1e314e3968f195bc7b026abe8762393749b2badf736a4853f3792365bb";

// Para onde o link leva (nunca um endereço vindo de fora, para o link não servir de redirecionamento aberto).
const DESTINOS = ["/produtos", "/", "/mentorias", "/turmas", "/simulados", "/carrinho"];

function chaveCerta(chave: string) {
  const recebido = createHash("sha256").update(chave).digest();
  return timingSafeEqual(recebido, Buffer.from(RESUMO_DA_CHAVE, "hex"));
}

export async function GET(request: Request) {
  const parametros = new URL(request.url).searchParams;
  const rascunho = await draftMode();

  if (parametros.has("sair")) {
    rascunho.disable();
    redirect("/");
  }

  if (!chaveCerta(parametros.get("chave") ?? "")) {
    return new Response("Link de prévia inválido.", { status: 401, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  rascunho.enable();
  const para = parametros.get("para");
  redirect(para && DESTINOS.includes(para) ? para : "/produtos");
}
