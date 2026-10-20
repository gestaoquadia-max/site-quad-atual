import { notFound } from "next/navigation";
import PaginaEmBreve from "@/components/PaginaEmBreve";
import { NAO_INDEXAR } from "@/lib/seo";
import { buscarProdutoDaLoja, listarProdutosDaLoja } from "@/lib/vitrine";

// Página nova do redesenho (Etapa 13, Bloco 8). O produto já vem da vitrine de itens da API.
export const metadata = { title: "Loja Quad", robots: NAO_INDEXAR };

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts).
export const revalidate = 60;

export async function generateStaticParams() {
  return ((await listarProdutosDaLoja()) ?? []).map((p) => ({ id: p.id }));
}

export default async function ProdutoDaLojaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const produto = await buscarProdutoDaLoja(id);
  if (!produto) notFound();
  return (
    <PaginaEmBreve
      titulo={produto.nome}
      texto="A página deste produto está chegando ao site, com fotos, tamanhos e retirada na sede do Quad."
      acao={{ href: "/contato", label: "Fale com a gente" }}
    />
  );
}
