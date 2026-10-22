import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { idDoItem } from "@/lib/itens";
import { metadadosDaPagina } from "@/lib/seo";
import { getIniciais } from "@/lib/format";
import { seloDoEvento } from "@/lib/eventos";
import { dadosDoEvento } from "@/lib/dados-estruturados";
import { buscarEvento, listarEventos } from "@/lib/vitrine";
import DadosEstruturados from "@/components/DadosEstruturados";
import { ArteDoEvento } from "@/components/eventos/AgendaDeEventos";
import CaixaDeInscricao from "@/components/eventos/CaixaDeInscricao";

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

const CORES_DO_SELO = {
  aberta: "bg-sucesso-fundo text-sucesso",
  breve: "bg-azul-palido text-azul-forte",
  esgotado: "bg-[#FFF0D9] text-[#8A4B00]",
  encerrado: "bg-[#EEF2F7] text-[#4A5A70]",
};

export default async function EventoDetalhe({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const evento = await buscarEvento(slug);
  if (!evento || !evento.detalhe) notFound();
  // Evento renomeado: o id continua o mesmo, então leva ao endereço com o nome atual.
  if (evento.slug !== slug) redirect(`/eventos/${evento.slug}`);
  const d = evento.detalhe;
  const outros = ((await listarEventos()) ?? []).filter((e) => e.slug !== evento.slug).slice(0, 4);

  const emBreve = evento.status === "breve";
  const esgotado = evento.status === "encerrada";
  const gratuito = evento.preco.trim().toLowerCase() === "gratuito";
  const selo = seloDoEvento(evento);

  const cta = emBreve ? "Inscrições em breve" : esgotado ? "Inscrições esgotadas" : gratuito ? "Fazer inscrição gratuita" : "Garantir minha inscrição";
  const nota = emBreve
    ? "Inscrições ainda não abertas · Alunos e ex-alunos têm prioridade na liberação das vagas"
    : esgotado
      ? "Todas as vagas deste evento foram preenchidas"
      : gratuito
        ? "Inscrição gratuita · Vagas limitadas à capacidade do local · Confirmação por e-mail"
        : "Inscrição individual · Confirmação imediata por e-mail · Vagas limitadas";
  const temLateral = (d.professores?.length ?? 0) > 0 || outros.length > 0;

  return (
    <>
      <DadosEstruturados dados={dadosDoEvento(evento)} />

      <section className="relative overflow-hidden bg-marinho-950 pb-[clamp(56px,7vw,88px)] pt-[clamp(32px,5vw,56px)] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_70%_at_85%_20%,rgba(0,107,255,0.24),transparent_70%)]" />
        <div className="conteiner relative">
          <nav aria-label="Trilha" className="mb-[clamp(24px,4vw,40px)] flex flex-wrap gap-2 text-[13px] text-prata-escura">
            <Link href="/" className="text-prata hover:text-white">
              Início
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/eventos" className="text-prata hover:text-white">
              Eventos
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-white">
              {evento.nome}
            </span>
          </nav>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-start gap-[clamp(32px,5vw,80px)]">
            <ArteDoEvento className="max-w-[620px] rounded-[20px] border border-white/10 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.85)]" />

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${CORES_DO_SELO[selo.tom]}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {selo.texto}
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-prata-clara">{evento.tag}</span>
              </div>
              <h1 className="mb-4 mt-4 font-display text-[clamp(2.2rem,4.6vw,3.8rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">{evento.nome}</h1>
              <p className="max-w-[620px] text-lg leading-[1.6] text-[#C9D5E5]">{d.lead}</p>

              <dl className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                {d.specs.map((s) => (
                  <div key={s.label} className="bg-marinho-900 px-4 py-3.5">
                    <dt className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-prata">{s.label}</dt>
                    <dd className={`mt-1 font-display text-[17px] font-extrabold ${s.destaque ? "text-azul-ceu" : ""}`}>{s.valor}</dd>
                  </div>
                ))}
              </dl>

              <CaixaDeInscricao
                preco={evento.preco}
                nota={nota}
                cta={cta}
                desabilitado={emBreve || esgotado}
                vagas={d.vagasTotal !== undefined && d.vagasOcupadas !== undefined ? { total: d.vagasTotal, ocupadas: d.vagasOcupadas } : undefined}
                item={{
                  id: idDoItem("evento", evento.slug),
                  tipo: "evento",
                  nome: evento.nome,
                  tag: evento.tag,
                  preco: evento.preco,
                  alvo: evento.idNaApi ? { atividade: { tipo: "EVENTO", id: evento.idNaApi } } : undefined,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-[clamp(56px,7vw,88px)]">
        <div className={`conteiner grid items-start gap-[clamp(32px,4vw,64px)] ${temLateral ? "lg:grid-cols-[minmax(0,1fr)_380px]" : ""}`}>
          <div className="flex min-w-0 flex-col gap-[clamp(40px,5vw,56px)]">
            {d.sobre.length > 0 && (
              <div>
                <h2 className="mb-4 font-display text-[clamp(1.8rem,3vw,2.4rem)] font-extrabold tracking-[-0.03em]">O que vai acontecer</h2>
                <div className="grid max-w-[820px] gap-4 text-[16.5px] leading-[1.75] text-ardosia-escura">
                  {d.sobre.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </div>
            )}

            {d.programacao.length > 0 && (
              <div>
                <h2 className="mb-5 font-display text-[clamp(1.8rem,3vw,2.4rem)] font-extrabold tracking-[-0.03em]">Roteiro do dia</h2>
                <ol className="relative max-w-[820px]">
                  {d.programacao.map((item) => (
                    <li key={item.horario} className="relative grid grid-cols-[64px_24px_minmax(0,1fr)] gap-x-3 pb-3 last:pb-0">
                      <span className="pt-4 font-display text-[15px] font-extrabold text-azul-forte">{item.horario}</span>
                      <span aria-hidden="true" className="relative flex justify-center">
                        <span className="absolute inset-y-0 w-px bg-linha-forte" />
                        <span className="relative mt-[19px] h-3 w-3 rounded-full border-[2.5px] border-azul-vivo bg-nevoa" />
                      </span>
                      <div className="rounded-xl border border-linha bg-white px-5 py-4">
                        <div className="text-[15.5px] font-semibold">{item.titulo}</div>
                        <div className="mt-0.5 text-sm text-ardosia">{item.desc}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {d.incluso.length > 0 && (
              <div>
                <h2 className="mb-5 font-display text-[clamp(1.8rem,3vw,2.4rem)] font-extrabold tracking-[-0.03em]">O que está incluso</h2>
                <ul className="grid max-w-[820px] gap-2.5 sm:grid-cols-2">
                  {d.incluso.map((item) => (
                    <li key={item} className="flex items-start gap-3 rounded-xl border border-linha bg-white px-5 py-4 text-[15px] leading-[1.5] text-ardosia-escura">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="mt-0.5 flex-none text-azul">
                        <path d="M3 8.5l3.2 3L13 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h2 className="mb-4 font-display text-[clamp(1.8rem,3vw,2.4rem)] font-extrabold tracking-[-0.03em]">Onde acontece</h2>
              <div className="grid max-w-[820px] gap-2 text-[16.5px] leading-[1.6] text-ardosia-escura">
                <p className="font-semibold text-tinta">{d.local.nome}</p>
                <p>{d.local.endereco}</p>
                {d.local.obs && <p className="text-[15px] text-ardosia">{d.local.obs}</p>}
              </div>
            </div>
          </div>

          {temLateral && (
            <aside className="flex flex-col gap-5 lg:sticky lg:top-[124px]">
              {d.professores && d.professores.length > 0 && (
                <div className="rounded-[20px] bg-marinho-900 p-[clamp(20px,2.4vw,24px)] text-white">
                  <h2 className="border-b border-white/[0.08] pb-3 text-[11.5px] font-bold uppercase tracking-[0.14em] text-azul-ceu">Quem conduz</h2>
                  <ul>
                    {d.professores.map((p) => (
                      <li key={p.nome} className="flex items-center gap-3 border-b border-white/[0.08] py-3.5 last:border-0 last:pb-0">
                        <span className="grid h-[42px] w-[42px] flex-none place-items-center rounded-full bg-marinho-700 font-display text-sm font-extrabold">{p.iniciais || getIniciais(p.nome)}</span>
                        <span>
                          <span className="block text-[15px] font-semibold">{p.nome}</span>
                          <span className="block text-[13px] text-prata">{p.papel}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {outros.length > 0 && (
                <div className="rounded-[20px] border border-linha bg-white p-[clamp(20px,2.4vw,24px)]">
                  <h2 className="border-b border-linha pb-3 font-display text-[17px] font-extrabold">Outros eventos</h2>
                  <ul>
                    {outros.map((o) => (
                      <li key={o.slug}>
                        <Link href={`/eventos/${o.slug}`} className="flex items-center gap-3 py-3 text-tinta hover:text-azul">
                          <span className="grid h-14 w-14 flex-none place-items-center rounded-xl bg-marinho-900 px-1 text-center font-display text-[11px] font-extrabold leading-tight text-white">
                            {o.tag.split(" · ")[0]}
                          </span>
                          <span>
                            <span className="block text-[15px] font-semibold">{o.nome}</span>
                            <span className="block text-[13px] text-ardosia">{o.tag}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          )}
        </div>
      </section>
    </>
  );
}
