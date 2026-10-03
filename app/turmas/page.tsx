import { turmas } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";

export const metadata = { title: "Turmas — Quad Concursos" };

export default function TurmasPage() {
  return (
    <>
      <PageHeader
        eyebrow="Preparação presencial"
        title="Turmas"
        desc="Rotina de treinamento estruturada, professores especialistas e acompanhamento próximo."
      />
      <section className="py-section">
        <div className="mx-auto max-w-site px-6">
          <div className="grid gap-5 md:grid-cols-3">
            {turmas.map((t, i) => (
              <Reveal key={t.slug} className="h-full" delay={Math.min(i, 5) * 70}>
                <ProductCard
                  slug={t.slug}
                  href={t.detalhe ? `/turmas/${t.slug}` : undefined}
                  tag={t.tag}
                  nome={t.nome}
                  desc={t.desc}
                  preco={t.preco}
                  precoSufixo={t.precoSufixo}
                  status={t.status}
                  statusLabel={t.statusLabel}
                  tipo="turma"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
