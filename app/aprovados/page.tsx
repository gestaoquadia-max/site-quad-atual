import { aprovados, historiasVideo } from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import AprovadoCard from "@/components/AprovadoCard";
import HistoriaVideoCard from "@/components/HistoriaVideoCard";
import SectionHead from "@/components/SectionHead";
import Reveal from "@/components/Reveal";
import { metadadosDaPagina } from "@/lib/seo";

export const metadata = metadadosDaPagina({
  titulo: "Aprovados",
  descricao:
    "Histórias de alunos do Quad Concursos aprovados na PM-BA, no CFO e em outras forças de segurança. Mais de 800 aprovados desde 2013.",
  caminho: "/aprovados",
});

export default function AprovadosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Histórias reais"
        title="Aprovados"
        desc="Mais de 800 alunos aprovados desde 2013. Conheça quem já vestiu a farda com o método Quad."
        bgClassName="bg-offwhite"
        textClassName="text-navy"
        descClassName="text-steel"
      />
      <section className="py-section">
        <div className="mx-auto max-w-site px-6">
          <div className="grid gap-5 lg:grid-cols-2">
            {aprovados.map((a, i) => (
              <Reveal key={a.nome} delay={Math.min(i, 5) * 70}>
                <AprovadoCard aprovado={a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy py-section text-offwhite">
        <div className="mx-auto max-w-site px-6">
          <SectionHead
            eyebrow="Depoimentos em vídeo"
            title="Histórias para se inspirar"
            desc="Ouça direto dos aprovados como foi a jornada até a farda."
            dark
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {historiasVideo.map((h, i) => (
              <Reveal key={h.nome} delay={Math.min(i, 5) * 70}>
                <HistoriaVideoCard historia={h} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
