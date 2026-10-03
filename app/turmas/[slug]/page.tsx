import { notFound } from "next/navigation";
import { turmas } from "@/lib/data";
import Breadcrumb from "@/components/Breadcrumb";
import SpecsGrid from "@/components/SpecsGrid";
import BuyBox from "@/components/BuyBox";
import { idDoItem } from "@/lib/itens";
import CheckList from "@/components/CheckList";
import Gallery from "@/components/Gallery";

export function generateStaticParams() {
  return turmas.filter((t) => t.detalhe).map((t) => ({ slug: t.slug }));
}

export default async function TurmaDetalhe({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const turma = turmas.find((t) => t.slug === slug);
  if (!turma || !turma.detalhe) notFound();
  const d = turma.detalhe;

  return (
    <>
      <div className="bg-navy-deep py-header text-offwhite">
        <div className="mx-auto max-w-site px-6">
          <Breadcrumb
            items={[
              { href: "/", label: "Início" },
              { href: "/turmas", label: "Turmas" },
              { label: turma.nome },
            ]}
          />
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_380px]">
            <div>
              <span className="eyebrow">{turma.tag} · Presencial</span>
              <h1 className="font-display my-4 text-h1 font-bold uppercase leading-[1.1]">
                {turma.nome}
              </h1>
              <p className="max-w-[520px] text-base text-steel-light">{d.lead}</p>
              <SpecsGrid specs={d.specs} />
            </div>
            <BuyBox
              preco={turma.preco}
              precoSufixo={turma.precoSufixo}
              nota="Material didático incluso · Sem taxa de matrícula · Parcele em até 3x no cartão"
              cta="Garantir minha vaga"
              item={{
                id: idDoItem("turma", turma.slug),
                tipo: "turma",
                nome: turma.nome,
                tag: turma.tag,
                preco: turma.preco,
                precoSufixo: turma.precoSufixo,
              }}
              vagas={{ total: d.vagasTotal, ocupadas: d.vagasOcupadas }}
            />
          </div>
        </div>
      </div>

      <div className="py-section">
        <div className="mx-auto max-w-narrow px-6">
          <div className="mb-11">
            <span className="eyebrow">Sobre a turma</span>
            <h2 className="font-display my-4 text-2xl font-bold uppercase">Como funciona</h2>
            <p className="mb-3 text-[#4A5462]">
              A {turma.nome} é a preparação presencial do Quad com rotina estruturada, simulados
              periódicos nos moldes da banca e acompanhamento individual de desempenho.
            </p>
            <p className="text-[#4A5462]">
              Cada aluno recebe o material didático completo do Quad e acesso à área do aluno com
              PDFs diários, listas de exercícios e correções comentadas.
            </p>
          </div>

          <div className="mb-11">
            <span className="eyebrow">Conteúdo</span>
            <h2 className="font-display my-4 text-2xl font-bold uppercase">O que está incluso</h2>
            <CheckList items={d.incluso} />
          </div>

          <div className="mb-11">
            <span className="eyebrow">Estrutura</span>
            <h2 className="font-display my-4 text-2xl font-bold uppercase">Nossa sede</h2>
            <Gallery
              items={[
                "Foto: fachada da sede Quad",
                "Sala de aula",
                "Espaço de estudo",
                "Área de convivência",
              ]}
            />
          </div>

          <div>
            <span className="eyebrow">Time</span>
            <h2 className="font-display my-4 text-2xl font-bold uppercase">Professores</h2>
            {d.professores.map((p) => (
              <div key={p.nome} className="flex items-center gap-3.5 border-b border-light py-3.5">
                <span className="hexagon font-display flex h-11 w-11 items-center justify-center bg-navy font-bold text-blue">
                  {p.iniciais}
                </span>
                <div>
                  <div className="text-[15px] font-semibold">{p.nome}</div>
                  <div className="text-xs text-steel">{p.papel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
