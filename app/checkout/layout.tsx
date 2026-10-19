import { NAO_INDEXAR } from "@/lib/seo";

// A página é um componente de cliente, que não pode exportar metadados; eles ficam aqui.
export const metadata = {
  title: "Finalizar compra",
  description: "Finalize sua compra no Quad Concursos com cartão de crédito, PIX ou boleto.",
  robots: NAO_INDEXAR,
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
