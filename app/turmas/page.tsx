import ProductCard from "@/components/ProductCard";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { ListaErro, ListaVazia } from "@/components/EstadoLista";
import { metadadosDaPagina } from "@/lib/seo";
import { listarTurmas } from "@/lib/vitrine";

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts); o Next exige um número escrito aqui.
export const revalidate = 60;

export const metadata = metadadosDaPagina({
  titulo: "Turmas presenciais",
  descricao:
    "Turmas presenciais para CFP Soldado PM-BA, CFO e outros concursos militares em Feira de Santana. Valor fechado pela duração, material incluso.",
  caminho: "/turmas",
});

export default async function TurmasPage() {
  const turmas = await listarTurmas();

  return (
    <>
      <PageHeader
        eyebrow="Preparação presencial"
        title="Turmas"
        desc="Rotina de treinamento estruturada, professores especialistas e acompanhamento próximo."
      />
      <section className="py-section">
        <div className="mx-auto max-w-site px-6">
          {turmas === null ? (
            <ListaErro mensagem="Não foi possível carregar as turmas agora. Tente novamente em instantes." />
          ) : turmas.length === 0 ? (
            <ListaVazia
              titulo="Nenhuma turma com matrícula aberta"
              texto="As próximas turmas aparecem aqui assim que as matrículas abrirem."
              acao={{ href: "/contato", label: "Fale com a gente" }}
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {turmas.map((t, i) => (
                <Reveal key={t.slug} className="h-full" delay={Math.min(i, 5) * 70}>
                  <ProductCard
                    nivelDoTitulo="h2"
                    slug={t.slug}
                    href={`/turmas/${t.slug}`}
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
          )}
        </div>
      </section>
    </>
  );
}
