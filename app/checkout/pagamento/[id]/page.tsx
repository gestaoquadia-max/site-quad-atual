import type { Metadata } from "next";
import AguardandoPagamento from "@/components/compra/AguardandoPagamento";
import { NAO_INDEXAR } from "@/lib/seo";

export const metadata: Metadata = { title: "Pagamento", description: "Pague o PIX do seu pedido.", robots: NAO_INDEXAR };

// /checkout/pagamento/{id do fechamento}: o PIX gerado no checkout, até o pagamento ser confirmado. O site não oferece
// mais boleto (23/10/2026), mas a página ainda mostra o de um pedido antigo.
export default async function PagamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AguardandoPagamento id={id} />;
}
