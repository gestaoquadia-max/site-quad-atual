import { notFound } from "next/navigation";
import { eventos } from "@/lib/data";
import Breadcrumb from "@/components/Breadcrumb";
import SpecsGrid from "@/components/SpecsGrid";
import BuyBox from "@/components/BuyBox";
import { idDoItem } from "@/lib/itens";
import CheckList from "@/components/CheckList";
import Gallery from "@/components/Gallery";

export function generateStaticParams() {
  return eventos.filter((e) => e.detalhe).map((e) => ({ slug: e.slug }));
}

export default async function EventoDetalhe({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const evento = eventos.find((e) => e.slug === slug);
  if (!evento || !evento.detalhe) notFound();
  const d = evento.detalhe;

  const emBreve = evento.status === "breve";
  const gratuito = evento.preco.trim().toLowerCase() === "gratuito";

  const cta = emBreve
    ? "Inscrições em breve"
    : gratuito
      ? "Fazer inscrição gratuita"
      : "Garantir minha inscrição";
  const nota = emBreve
    ? "Inscrições ainda não abertas · Alunos e ex-alunos têm prioridade na liberação das vagas"
    : gratuito
      ? "Inscrição gratuita · Vagas limitadas à capacidade do local · Confirmação por e-mail"
      : "Inscrição individual · Confirmação imediata por e-mail · Vagas limitadas";

  return (
    <>
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
              <span className="eyebrow">{evento.tag}</span>
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
              desabilitado={emBreve}
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
          <div className="mb-11">
            <span className="eyebrow">Sobre o evento</span>
            <h2 className="font-display my-4 text-2xl font-bold uppercase">O que vai acontecer</h2>
            {d.sobre.map((paragrafo) => (
              <p key={paragrafo} className="mb-3 text-[#4A5462] last:mb-0">
                {paragrafo}
              </p>
            ))}
          </div>

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

          <div className="mb-11">
            <span className="eyebrow">Inscrição</span>
            <h2 className="font-display my-4 text-2xl font-bold uppercase">O que está incluso</h2>
            <CheckList items={d.incluso} />
          </div>

          <div className={d.professores ? "mb-11" : ""}>
            <span className="eyebrow">Local</span>
            <h2 className="font-display my-4 text-2xl font-bold uppercase">Onde acontece</h2>
            <p className="text-[15px] font-semibold">{d.local.nome}</p>
            <p className="mt-1 text-[#4A5462]">{d.local.endereco}</p>
            {d.local.obs && <p className="mt-2 text-sm text-steel">{d.local.obs}</p>}
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
          </div>

          {d.professores && (
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
