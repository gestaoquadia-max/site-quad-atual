import type { Metadata } from "next";
import AguardandoPagamento from "@/components/compra/AguardandoPagamento";
import { NAO_INDEXAR } from "@/lib/seo";

export const metadata: Metadata = { title: "Pagamento", description: "Pague o PIX ou o boleto do seu pedido.", robots: NAO_INDEXAR };

// /checkout/pagamento/{id do fechamento}: o PIX ou o boleto gerado no checkout, até o pagamento ser confirmado.
export default async function PagamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AguardandoPagamento id={id} />;
}
