import { cursosOnline } from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import AccentCard from "@/components/AccentCard";
import Kicker from "@/components/Kicker";
import Reveal from "@/components/Reveal";

export const metadata = { title: "Cursos Online — Quad Concursos" };

export default function CursosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Preparação online · Via Tutory"
        title="Cursos Online"
        desc="Estude de onde estiver com a metodologia Quad. Acesso pela plataforma Tutory."
      />
      <section className="py-section">
        <div className="mx-auto max-w-site px-6">
          <div className="grid gap-5 md:grid-cols-3">
            {cursosOnline.map((c, i) => (
              <Reveal key={c.nome} className="h-full" delay={Math.min(i, 5) * 70}>
                <AccentCard className="h-full p-6">
                  <Kicker>{c.tag}</Kicker>
                  <h3 className="font-display mt-2 mb-1.5 text-[21px] font-bold uppercase leading-tight">
                    {c.nome}
                  </h3>
                  <p className="mb-4 text-sm text-[#5A6472]">{c.desc}</p>
                  <div className="flex items-center justify-between border-t border-light pt-3.5">
                    <span className="font-display text-xl font-bold text-navy">
                      {c.preco}
                      {c.precoSufixo && <small className="text-xs font-medium text-steel">{c.precoSufixo}</small>}
                    </span>
                    <a className="focus-ring btn btn-outline-dark px-4 py-2 text-xs" href="#" target="_blank">
                      Ir para Tutory →
                    </a>
                  </div>
                </AccentCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
