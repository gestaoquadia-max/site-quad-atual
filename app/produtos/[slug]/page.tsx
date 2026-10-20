import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { produtos } from "@/lib/data";
import { metadadosDaPagina } from "@/lib/seo";
import CheckList from "@/components/CheckList";
import CapaDoLivro, { CORES_DA_CAPA } from "@/components/CapaDoLivro";
import CompraDoMaterial from "@/components/materiais/CompraDoMaterial";
import { ehKit } from "@/lib/materiais";

export function generateStaticParams() {
  return produtos.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const produto = produtos.find((p) => p.slug === slug);
  if (!produto) return {};
  return metadadosDaPagina({ titulo: produto.nome, descricao: produto.detalhe?.lead ?? produto.desc, caminho: `/produtos/${produto.slug}` });
}

export default async function ProdutoDetalhe({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const produto = produtos.find((p) => p.slug === slug);
  if (!produto || !produto.detalhe) notFound();
  const d = produto.detalhe;
  const kit = ehKit(produto);
  const indice = produtos.indexOf(produto);
  // "PDF · 240 págs" → "240 págs"; "Combo · 5 PDFs" → "5 materiais".
  const resumo = produto.tag.split(" · ")[1]?.replace("PDFs", "materiais");

  return (
    <>
      <section className="relative overflow-hidden bg-marinho-950 pb-[clamp(56px,7vw,88px)] pt-[clamp(32px,5vw,56px)] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_70%_at_20%_40%,rgba(0,107,255,0.24),transparent_70%)]" />
        <div className="relative mx-auto max-w-[1200px] px-[clamp(20px,4vw,32px)]">
          <nav aria-label="Trilha" className="mb-[clamp(24px,4vw,40px)] flex flex-wrap gap-2 text-[13px] text-prata-escura">
            <Link href="/" className="text-prata hover:text-white">
              Início
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/produtos" className="text-prata hover:text-white">
              Materiais
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-white">
              {produto.nome}
            </span>
          </nav>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-center gap-[clamp(32px,5vw,64px)]">
            <div className="relative flex justify-center py-6">
              <div aria-hidden="true" className="absolute bottom-2 left-[22%] right-[22%] h-6 rounded-full bg-black/60 blur-[14px]" />
              <div className="relative w-[min(340px,70%)]">
                <CapaDoLivro titulo={produto.nome} cor={CORES_DA_CAPA[indice % CORES_DA_CAPA.length]} tamanhoDoTitulo={30} />
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-azul-ceu">{kit ? "Kit de materiais" : "Material de estudo"}</div>
              <h1 className="mb-4 mt-3 font-display text-[clamp(2.2rem,4.6vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">{produto.nome}</h1>
              <p className="text-lg leading-[1.55] text-[#DCE4EF]">{produto.desc}</p>
              {resumo && <p className="mt-2 text-sm text-prata">{resumo}</p>}
              <CompraDoMaterial produto={produto} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-[clamp(56px,7vw,88px)]">
        <div className="mx-auto grid max-w-[1200px] gap-6 px-[clamp(20px,4vw,32px)] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="rounded-[18px] border border-linha bg-white p-[clamp(28px,4vw,48px)]">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-azul-forte">Sobre o material</span>
            <h2 className="mb-4 mt-2 font-display text-2xl font-extrabold tracking-[-0.02em]">O que você vai receber</h2>
            <p className="mb-7 max-w-[680px] text-[15.5px] leading-[1.65] text-ardosia-escura">{d.lead}</p>
            <h3 className="mb-3 font-display text-lg font-extrabold">{kit ? "Materiais do kit" : "Sumário"}</h3>
            <CheckList items={d.sumario} />
          </div>
          <div className="self-start rounded-[18px] bg-marinho-900 p-[clamp(24px,3vw,36px)] text-white">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-azul-ceu">Ficha</span>
            <dl className="mt-3">
              {d.specs.map((s) => (
                <div key={s.label} className="flex items-center justify-between gap-4 border-b border-white/[0.08] py-3.5 last:border-0">
                  <dt className="text-sm text-prata">{s.label}</dt>
                  <dd className={`font-display text-[15px] font-bold ${s.destaque ? "text-azul-ceu" : ""}`}>{s.valor}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
