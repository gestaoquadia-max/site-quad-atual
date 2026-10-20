import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { professores } from "@/lib/data";
import { getIniciais } from "@/lib/format";
import Trilha from "@/components/Trilha";
import { metadadosDaPagina } from "@/lib/seo";

// Foto recortada (sem fundo) usada no topo; quem não tem usa a foto do cadastro.
const FOTO_DO_TOPO: Record<string, string> = { "danilo-moura": "/images/danilo-hero.png" };

export function generateStaticParams() {
  return professores.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const professor = professores.find((p) => p.slug === slug);
  if (!professor) return {};
  return metadadosDaPagina({ titulo: professor.nome, descricao: professor.bio, caminho: `/professores/${professor.slug}` });
}

export default async function ProfessorDetalhe({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const professor = professores.find((p) => p.slug === slug);
  if (!professor) notFound();
  const foto = FOTO_DO_TOPO[professor.slug] ?? professor.fotoUrl;
  const recortada = professor.slug in FOTO_DO_TOPO;
  const outros = professores.filter((p) => p.slug !== professor.slug);

  return (
    <>
      <section className="relative overflow-hidden bg-marinho-950 text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_70%_at_78%_30%,rgba(0,107,255,0.3),transparent_70%)]" />
        <div className="conteiner relative grid items-end gap-8 pt-[clamp(40px,5vw,64px)] md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
          <div className="pb-[clamp(48px,6vw,88px)]">
            <Trilha
              itens={[{ rotulo: "Início", href: "/" }, { rotulo: "Professores", href: "/#professores" }, { rotulo: professor.nome }]}
              className="mb-[clamp(28px,4vw,48px)]"
            />
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-azul-ceu">{professor.materia}</span>
            <h1 className="mb-5 mt-3 font-display text-[clamp(2.6rem,5.4vw,4.4rem)] font-extrabold leading-none tracking-[-0.045em]">{professor.nome}</h1>
            <p className="max-w-[560px] text-[clamp(16px,1.4vw,18px)] leading-[1.65] text-[#C9D5E5]">{professor.bioCompleta}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/turmas" className="btn-q btn-q-azul h-[52px] px-6 text-[15px]">
                Conhecer as turmas presenciais
              </Link>
              <Link href="/#professores" className="btn-q btn-q-contorno-escuro h-[52px] px-6 text-[15px]">
                Todos os professores
              </Link>
            </div>
          </div>
          <div className="relative hidden h-[clamp(380px,40vw,560px)] md:block">
            {foto ? (
              <Image
                src={foto}
                alt=""
                fill
                priority
                sizes="(min-width: 1440px) 600px, 42vw"
                className={recortada ? "object-contain object-bottom" : "rounded-t-[28px] object-cover object-top"}
              />
            ) : (
              <span aria-hidden="true" className="absolute inset-0 grid select-none place-items-center font-display text-[clamp(140px,16vw,240px)] font-extrabold text-white/[0.06]">
                {getIniciais(professor.nome)}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="secao bg-nevoa">
        <div className="conteiner">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-azul-forte">Formação e experiência</span>
          <h2 className="titulo-secao mb-8 mt-2">Credenciais</h2>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-4">
            {professor.formacao.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-[18px] border border-linha bg-white p-5 text-[15.5px] font-semibold leading-[1.45] text-tinta">
                <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-azul-palido text-azul-forte">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
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
