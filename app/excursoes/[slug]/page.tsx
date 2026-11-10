import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import VerItem from "@/components/VerItem";
import { parsePreco } from "@/lib/format";
import { metadadosDaPagina } from "@/lib/seo";
import { diaBarraMes, esgotada, itemDoCarrinho } from "@/lib/excursoes";
import { buscarExcursao, listarExcursoes } from "@/lib/vitrine";
import { ArteDoEvento } from "@/components/eventos/AgendaDeEventos";
import CaixaDeInscricao from "@/components/eventos/CaixaDeInscricao";

// A página de uma excursão (lib/excursoes.ts), no visual da página de evento. As opções da mesma viagem (com e sem
// café) são endereços diferentes, ligados pelo seletor, como os turnos das turmas.

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts). Excursão que entrar na vitrine depois do build é gerada na primeira visita.
export const revalidate = 60;

export async function generateStaticParams() {
  return ((await listarExcursoes()) ?? []).flatMap((v) => v.opcoes.map((o) => ({ slug: o.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const achada = await buscarExcursao(slug);
  if (!achada) return {};
  const { atual } = achada;
  return metadadosDaPagina({
    titulo: atual.opcao ? `${atual.titulo} · ${atual.opcao}` : atual.titulo,
    descricao: `Viagem para o dia da prova com o Quad Concursos. ${atual.detalhes.slice(0, 2).join(" ")}`.trim(),
    caminho: `/excursoes/${atual.slug}`,
  });
}

export default async function ExcursaoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const achada = await buscarExcursao(slug);
  if (!achada) notFound();
  const { atual, viagem } = achada;
  // Excursão renomeada: o id continua o mesmo, então leva ao endereço com o nome atual.
  if (atual.slug !== slug) redirect(`/excursoes/${atual.slug}`);

  const semVagas = esgotada(atual);
  const item = itemDoCarrinho(atual);
  const specs = [
    atual.data && { label: "Viagem", valor: diaBarraMes(atual.data) },
    atual.concurso && { label: "Concurso", valor: atual.concurso },
    { label: "Embarque", valor: "No Quad" },
    atual.restantes !== null && { label: "Vagas restantes", valor: atual.ofertadas ? `${atual.restantes} de ${atual.ofertadas}` : String(atual.restantes), destaque: true },
  ].filter((s): s is { label: string; valor: string; destaque?: boolean } => Boolean(s));

  return (
    <>
      <VerItem item={{ item_id: atual.slug, item_name: item?.nome ?? atual.titulo, item_category: "Excursão", price: parsePreco(atual.preco ?? "") ?? undefined }} />

      <section className="relative overflow-hidden bg-marinho-950 pb-[clamp(56px,7vw,88px)] pt-[clamp(32px,5vw,56px)] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_70%_at_85%_20%,rgba(0,107,255,0.24),transparent_70%)]" />
        <div className="conteiner relative">
          <nav aria-label="Trilha" className="mb-[clamp(24px,4vw,40px)] flex flex-wrap gap-2 text-[13px] text-prata-escura">
            <Link href="/" className="text-prata hover:text-white">
              Início
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/eventos#excursoes" className="text-prata hover:text-white">
              Excursões
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-white">
              {atual.titulo}
            </span>
          </nav>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-start gap-[clamp(32px,5vw,80px)]">
            {atual.imagemUrl ? (
              <div className="relative aspect-square w-full max-w-[620px] overflow-hidden rounded-[20px] border border-white/10 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.85)]">
                <Image src={atual.imagemUrl} alt={atual.titulo} fill priority sizes="(min-width: 900px) 620px, 100vw" className="object-cover" />
              </div>
            ) : (
              <ArteDoEvento className="max-w-[620px] rounded-[20px] border border-white/10 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.85)]" />
            )}

            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-azul-ceu">Excursão para a prova</span>
              <h1 className="mb-4 mt-3 font-display text-[clamp(2.2rem,4.6vw,3.8rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">{atual.titulo}</h1>

              {viagem.opcoes.length > 1 && (
                <nav aria-label="Opções da excursão" className="mb-5">
                  <p className="mb-2 text-[13px] text-prata">
                    Opção · <strong className="font-semibold text-white">{atual.opcao}</strong>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {viagem.opcoes.map((o) =>
                      o.slug === atual.slug ? (
                        <span key={o.slug} aria-current="page" className="inline-flex h-11 items-center rounded-[10px] bg-white px-4 font-display text-[15px] font-bold text-marinho-950">
                          {o.opcao}
                        </span>
                      ) : (
                        <Link
                          key={o.slug}
                          href={`/excursoes/${o.slug}`}
                          className="inline-flex h-11 flex-col items-center justify-center rounded-[10px] border border-white/15 px-4 font-display text-[15px] font-bold text-white hover:border-white/40 hover:text-white"
                        >
                          {o.opcao}
                          <span className="text-[11px] font-semibold text-prata">{esgotada(o) ? "Esgotada" : o.preco}</span>
                        </Link>
                      ),
                    )}
                  </div>
                </nav>
              )}

              <dl className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                {specs.map((s) => (
                  <div key={s.label} className="bg-marinho-900 px-4 py-3.5">
                    <dt className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-prata">{s.label}</dt>
                    <dd className={`mt-1 font-display text-[17px] font-extrabold ${s.destaque ? "text-azul-ceu" : ""}`}>{s.valor}</dd>
                  </div>
                ))}
              </dl>

              {atual.preco && item ? (
                <CaixaDeInscricao
                  preco={atual.preco}
                  nota={[atual.precoCheio && `De ${atual.precoCheio}`, atual.lote, "Vaga individual · Confirmação por e-mail"].filter(Boolean).join(" · ")}
                  cta="Garantir minha vaga"
                  desabilitado={false}
                  vagas={atual.ofertadas && atual.restantes !== null ? { total: atual.ofertadas, ocupadas: atual.ofertadas - atual.restantes } : undefined}
                  item={item}
                />
              ) : (
                <p className="mt-6 rounded-[18px] border border-white/10 bg-marinho-900 p-5 text-[15px] text-prata">
                  {semVagas ? "Todas as vagas desta opção foram preenchidas." : "Valor a confirmar. Fale com o Quad pelo WhatsApp para garantir a sua vaga."}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {atual.detalhes.length > 0 && (
        <section className="py-[clamp(56px,7vw,88px)]">
          <div className="conteiner">
            <h2 className="mb-5 font-display text-[clamp(1.8rem,3vw,2.4rem)] font-extrabold tracking-[-0.03em]">Como vai ser a viagem</h2>
            <ul className="grid max-w-[820px] gap-2.5">
              {atual.detalhes.map((linha) => (
                <li key={linha} className="flex items-start gap-3 rounded-xl border border-linha bg-superficie px-5 py-4 text-[15.5px] leading-[1.55] text-ardosia-escura shadow-cartao">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="mt-1 flex-none text-azul">
                    <path d="M3 8.5l3.2 3L13 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {linha}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
