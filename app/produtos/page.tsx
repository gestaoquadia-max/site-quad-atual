import { produtos } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";

export const metadata = { title: "Materiais — Quad Concursos" };

export default function ProdutosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Materiais digitais"
        title="PDFs e Apostilas"
        desc="Material direto ao ponto, atualizado com as últimas provas. Acesso imediato após a compra."
      />
      <section className="py-section">
        <div className="mx-auto max-w-site px-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {produtos.map((p, i) => (
              <Reveal key={p.slug} className="h-full" delay={Math.min(i, 5) * 70}>
                <ProductCard
                  href={`/produtos/${p.slug}`}
                  tag={p.tag}
                  nome={p.nome}
                  desc={p.desc}
                  preco={p.preco}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
