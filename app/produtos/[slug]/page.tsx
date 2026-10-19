import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { produtos } from "@/lib/data";
import Breadcrumb from "@/components/Breadcrumb";
import SpecsGrid from "@/components/SpecsGrid";
import BuyBox from "@/components/BuyBox";
import { idDoItem } from "@/lib/itens";
import CheckList from "@/components/CheckList";
import Gallery from "@/components/Gallery";
import { metadadosDaPagina } from "@/lib/seo";

export function generateStaticParams() {
  return produtos.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const produto = produtos.find((p) => p.slug === slug);
  if (!produto) return {};
  return metadadosDaPagina({ titulo: `${produto.nome} em PDF`, descricao: produto.detalhe?.lead ?? produto.desc, caminho: `/produtos/${produto.slug}` });
}

export default async function ProdutoDetalhe({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const produto = produtos.find((p) => p.slug === slug);
  if (!produto || !produto.detalhe) notFound();
  const d = produto.detalhe;

  return (
    <>
      <div className="bg-navy-deep py-header text-offwhite">
        <div className="mx-auto max-w-site px-6">
          <Breadcrumb
            items={[
              { href: "/", label: "Início" },
              { href: "/produtos", label: "Materiais" },
              { label: produto.nome },
            ]}
          />
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_380px]">
            <div>
              <span className="eyebrow text-blue">{produto.tag}</span>
              <h1 className="font-display my-4 text-h1 font-bold uppercase leading-[1.1]">
                {produto.nome}
              </h1>
              <p className="max-w-[520px] text-base text-steel-light">{d.lead}</p>
              <SpecsGrid specs={d.specs} />
            </div>
            <BuyBox
              preco={produto.preco}
              nota="Acesso imediato após o pagamento · Disponível para sempre na sua área do aluno"
              cta="Comprar agora"
              item={{ id: idDoItem("produto", produto.slug), tipo: "produto", nome: produto.nome, tag: produto.tag, preco: produto.preco }}
            />
          </div>
        </div>
      </div>

      <div className="py-section">
        <div className="mx-auto max-w-narrow px-6">
          <div className="mb-11">
            <span className="eyebrow">Sobre o material</span>
            <h2 className="font-display my-4 text-2xl font-bold uppercase">O que você vai receber</h2>
            <p className="text-[#4A5462]">{d.lead}</p>
          </div>
          <div className="mb-11">
            <span className="eyebrow">Conteúdo</span>
            <h2 className="font-display my-4 text-2xl font-bold uppercase">Sumário</h2>
            <CheckList items={d.sumario} />
          </div>
          <div>
            <span className="eyebrow">Amostra</span>
            <h2 className="font-display my-4 text-2xl font-bold uppercase">Veja por dentro</h2>
            <Gallery
              items={[
                "Preview: página de teoria",
                "Questão comentada",
                "Mapa mental",
                "Sumário completo",
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
