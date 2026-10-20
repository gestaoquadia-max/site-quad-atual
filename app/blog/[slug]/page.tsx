import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts, professores } from "@/lib/data";
import { modalidades } from "@/lib/conteudo";
import { metadadosDaPagina } from "@/lib/seo";
import Trilha from "@/components/Trilha";
import { ImagemDoArtigo } from "@/components/blog/ListaDoBlog";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};
  return metadadosDaPagina({ titulo: post.titulo, descricao: post.resumo, caminho: `/blog/${post.slug}` });
}

export default async function PostDetalhe({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const indice = posts.findIndex((p) => p.slug === slug);
  const post = posts[indice];
  if (!post) notFound();
  const proximo = posts[(indice + 1) % posts.length];
  const leiaTambem = posts.filter((p) => p.slug !== post.slug).slice(0, 4);
  const categorias = [...new Set(posts.map((p) => p.categoria))];
  // Autor que é professor do Quad leva à página dele.
  const professor = professores.find((p) => p.nome === post.autor);
  const [abertura, ...resto] = post.conteudo;

  return (
    <>
      <section className="relative bg-marinho-950 pt-[clamp(40px,5vw,64px)] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_60%_at_80%_0%,rgba(0,107,255,0.24),transparent_70%)]" />
        <div className="conteiner relative">
          <Trilha
            itens={[{ rotulo: "Início", href: "/" }, { rotulo: "Blog", href: "/blog" }, { rotulo: post.categoria }]}
            className="mb-[clamp(24px,3vw,36px)]"
          />
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-azul-ceu">{post.categoria}</span>
          <h1 className="mb-5 mt-3 max-w-[900px] font-display text-[clamp(2.2rem,4.6vw,3.8rem)] font-extrabold leading-[1.04] tracking-[-0.035em] [text-wrap:balance]">
            {post.titulo}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-prata">
            {professor ? (
              <Link href={`/professores/${professor.slug}`} className="font-semibold text-white hover:text-azul-ceu">
                {post.autor}
              </Link>
            ) : (
              <span className="font-semibold text-white">{post.autor}</span>
            )}
            <span aria-hidden="true">•</span>
            <span>{post.data}</span>
            <span aria-hidden="true">•</span>
            <span>{post.tempoLeitura} de leitura</span>
          </div>
          {/* A imagem atravessa a divisa entre o topo escuro e o fundo claro. */}
          <ImagemDoArtigo post={post} className="relative top-[clamp(32px,4vw,56px)] mt-[clamp(28px,3vw,40px)] -mb-[clamp(32px,4vw,56px)] aspect-[21/8] rounded-[22px] shadow-[0_40px_80px_-40px_rgba(7,20,38,0.8)]" tamanhos="(min-width: 1440px) 1330px, 94vw" />
        </div>
      </section>

      <section className="bg-nevoa pb-[clamp(56px,7vw,96px)] pt-[clamp(88px,9.5vw,136px)]">
        <div className="conteiner grid items-start gap-[clamp(32px,5vw,80px)] lg:grid-cols-[minmax(0,760px)_minmax(0,360px)] lg:justify-between">
          <article>
            <p className="mb-6 text-[clamp(18px,1.6vw,21px)] leading-[1.65] text-tinta">{abertura}</p>
            {resto.map((paragrafo, i) => (
              <p key={i} className="mb-6 text-[17px] leading-[1.8] text-ardosia-escura">
                {paragrafo}
              </p>
            ))}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-linha pt-6">
              <div>
                <div className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-ardosia">Escrito por</div>
                <div className="mt-1 font-display text-lg font-extrabold">{post.autor}</div>
              </div>
              <Link href="/blog" className="btn-q btn-q-contorno h-11 px-[18px] text-sm">
                Voltar ao blog
              </Link>
            </div>
            {proximo && proximo.slug !== post.slug && (
              <Link
                href={`/blog/${proximo.slug}`}
                className="mt-5 block rounded-2xl border border-linha bg-white px-6 py-5 text-right text-tinta transition-colors hover:border-azul/45 hover:text-tinta"
              >
                <span className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-ardosia">Próximo →</span>
                <span className="mt-1 block font-display text-[17px] font-bold">{proximo.titulo}</span>
              </Link>
            )}
          </article>

          <aside className="flex flex-col gap-5 lg:sticky lg:top-[124px]">
            <div className="rounded-[20px] bg-[#0B1C33] bg-[image:radial-gradient(70%_60%_at_100%_0%,rgba(0,107,255,0.24),transparent_70%)] p-6 text-white">
              <div className="mb-4 flex gap-2" aria-hidden="true">
                {modalidades.map((m) => (
                  <Image key={m.id} src={m.insignia} alt="" width={44} height={44} className="h-11 w-11 object-contain" />
                ))}
              </div>
              <span className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-azul-ceu">Turmas presenciais</span>
              <p className="mb-4 mt-2 font-display text-[22px] font-extrabold leading-[1.15] tracking-[-0.02em]">Escolha o seu nível de preparação</p>
              <Link href="/turmas" className="btn-q btn-q-azul h-12 w-full text-[15px]">
                Conhecer as modalidades
              </Link>
            </div>

            <div className="rounded-[20px] border border-linha bg-white p-6">
              <h2 className="border-b border-linha pb-3 font-display text-[17px] font-extrabold">Leia também</h2>
              <ul>
                {leiaTambem.map((p) => (
                  <li key={p.slug} className="border-b border-linha last:border-0">
                    <Link href={`/blog/${p.slug}`} className="block py-3.5 text-tinta hover:text-azul">
                      <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-azul-forte">{p.categoria}</span>
                      <span className="mt-1 block text-[15px] font-semibold leading-[1.35]">{p.titulo}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[20px] border border-linha bg-white p-6">
              <h2 className="mb-3 font-display text-[17px] font-extrabold">Categorias</h2>
              <div className="flex flex-wrap gap-2">
                {categorias.map((c) => (
                  <Link
                    key={c}
                    href={`/blog?cat=${encodeURIComponent(c)}`}
                    aria-current={c === post.categoria ? "page" : undefined}
                    className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${
                      c === post.categoria ? "bg-marinho-950 text-white hover:text-white" : "bg-nevoa text-ardosia-escura hover:bg-azul-palido hover:text-azul-forte"
                    }`}
                  >
                    {c}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
