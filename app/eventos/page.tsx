import { eventos } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";

export const metadata = { title: "Eventos — Quad Concursos" };

export default function EventosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Agenda Quad"
        title="Eventos"
        desc="Simulados, aulões, palestras e os grandes encontros da comunidade Quad."
      />
      <section className="py-section">
        <div className="mx-auto max-w-site px-6">
          <div className="grid gap-5 md:grid-cols-3">
            {eventos.map((e, i) => (
              <Reveal key={e.nome} className="h-full" delay={Math.min(i, 5) * 70}>
                <ProductCard
                  tag={e.tag}
                  nome={e.nome}
                  desc={e.desc}
                  preco={e.preco}
                  status={e.status}
                  statusLabel={e.statusLabel}
                  tipo="evento"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
