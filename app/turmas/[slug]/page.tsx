import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import SpecsGrid from "@/components/SpecsGrid";
import BuyBox from "@/components/BuyBox";
import { idDoItem } from "@/lib/itens";
import CheckList from "@/components/CheckList";
import Gallery from "@/components/Gallery";
import { metadadosDaPagina } from "@/lib/seo";
import DadosEstruturados from "@/components/DadosEstruturados";
import { dadosDoCurso } from "@/lib/dados-estruturados";
import { buscarTurma, listarTurmas } from "@/lib/vitrine";

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts). Turma que entrar na vitrine depois do build é gerada na primeira visita.
export const revalidate = 60;

export async function generateStaticParams() {
  return ((await listarTurmas()) ?? []).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const turma = await buscarTurma(slug);
  if (!turma) return {};
  return metadadosDaPagina({ titulo: turma.nome, descricao: turma.detalhe?.lead ?? turma.desc, caminho: `/turmas/${turma.slug}` });
}

export default async function TurmaDetalhe({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const turma = await buscarTurma(slug);
  if (!turma || !turma.detalhe) notFound();
  // Turma renomeada: o id continua o mesmo, então leva ao endereço com o nome atual.
  if (turma.slug !== slug) redirect(`/turmas/${turma.slug}`);
  const d = turma.detalhe;
  const esgotada = turma.status === "encerrada";

  return (
    <>
      <DadosEstruturados dados={dadosDoCurso(turma)} />
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
              <span className="eyebrow text-blue">{turma.tag}</span>
              <h1 className="font-display my-4 text-h1 font-bold uppercase leading-[1.1]">
                {turma.nome}
              </h1>
              <p className="max-w-[520px] text-base text-steel-light">{d.lead}</p>
              <SpecsGrid specs={d.specs} />
            </div>
            <BuyBox
              preco={turma.preco}
              precoSufixo={turma.precoSufixo}
              nota={
                esgotada
                  ? "Todas as vagas desta turma foram preenchidas"
                  : "Material didático incluso · Sem taxa de matrícula · Parcele em até 3x no cartão"
              }
              cta={esgotada ? "Turma esgotada" : "Garantir minha vaga"}
              desabilitado={esgotada}
              item={{
                id: idDoItem("turma", turma.slug),
                tipo: "turma",
                nome: turma.nome,
                tag: turma.tag,
                preco: turma.preco,
                precoSufixo: turma.precoSufixo,
              }}
              vagas={
                d.vagasTotal !== undefined && d.vagasOcupadas !== undefined
                  ? { total: d.vagasTotal, ocupadas: d.vagasOcupadas }
                  : undefined
              }
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

          {/* A vitrine da API ainda não tem "o que está incluso" nem os professores da turma (docs/contrato-api-conteudo.md). */}
          {d.incluso.length > 0 && (
            <div className="mb-11">
              <span className="eyebrow">Conteúdo</span>
              <h2 className="font-display my-4 text-2xl font-bold uppercase">O que está incluso</h2>
              <CheckList items={d.incluso} />
            </div>
          )}

          <div className={d.professores.length > 0 ? "mb-11" : ""}>
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

          {d.professores.length > 0 && (
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
          )}
        </div>
      </div>
    </>
  );
}
