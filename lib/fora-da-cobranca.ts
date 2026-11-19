import type { Fechamento, LinhaDoCarrinho } from "./loja";

// A linha que sai do pagamento sem aviso (recado da API de 19/11/2026): o fechamento cobra só as linhas VIGENTES, e a
// reserva de 30 minutos não segura a venda. Se o produto fechou entre a reserva e o pagamento (o vendaAte passou, ou o
// Quad fechou as compras no console), a linha fica fora da cobrança, sem erro, e não vem em `compras`. O site confere
// item por item: o que não virou compra continua no carrinho, com o aviso, e fica fora do analytics.

// A compra é desta linha: mesmo alvo (o item do catálogo ou a atividade), mesma variação e mesma oferta do material.
// É o mesmo critério de mesmaLinha (lib/usePedido.ts).
function compraDaLinha(c: Fechamento["compras"][number], l: LinhaDoCarrinho) {
  const alvo = l.alvo.itemId ?? l.alvo.atividade?.id;
  if (!alvo || c.item.id !== alvo) return false;
  const variacaoDaLinha = l.alvo.variacao?.id ?? null;
  const variacaoDaCompra = c.item.variacao?.id ?? null;
  if (variacaoDaLinha !== variacaoDaCompra) return false;
  return !l.alvo.plataforma || !c.item.plataforma || l.alvo.plataforma === c.item.plataforma;
}

// Os itens do carrinho do site (pelo id) cuja linha reservada não virou compra. Se alguma compra vier sem o id do
// alvo (API de antes de 19/11), não dá para casar: nada é dado como fora, como antes.
export function itensForaDaCobranca(linhas: Map<string, LinhaDoCarrinho>, compras: Fechamento["compras"]): string[] {
  if (compras.some((c) => !c.item.id)) return [];
  const livres = [...compras];
  const fora: string[] = [];
  for (const [idDoItem, linha] of linhas) {
    const i = livres.findIndex((c) => compraDaLinha(c, linha));
    if (i === -1) fora.push(idDoItem);
    else livres.splice(i, 1);
  }
  return fora;
}

export function avisoDeForaDaCobranca(nome: string) {
  return `${nome} saiu de venda antes do pagamento e não foi cobrado.`;
}

// Os nomes ficam guardados por fechamento (na aba) para a tela seguinte, a de confirmação ou a do PIX, mostrar o aviso.
const CHAVE = "quad-fora-da-cobranca";

function lerTodos(): Record<string, string[]> {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE) || "{}") as Record<string, string[]>;
  } catch {
    return {};
  }
}

export function guardarForaDaCobranca(fechamentoId: string, nomes: string[]) {
  if (nomes.length === 0) return;
  try {
    sessionStorage.setItem(CHAVE, JSON.stringify({ ...lerTodos(), [fechamentoId]: nomes }));
  } catch {
    // Sem armazenamento: o item continua no carrinho, só a tela seguinte fica sem o aviso.
  }
}

export function foraDaCobranca(fechamentoId: string): string[] {
  return lerTodos()[fechamentoId] ?? [];
}
