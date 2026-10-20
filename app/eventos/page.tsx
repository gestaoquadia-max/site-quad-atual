import { metadadosDaPagina } from "@/lib/seo";
import { listarEventos } from "@/lib/vitrine";
import AgendaDeEventos from "@/components/eventos/AgendaDeEventos";

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts); o Next exige um número escrito aqui.
export const revalidate = 60;

export const metadata = metadadosDaPagina({
  titulo: "Agenda de eventos",
  descricao:
    "Aulões, palestras e encontros do Quad Concursos em Feira de Santana, e a central de simulados presenciais, individuais e combos.",
  caminho: "/eventos",
});

export default async function EventosPage() {
  return <AgendaDeEventos eventos={await listarEventos()} />;
}
