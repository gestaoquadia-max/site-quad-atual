import { produtos } from "@/lib/data";
import { metadadosDaPagina } from "@/lib/seo";
import CatalogoDeMateriais from "@/components/materiais/CatalogoDeMateriais";

export const metadata = metadadosDaPagina({
  titulo: "Materiais de estudo",
  descricao:
    "Apostilas com teoria direto ao ponto e questões comentadas da banca para PM-BA e outros concursos militares, em PDF ou impresso. Acesso imediato.",
  caminho: "/produtos",
});

export default function ProdutosPage() {
  return <CatalogoDeMateriais produtos={produtos} />;
}
