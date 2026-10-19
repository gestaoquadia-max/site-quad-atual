import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { posts } from "@/lib/data";
import Breadcrumb from "@/components/Breadcrumb";
import { metadadosDaPagina } from "@/lib/seo";

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
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <div className="bg-navy-deep py-header text-offwhite">
        <div className="mx-auto max-w-narrow px-6">
          <Breadcrumb
            items={[
              { href: "/", label: "Início" },
              { href: "/blog", label: "Blog" },
              { label: post.titulo },
            ]}
          />
          <span className="eyebrow text-blue">{post.categoria}</span>
          <h1 className="font-display my-4 text-h1-sm font-bold uppercase leading-[1.15]">
            {post.titulo}
          </h1>
          <div className="flex items-center gap-2 text-sm text-steel-light">
            <span>{post.autor}</span>
            <span>·</span>
            <span>{post.data}</span>
            <span>·</span>
            <span>{post.tempoLeitura} de leitura</span>
          </div>
        </div>
      </div>

      <div className="py-section">
        <div className="mx-auto max-w-narrow px-6">
          {post.conteudo.map((paragrafo, i) => (
            <p key={i} className="mb-5 text-base leading-relaxed text-[#3A4452]">
              {paragrafo}
            </p>
          ))}
        </div>
      </div>
    </>
  );
}
