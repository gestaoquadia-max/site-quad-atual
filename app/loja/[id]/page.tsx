import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import Trilha from "@/components/Trilha";
import CompraDoProdutoDaLoja from "@/components/loja/CompraDoProdutoDaLoja";
import { categoriasDaLoja } from "@/lib/conteudo";
import { metadadosDaPagina } from "@/lib/seo";
import { buscarProdutoDaLoja, listarProdutosDaLoja } from "@/lib/vitrine";

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts).
export const revalidate = 60;

export async function generateStaticParams() {
  return ((await listarProdutosDaLoja()) ?? []).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const produto = await buscarProdutoDaLoja(id);
  if (!produto) return {};
  return metadadosDaPagina({
    titulo: produto.nome,
    descricao: produto.descricao ?? `${produto.nome}: produto oficial do Quad Concursos, com retirada na sede.`,
    caminho: `/loja/${produto.id}`,
  });
}

export default async function ProdutoDaLojaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const produto = await buscarProdutoDaLoja(id);
  if (!produto) notFound();
  // O endereço leva o nome e o id; com o nome antigo (produto renomeado), vai para o atual.
  if (produto.id !== id) redirect(`/loja/${produto.id}`);
  const categoria = categoriasDaLoja.find((c) => c.id === produto.categoria)?.nome;

  return (
    <div className="bg-nevoa">
      <div className="conteiner pb-[clamp(64px,8vw,112px)] pt-[clamp(24px,3vw,40px)]">
        <Trilha tom="claro" itens={[{ rotulo: "Início", href: "/" }, { rotulo: "Loja", href: "/loja" }, { rotulo: produto.nome }]} className="mb-[clamp(20px,3vw,32px)]" />
        <div className="flex flex-wrap items-start gap-[clamp(28px,4vw,72px)]">
          <div className="relative grid aspect-square min-w-0 flex-[1_1_520px] place-items-center overflow-hidden rounded-[20px] border border-linha bg-[#EAF0F7] text-ardosia">
            {produto.imagemUrl ? (
              <Image src={produto.imagemUrl} alt={produto.nome} fill priority sizes="(min-width: 1024px) 640px, 92vw" className="object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-sm font-medium">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                Foto em breve
              </span>
            )}
          </div>
          <div className="flex min-w-0 max-w-[560px] flex-[1_1_400px] flex-col gap-5 lg:sticky lg:top-[124px]">
            <div className="flex flex-col gap-2">
              {categoria && <span className="text-[13.5px] font-semibold text-azul-forte">{categoria}</span>}
              <h1 className="font-display text-[clamp(2.2rem,4vw,3.4rem)] font-extrabold leading-none tracking-[-0.04em]">{produto.nome}</h1>
            </div>
            <CompraDoProdutoDaLoja produto={produto} />
          </div>
        </div>
      </div>
    </div>
  );
}
