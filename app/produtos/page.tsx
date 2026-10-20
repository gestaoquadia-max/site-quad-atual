import { metadadosDaPagina } from "@/lib/seo";
import { listarMateriais } from "@/lib/vitrine";
import CatalogoDeMateriais from "@/components/materiais/CatalogoDeMateriais";

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts); o Next exige um número escrito aqui.
export const revalidate = 60;

export const metadata = metadadosDaPagina({
  titulo: "Materiais de estudo",
  descricao:
    "Apostilas com teoria direto ao ponto e questões comentadas da banca para PM-BA e outros concursos militares, com retirada no Quad.",
  caminho: "/produtos",
});

export default async function ProdutosPage() {
  return <CatalogoDeMateriais produtos={await listarMateriais()} />;
}
