import { notFound } from "next/navigation";
import PaginaEmBreve from "@/components/PaginaEmBreve";
import { produtosDaLoja } from "@/lib/conteudo";
import { NAO_INDEXAR } from "@/lib/seo";

// Página nova do redesenho (Etapa 13, Bloco 8).
export const metadata = { title: "Loja Quad", robots: NAO_INDEXAR };

export function generateStaticParams() {
  return produtosDaLoja.map((p) => ({ id: p.id }));
}

export default async function ProdutoDaLojaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const produto = produtosDaLoja.find((p) => p.id === id);
  if (!produto) notFound();
  return (
    <PaginaEmBreve
      titulo={produto.nome}
      texto="A página deste produto está chegando ao site, com fotos, tamanhos e retirada na sede do Quad."
      acao={{ href: "/contato", label: "Fale com a gente" }}
    />
  );
}
