import { NAO_INDEXAR } from "@/lib/seo";

// A página é um componente de cliente, que não pode exportar metadados; eles ficam aqui.
export const metadata = {
  title: "Carrinho",
  description: "Revise as turmas, os materiais e os eventos escolhidos antes de finalizar a compra.",
  robots: NAO_INDEXAR,
};

export default function CarrinhoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
