import Carrinho from "@/components/compra/Carrinho";
import { listarCarreiras } from "@/lib/vitrine";

export const revalidate = 60;

// As edições de simulado vêm da API para conferir se o que está no carrinho ainda está à venda.
export default async function CarrinhoPage() {
  const carreiras = await listarCarreiras();
  return <Carrinho carreiras={carreiras} />;
}
