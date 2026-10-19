import ProductCard from "@/components/ProductCard";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { ListaErro, ListaVazia } from "@/components/EstadoLista";
import { metadadosDaPagina } from "@/lib/seo";
import { listarEventos } from "@/lib/vitrine";

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts); o Next exige um número escrito aqui.
export const revalidate = 60;

export const metadata = metadadosDaPagina({
  titulo: "Eventos e simulados",
  descricao:
    "Simulados abertos, aulões e eventos presenciais do Quad Concursos em Feira de Santana, com correção comentada pelos professores.",
  caminho: "/eventos",
});

export default async function EventosPage() {
  const eventos = await listarEventos();

  return (
    <>
      <PageHeader
        eyebrow="Agenda Quad"
        title="Eventos"
        desc="Simulados, aulões, palestras e os grandes encontros da comunidade Quad."
      />
      <section className="py-section">
        <div className="mx-auto max-w-site px-6">
          {eventos === null ? (
            <ListaErro mensagem="Não foi possível carregar a agenda agora. Tente novamente em instantes." />
          ) : eventos.length === 0 ? (
            <ListaVazia
              titulo="Nenhum evento com inscrições abertas"
              texto="Simulados, aulões e palestras aparecem aqui assim que as inscrições abrirem."
              acao={{ href: "/turmas", label: "Ver turmas" }}
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {eventos.map((e, i) => (
                <Reveal key={e.slug} className="h-full" delay={Math.min(i, 5) * 70}>
                  <ProductCard
                    nivelDoTitulo="h2"
                    slug={e.slug}
                    href={`/eventos/${e.slug}`}
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
          )}
        </div>
      </section>
    </>
  );
}
