import Link from "next/link";
import { posts } from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import AccentCard from "@/components/AccentCard";
import Kicker from "@/components/Kicker";
import Reveal from "@/components/Reveal";
import { metadadosDaPagina } from "@/lib/seo";

export const metadata = metadadosDaPagina({
  titulo: "Blog",
  descricao:
    "Editais, método de estudo, preparação física e bastidores dos concursos militares, direto de quem está na banca todos os dias.",
  caminho: "/blog",
});

export default function BlogPage() {
  return (
    <>
      <PageHeader
        eyebrow="Conteúdo Quad"
        title="Blog"
        desc="Editais, método de estudo e bastidores da preparação — direto de quem está na banca todos os dias."
      />
      <section className="py-section">
        <div className="mx-auto max-w-site px-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <Reveal key={p.slug} className="h-full" delay={Math.min(i, 5) * 70}>
                <Link href={`/blog/${p.slug}`} className="focus-ring block h-full">
                  <AccentCard className="h-full p-6">
                    <Kicker>{p.categoria}</Kicker>
                    <h2 className="font-display mt-2 mb-1.5 text-lg font-bold uppercase leading-tight">
                      {p.titulo}
                    </h2>
                    <p className="mb-4 text-sm text-[#5A6472]">{p.resumo}</p>
                    <div className="flex items-center justify-between border-t border-light pt-3.5 text-xs text-steel">
                      <span>{p.autor}</span>
                      <span>
                        {p.data} · {p.tempoLeitura}
                      </span>
                    </div>
                  </AccentCard>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
