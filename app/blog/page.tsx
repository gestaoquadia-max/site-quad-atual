import { Suspense } from "react";
import { posts } from "@/lib/data";
import { metadadosDaPagina } from "@/lib/seo";
import ListaDoBlog from "@/components/blog/ListaDoBlog";
import ComFiltrosDoEndereco from "@/components/blog/ComFiltrosDoEndereco";

export const metadata = metadadosDaPagina({
  titulo: "Blog",
  descricao: "Editais, método de estudo, preparação física e bastidores da preparação para concursos militares, pelos professores do Quad.",
  caminho: "/blog",
});

export default function BlogPage() {
  // Sem os filtros do endereço (enquanto a página carrega no navegador), mostra a lista completa.
  return (
    <Suspense fallback={<ListaDoBlog posts={posts} categoriaInicial={null} buscaInicial="" />}>
      <ComFiltrosDoEndereco posts={posts} />
    </Suspense>
  );
}
