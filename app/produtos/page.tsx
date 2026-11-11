import { metadadosDaPagina } from "@/lib/seo";
import { listarMateriais } from "@/lib/vitrine";
import CatalogoDeMateriais from "@/components/materiais/CatalogoDeMateriais";
import SecaoDeCombos from "@/components/combos/SecaoDeCombos";
import { listarCombosDaArea } from "@/lib/combos";
import PaginaEmEspera from "@/components/PaginaEmEspera";
import { BLACK_FRIDAY } from "@/lib/black-friday";
import { AberturaDaBlackFriday, FaixaDaData, GrupoVip, PaginaDaBlackFriday } from "@/components/blackfriday/PartesDaBlackFriday";
import OfertasDosMateriais from "@/components/blackfriday/OfertasDosMateriais";

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts); o Next exige um número escrito aqui.
export const revalidate = 60;

export const metadata = BLACK_FRIDAY.materiais
  ? metadadosDaPagina({
      titulo: "Materiais de estudo · Black Friday",
      descricao: "Materiais digitais a partir de R$ 29,90 e Combo de Simulados por R$ 19,00 na Black Friday de 27/11: Vade Mecum e módulos teóricos.",
      caminho: "/produtos",
    })
  : metadadosDaPagina({
      titulo: "Materiais de estudo",
      descricao: "Apostilas com teoria direto ao ponto e questões comentadas da banca para PM-BA e outros concursos militares, com retirada no Quad.",
      caminho: "/produtos",
    });

// Na Black Friday (lib/black-friday.ts), a página da campanha no lugar do catálogo; trocando a chave, volta o
// catálogo de sempre, com os combos de materiais.
function PaginaDaBlackFridayDosMateriais() {
  return (
    <PaginaDaBlackFriday>
      <AberturaDaBlackFriday
        area="Materiais"
        titulo="Materiais digitais a partir de"
        preco="R$ 29,90"
        descricao={
          <>
            Vade Mecum, Módulos teóricos e <strong className="font-extrabold text-white">Combo de Simulados por R$ 19,00</strong>, feitos a partir do edital do
            seu concurso.
          </>
        }
        segundoBotao={{ rotulo: "Ver os materiais", href: "#materiais" }}
      />
      <FaixaDaData />
      <OfertasDosMateriais />
      <GrupoVip />
    </PaginaDaBlackFriday>
  );
}

export default async function ProdutosPage() {
  if (BLACK_FRIDAY.materiais) {
    return (
      <PaginaEmEspera area="materiais" titulo="Materiais de estudo">
        <PaginaDaBlackFridayDosMateriais />
      </PaginaEmEspera>
    );
  }
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
