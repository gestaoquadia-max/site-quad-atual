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
import { dadosDoEvento } from "@/lib/dados-estruturados";
import { buscarEvento, listarEventos } from "@/lib/vitrine";

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts). Evento que entrar na vitrine depois do build é gerado na primeira visita.
export const revalidate = 60;

export async function generateStaticParams() {
  return ((await listarEventos()) ?? []).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const evento = await buscarEvento(slug);
  if (!evento) return {};
  return metadadosDaPagina({ titulo: evento.nome, descricao: evento.detalhe?.lead ?? evento.desc, caminho: `/eventos/${evento.slug}` });
}

export default async function EventoDetalhe({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const evento = await buscarEvento(slug);
  if (!evento || !evento.detalhe) notFound();
  // Evento renomeado: o id continua o mesmo, então leva ao endereço com o nome atual.
  if (evento.slug !== slug) redirect(`/eventos/${evento.slug}`);
  const d = evento.detalhe;

  const emBreve = evento.status === "breve";
  const esgotado = evento.status === "encerrada";
  const gratuito = evento.preco.trim().toLowerCase() === "gratuito";

  const cta = emBreve
    ? "Inscrições em breve"
    : esgotado
      ? "Inscrições esgotadas"
      : gratuito
        ? "Fazer inscrição gratuita"
        : "Garantir minha inscrição";
  const nota = emBreve
    ? "Inscrições ainda não abertas · Alunos e ex-alunos têm prioridade na liberação das vagas"
    : esgotado
      ? "Todas as vagas deste evento foram preenchidas"
      : gratuito
      ? "Inscrição gratuita · Vagas limitadas à capacidade do local · Confirmação por e-mail"
      : "Inscrição individual · Confirmação imediata por e-mail · Vagas limitadas";

  return (
    <>
      <DadosEstruturados dados={dadosDoEvento(evento)} />
      <div className="bg-navy-deep py-header text-offwhite">
        <div className="mx-auto max-w-site px-6">
          <Breadcrumb
            items={[
              { href: "/", label: "Início" },
              { href: "/eventos", label: "Eventos" },
              { label: evento.nome },
            ]}
          />
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_380px]">
            <div>
              <span className="eyebrow text-blue">{evento.tag}</span>
              <h1 className="font-display my-4 text-h1 font-bold uppercase leading-[1.1]">
                {evento.nome}
              </h1>
              <p className="max-w-[520px] text-base text-steel-light">{d.lead}</p>
              <SpecsGrid specs={d.specs} />
            </div>
            <BuyBox
              preco={evento.preco}
              nota={nota}
              cta={cta}
              desabilitado={emBreve || esgotado}
              item={{ id: idDoItem("evento", evento.slug), tipo: "evento", nome: evento.nome, tag: evento.tag, preco: evento.preco }}
              vagasLabel="Inscrições confirmadas"
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
          {/* A vitrine da API ainda não tem estes textos (docs/contrato-api-conteudo.md, seção 2.3): sem eles, a seção some. */}
          {d.sobre.length > 0 && (
            <div className="mb-11">
              <span className="eyebrow">Sobre o evento</span>
              <h2 className="font-display my-4 text-2xl font-bold uppercase">O que vai acontecer</h2>
              {d.sobre.map((paragrafo) => (
                <p key={paragrafo} className="mb-3 text-[#4A5462] last:mb-0">
                  {paragrafo}
                </p>
              ))}
            </div>
          )}

          {d.programacao.length > 0 && (
            <div className="mb-11">
              <span className="eyebrow">Programação</span>
              <h2 className="font-display my-4 text-2xl font-bold uppercase">Roteiro do dia</h2>
              {d.programacao.map((item) => (
                <div key={item.horario} className="flex gap-5 border-b border-light py-3.5">
                  <span className="font-display w-[68px] flex-shrink-0 text-[15px] font-bold text-navy">
                    {item.horario}
                  </span>
                  <div>
                    <div className="text-[15px] font-semibold">{item.titulo}</div>
                    <div className="text-sm text-[#5A6472]">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {d.incluso.length > 0 && (
            <div className="mb-11">
              <span className="eyebrow">Inscrição</span>
              <h2 className="font-display my-4 text-2xl font-bold uppercase">O que está incluso</h2>
              <CheckList items={d.incluso} />
            </div>
          )}

          <div className={d.professores?.length ? "mb-11" : ""}>
            <span className="eyebrow">Local</span>
            <h2 className="font-display my-4 text-2xl font-bold uppercase">Onde acontece</h2>
            <p className="text-[15px] font-semibold">{d.local.nome}</p>
            <p className="mt-1 text-[#4A5462]">{d.local.endereco}</p>
            {d.local.obs && <p className="mt-2 text-sm text-steel">{d.local.obs}</p>}
            {d.local.nome !== "Online" && (
              <div className="mt-5">
                <Gallery
                  items={[
                    `Foto: ${d.local.nome}`,
                    "Entrada e credenciamento",
                    "Auditório",
                    "Área de convivência",
                  ]}
                />
              </div>
            )}
          </div>

          {d.professores && d.professores.length > 0 && (
            <div>
              <span className="eyebrow">Time</span>
              <h2 className="font-display my-4 text-2xl font-bold uppercase">Quem conduz</h2>
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
