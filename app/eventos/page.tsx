import { metadadosDaPagina } from "@/lib/seo";
import { listarEventos } from "@/lib/vitrine";
import AgendaDeEventos from "@/components/eventos/AgendaDeEventos";
import SecaoDeCombos from "@/components/combos/SecaoDeCombos";
import { listarCombosDaArea } from "@/lib/combos";

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts); o Next exige um número escrito aqui.
export const revalidate = 60;

export const metadata = metadadosDaPagina({
  titulo: "Agenda de eventos",
  descricao:
    "Aulões, palestras e encontros do Quad Concursos em Feira de Santana, e a central de simulados presenciais, individuais e combos.",
  caminho: "/eventos",
});

export default async function EventosPage() {
  const [eventos, combos] = await Promise.all([listarEventos(), listarCombosDaArea("eventos")]);
  return (
    <>
      <AgendaDeEventos eventos={eventos} />
      <SecaoDeCombos
        combos={combos}
        titulo="Combos com eventos"
        descricao="O evento junto com turmas, materiais, simulados ou produtos da loja, por um preço menor que a soma. O combo é pago à parte do carrinho, numa compra só."
        fundo="branco"
      />
    </>
  );
}
