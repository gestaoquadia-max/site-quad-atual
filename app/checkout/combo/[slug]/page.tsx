import { notFound } from "next/navigation";
import CheckoutDoCombo from "@/components/compra/CheckoutDoCombo";
import { buscarCombo } from "@/lib/combos";

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts); o Next exige um número escrito aqui.
export const revalidate = 60;

// Pagamento de um combo: lê o combo da vitrine (preço e partes de hoje) e entrega ao formulário de pagamento.
export default async function CheckoutDoComboPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const combo = await buscarCombo(slug).catch(() => null);
  if (!combo) notFound();
  return <CheckoutDoCombo combo={combo} />;
}
