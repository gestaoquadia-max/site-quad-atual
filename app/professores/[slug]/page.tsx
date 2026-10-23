import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { buscarProfessor, listarProfessores } from "@/lib/vitrine";
import { getIniciais } from "@/lib/format";
import Trilha from "@/components/Trilha";
import { metadadosDaPagina } from "@/lib/seo";

// Foto recortada (sem fundo) usada no topo, pelo nome; quem não tem usa a foto do cadastro.
const FOTO_DO_TOPO: Record<string, string> = { "Danilo Moura": "/images/danilo-hero.png" };

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts). Professor cadastrado depois do build é gerado na primeira visita.
export const revalidate = 60;

export async function generateStaticParams() {
  return ((await listarProfessores()) ?? []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const professor = await buscarProfessor(slug);
  if (!professor) return {};
  const descricao = professor.bio ?? `${professor.nome}, professor do Quad Concursos${professor.materia ? ` (${professor.materia})` : ""}.`;
  return metadadosDaPagina({ titulo: professor.nome, descricao, caminho: `/professores/${professor.slug}` });
}

export default async function ProfessorDetalhe({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const professor = await buscarProfessor(slug);
  if (!professor) notFound();
  // Professor renomeado: o id continua o mesmo, então leva ao endereço com o nome atual.
  if (professor.slug !== slug) redirect(`/professores/${professor.slug}`);
  const foto = FOTO_DO_TOPO[professor.nome] ?? professor.fotoUrl;
  const recortada = professor.nome in FOTO_DO_TOPO;
  const outros = ((await listarProfessores()) ?? []).filter((p) => p.slug !== professor.slug);

  return (
    <>
      <section className="relative overflow-hidden bg-marinho-950 text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_70%_at_78%_30%,rgba(0,107,255,0.3),transparent_70%)]" />
        {/* Breadcrumb numa faixa própria no topo; abaixo, texto e foto lado a lado: o texto logo abaixo do breadcrumb e os
            botões embaixo, na altura em que a foto termina. */}
        <div className="conteiner relative pt-[clamp(28px,4vw,48px)]">
          <Trilha itens={[{ rotulo: "Início", href: "/" }, { rotulo: "Professores", href: "/#professores" }, { rotulo: professor.nome }]} />
        </div>
        <div className="conteiner relative grid items-start gap-x-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="flex flex-col self-stretch pb-[clamp(32px,4vw,56px)] pt-[clamp(24px,3vw,40px)]">
            {professor.materia && <span className="text-xs font-bold uppercase tracking-[0.14em] text-azul-ceu">{professor.materia}</span>}
            <h1 className="mb-5 mt-3 font-display text-[clamp(2.6rem,5.4vw,4.4rem)] font-extrabold leading-none tracking-[-0.045em]">{professor.nome}</h1>
            {professor.bio && <p className="max-w-[600px] text-[clamp(16px,1.4vw,18px)] leading-[1.65] text-[#C9D5E5]">{professor.bio}</p>}
            <div className="mt-8 flex flex-wrap gap-3 md:mt-auto md:pt-8">
              <Link href="/turmas" className="btn-q btn-q-azul h-[52px] px-6 text-[15px]">
                Conhecer as turmas presenciais
              </Link>
              <Link href="/#professores" className="btn-q btn-q-contorno-escuro h-[52px] px-6 text-[15px]">
                Todos os professores
              </Link>
            </div>
          </div>
          <div className="relative hidden h-[clamp(340px,32vw,480px)] self-end md:block">
            {foto ? (
              <Image
                src={foto}
                alt=""
                fill
                priority
                sizes="(min-width: 1440px) 600px, 42vw"
                className={recortada ? "object-contain object-[20%_100%]" : "rounded-t-[28px] object-cover object-top"}
              />
            ) : (
              <span aria-hidden="true" className="absolute inset-0 grid select-none place-items-center font-display text-[clamp(140px,16vw,240px)] font-extrabold text-white/[0.06]">
                {getIniciais(professor.nome)}
              </span>
            )}
          </div>
        </div>
      </section>

      {outros.length > 0 && (
        <section className="secao bg-white">
          <div className="conteiner">
            <h2 className="titulo-secao mb-8">Outros professores</h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-5">
              {outros.map((p) => (
                <Link
                  key={p.slug}
                  href={`/professores/${p.slug}`}
                  className="flex items-center gap-4 rounded-[18px] border border-linha bg-white p-5 text-tinta transition-[transform,border-color] duration-200 hover:-translate-y-[3px] hover:border-azul/45 hover:text-tinta"
                >
                  <span className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-marinho-900 font-display text-lg font-extrabold text-white">
                    {p.fotoUrl ? <Image src={p.fotoUrl} alt="" fill sizes="64px" className="object-cover" /> : getIniciais(p.nome)}
                  </span>
                  <span>
                    <span className="block font-display text-lg font-extrabold leading-tight">{p.nome}</span>
                    <span className="mt-1 block text-sm text-ardosia">{p.materia}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
