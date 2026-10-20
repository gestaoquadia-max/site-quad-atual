import Checkout from "@/components/compra/Checkout";
import { listarCarreiras } from "@/lib/vitrine";

export const revalidate = 60;

// Confere de novo os simulados do carrinho antes do pagamento (mesma regra do carrinho).
export default async function CheckoutPage() {
  const carreiras = await listarCarreiras();
  return <Checkout carreiras={carreiras} />;
}
