import { metadadosDaPagina } from "@/lib/seo";
import { listarMateriais } from "@/lib/vitrine";
import CatalogoDeMateriais from "@/components/materiais/CatalogoDeMateriais";
import SecaoDeCombos from "@/components/combos/SecaoDeCombos";
import { listarCombosDaArea } from "@/lib/combos";
import PaginaEmEspera from "@/components/PaginaEmEspera";

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts); o Next exige um número escrito aqui.
export const revalidate = 60;

export const metadata = metadadosDaPagina({
  titulo: "Materiais de estudo",
  descricao:
    "Apostilas com teoria direto ao ponto e questões comentadas da banca para PM-BA e outros concursos militares, com retirada no Quad.",
  caminho: "/produtos",
});

export default async function ProdutosPage() {
  const [produtos, combos] = await Promise.all([listarMateriais(), listarCombosDaArea("materiais")]);
  return (
    <PaginaEmEspera area="materiais" titulo="Materiais de estudo">
      <CatalogoDeMateriais produtos={produtos} />
      <SecaoDeCombos
        combos={combos}
        titulo="Combos com materiais"
        descricao="Apostilas junto com outros materiais, turmas, simulados ou produtos da loja, por um preço menor que a soma. O combo é pago à parte do carrinho, numa compra só."
        fundo="branco"
      />
    </PaginaEmEspera>
  );
}
