import { metadadosDaPagina } from "@/lib/seo";
import { listarCarreiras, listarEventos, listarExcursoes } from "@/lib/vitrine";
import AgendaDeEventos from "@/components/eventos/AgendaDeEventos";
import SecaoDeExcursoes from "@/components/eventos/SecaoDeExcursoes";
import CalendarioDaAgenda from "@/components/eventos/CalendarioDaAgenda";
import SecaoDeCombos from "@/components/combos/SecaoDeCombos";
import { listarCombosDaArea } from "@/lib/combos";
import { hojeNaBahia, itensDaAgenda } from "@/lib/agenda";

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts); o Next exige um número escrito aqui.
export const revalidate = 60;

export const metadata = metadadosDaPagina({
  titulo: "Agenda de eventos",
  descricao:
    "Aulões, palestras e encontros do Quad Concursos em Feira de Santana, excursões para o dia da prova, a central de simulados e o calendário com todas as datas.",
  caminho: "/eventos",
});

// Agenda Quad (entrega da designer, 11/11/2026): topo com os próximos na agenda, Simulados do Quad, aulões e excursões
// (só quando houver) e o calendário do mês. A onda para o rodapé vem com ele (components/Footer.tsx).
export default async function EventosPage() {
  const [eventos, excursoes, carreiras, combos] = await Promise.all([
    listarEventos(),
    listarExcursoes(),
    listarCarreiras(),
    listarCombosDaArea("eventos"),
  ]);
  const hoje = hojeNaBahia();
  const agenda = itensDaAgenda({ carreiras, eventos, viagens: excursoes });

  return (
    <>
      <AgendaDeEventos eventos={eventos} proximos={agenda.filter((i) => i.data >= hoje).slice(0, 3)} />
      <SecaoDeExcursoes viagens={excursoes} />

      <section id="calendario" className="scroll-mt-[120px] bg-nevoa pb-[clamp(64px,8vw,100px)] pt-[clamp(48px,6vw,72px)]">
        <div className="conteiner flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="titulo-secao">Calendário</h2>
            <p className="text-[16.5px] text-ardosia">Todas as datas de simulados, excursões, aulões e outros eventos do mês.</p>
          </div>
          <CalendarioDaAgenda itens={agenda} hoje={hoje} />
        </div>
      </section>

      <SecaoDeCombos
        combos={combos}
        titulo="Combos com eventos"
        descricao="O evento junto com turmas, materiais, simulados ou produtos da loja, por um preço menor que a soma. O combo é pago à parte do carrinho, numa compra só."
      />
    </>
  );
}
