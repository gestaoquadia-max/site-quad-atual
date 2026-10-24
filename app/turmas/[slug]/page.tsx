import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { metadadosDaPagina } from "@/lib/seo";
import { modalidades } from "@/lib/conteudo";
import { dadosDoCurso } from "@/lib/dados-estruturados";
import { buscarTurma, buscarTurmaComTurnos, listarTurmas } from "@/lib/vitrine";
import { insigniaDaTurma, seloDoCargoEConcurso } from "@/lib/turmas";
import InsigniaDaTurma from "@/components/turmas/InsigniaDaTurma";
import DadosEstruturados from "@/components/DadosEstruturados";
import CheckList from "@/components/CheckList";
import EscolhaDoTurno from "@/components/turmas/EscolhaDoTurno";

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
  const [turma, comTurnos, todas] = await Promise.all([buscarTurma(slug), buscarTurmaComTurnos(slug), listarTurmas()]);
  if (!turma || !turma.detalhe || !comTurnos) notFound();
  // Turma renomeada: o id continua o mesmo, então leva ao endereço com o nome atual.
  if (turma.slug !== slug) redirect(`/turmas/${turma.slug}`);
  const d = turma.detalhe;
  const { turma: grupo } = comTurnos;
  const modalidade = modalidades.find((m) => m.id === turma.modalidade);
  // As outras turmas da mesma modalidade e do mesmo concurso (outros turnos e números), já na ordem do número.
  const outras = (todas ?? []).filter((t) => t.slug !== turma.slug && t.modalidadeId === turma.modalidadeId && t.concurso === turma.concurso);
  // Seletor de turno: cada turno leva a OUTRA turma (outro número, outra página) da mesma modalidade e concurso.
  // Com mais de uma no mesmo turno, vai para a que começa mais perto desta (o mesmo ciclo), preferindo as com vaga;
  // as demais ficam em "Outras turmas". O botão mostra o número da turma de destino.
  const distancia = (t: { dataDeInicio?: string }) =>
    t.dataDeInicio && turma.dataDeInicio ? Math.abs(Date.parse(t.dataDeInicio) - Date.parse(turma.dataDeInicio)) : Infinity;
  const turnos = ["Manhã", "Tarde", "Noite"].map((nome) => {
    if (nome === turma.turno) return { nome, href: null, atual: true, destino: null };
    const doTurno = outras.filter((t) => t.turno === nome).sort((a, b) => distancia(a) - distancia(b));
    const destino = doTurno.find((t) => t.status === "aberta") ?? doTurno[0];
    return { nome, href: destino ? `/turmas/${destino.slug}` : null, atual: false, destino: destino?.nome ?? null };
  });

  return (
    <>
      <DadosEstruturados dados={dadosDoCurso(turma)} />

      <section className="relative overflow-hidden bg-marinho-950 pb-[clamp(56px,7vw,88px)] pt-[clamp(32px,5vw,56px)] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_70%_at_85%_20%,rgba(0,107,255,0.26),transparent_70%)]" />
        <div className="relative mx-auto max-w-[1200px] px-[clamp(20px,4vw,32px)]">
          <nav aria-label="Trilha" className="mb-[clamp(24px,4vw,40px)] flex flex-wrap gap-2 text-[13px] text-prata-escura">
            <Link href="/" className="text-prata hover:text-white">
              Início
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/turmas" className="text-prata hover:text-white">
              Turmas
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-white">
              {grupo.nome}
            </span>
          </nav>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-start gap-[clamp(32px,5vw,64px)]">
            {/* Capa: foto cadastrada na API ou, sem foto, o nome da turma sobre o fundo do Quad. */}
            <div className="relative aspect-[4/5] w-full max-w-[520px] overflow-hidden rounded-[18px] border border-white/10 bg-[linear-gradient(170deg,#12305A,#071426_75%)] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.85)]">
              {turma.imagem ? (
                <Image src={turma.imagem} alt={`Turma ${grupo.nome}`} fill priority sizes="(min-width: 900px) 520px, 100vw" className="object-cover" />
              ) : (
                <>
                  {/* Toda turma tem insígnia (a da modalidade); sem arquivo ainda, a marca do Quad. */}
                  <InsigniaDaTurma
                    insignia={insigniaDaTurma(grupo.modalidade)}
                    tamanho={240}
                    sizes="240px"
                    priority
                    className="absolute left-1/2 top-[38%] w-[46%] -translate-x-1/2 -translate-y-1/2 opacity-90"
                  />
                  <div aria-hidden="true" className="absolute inset-x-7 bottom-7">
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-azul-ceu">{turma.tag}</div>
                    <div className="mt-2.5 font-display text-[44px] font-extrabold leading-none tracking-[-0.035em] text-white/90">{grupo.nome}</div>
                  </div>
                </>
              )}
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-azul-ceu">{turma.tag}</div>
              <h1 className="mb-[18px] mt-3 font-display text-[clamp(2.2rem,4.6vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">{grupo.nome}</h1>
              {/* Cargo e concurso num selo só ("SD • PMBA"). Sem os dois, vale para todos (como "TODOS OS CONCURSOS" na planilha). */}
              <span className="inline-flex items-center rounded-full bg-[#E6ECFF] px-[11px] py-[5px] text-[12.5px] font-semibold text-[#1238C4]">
                {seloDoCargoEConcurso(grupo.cargo, grupo.concurso)}
              </span>
              <EscolhaDoTurno turma={grupo} turnos={turnos} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-[clamp(56px,7vw,88px)]">
        <div className="mx-auto grid max-w-[1200px] gap-6 px-[clamp(20px,4vw,32px)]">
          <div className="rounded-[18px] border border-linha bg-white p-[clamp(28px,4vw,48px)]">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-azul-forte">Sobre a turma</span>
            <h2 className="mb-4 mt-2 font-display text-2xl font-extrabold tracking-[-0.02em]">Como funciona</h2>
            <div className="grid max-w-[760px] gap-3 text-[15.5px] leading-[1.65] text-ardosia-escura">
              <p>{d.lead}</p>
              <p>
                A {grupo.nome} é a preparação presencial do Quad com rotina estruturada, simulados periódicos nos moldes da banca e
                acompanhamento individual de desempenho. Cada aluno recebe o material didático completo do Quad e acesso à área do aluno
                com PDFs diários, listas de exercícios e correções comentadas.
              </p>
            </div>
          </div>

          {outras.length > 0 && (
            <div className="rounded-[18px] border border-linha bg-white p-[clamp(28px,4vw,48px)]">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-azul-forte">Mesma modalidade</span>
              <h2 className="mb-5 mt-2 font-display text-2xl font-extrabold tracking-[-0.02em]">Outras turmas {turma.modalidadeNome}</h2>
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-3">
                {outras.map((t) => (
                  <li key={t.slug}>
                    <Link
                      href={`/turmas/${t.slug}`}
                      className="flex h-full flex-col gap-1 rounded-[14px] border border-linha p-4 text-tinta transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-azul/45 hover:text-tinta"
                    >
                      <span className="font-display text-[17px] font-extrabold">{t.nome}</span>
                      <span className="text-sm text-ardosia">{[t.turno, t.inicio && `início ${t.inicio}`].filter(Boolean).join(" · ")}</span>
                      <span className="mt-1 font-display text-[15px] font-bold">{t.preco}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {modalidade && (
            <Link
              href={`/turmas?m=${modalidade.id}`}
              className="group grid grid-cols-[88px_minmax(0,1fr)] items-center gap-5 rounded-[18px] bg-marinho-900 p-[clamp(22px,3vw,32px)] text-white transition-transform hover:-translate-y-0.5 hover:text-white sm:grid-cols-[88px_minmax(0,1fr)_auto]"
            >
              <Image src={modalidade.insignia} alt="" width={88} height={88} className="h-[88px] w-[88px] object-contain [filter:drop-shadow(0_8px_16px_rgba(0,0,0,0.5))]" />
              <div>
                <span className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-azul-ceu">Modalidade {modalidade.nome} · {modalidade.nivel}</span>
                <p className="mt-1.5 text-[15px] leading-[1.55] text-[#DCE4EF]">
                  {modalidade.perfil} {modalidade.metodo}
                </p>
              </div>
              <span className="col-span-2 font-display text-sm font-bold text-azul-ceu group-hover:text-white sm:col-span-1">Ver turmas {modalidade.nome} →</span>
            </Link>
          )}

          {d.incluso.length > 0 && (
            <div className="rounded-[18px] border border-linha bg-white p-[clamp(28px,4vw,48px)]">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-azul-forte">Conteúdo</span>
              <h2 className="mb-4 mt-2 font-display text-2xl font-extrabold tracking-[-0.02em]">O que está incluso</h2>
              <CheckList items={d.incluso} />
            </div>
          )}

          {/* Sem grade de professores na turma por enquanto (decisão de 21/10/2026); eles ficam na página de professores. */}
        </div>
      </section>
    </>
  );
}
