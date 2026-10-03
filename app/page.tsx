import Link from "next/link";
import { turmas, produtos, eventos, aprovados, professores, posts } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import SectionHead from "@/components/SectionHead";
import ProfessoresCarousel from "@/components/ProfessoresCarousel";
import AprovadoCard from "@/components/AprovadoCard";
import AccentCard from "@/components/AccentCard";
import Kicker from "@/components/Kicker";
import Reveal from "@/components/Reveal";

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-deep text-offwhite pt-[88px] pb-[72px]">
        <div className="hexagon pattern-diagonal pointer-events-none absolute -right-32 -top-10 h-[480px] w-[480px]" />
        <div className="relative z-10 mx-auto max-w-site px-6">
          <div className="max-w-[640px]">
            <span className="eyebrow">Feira de Santana · Bahia · Desde 2013</span>
            <h1 className="font-display mt-5 mb-4 text-display font-bold uppercase leading-[1.08]">
              Sua aprovação começa com a <em className="not-italic text-blue">preparação certa</em>
            </h1>
            <p className="mb-8 max-w-[480px] text-[17px] text-steel-light">
              Cursos presenciais, materiais e treinamento direto ao ponto para quem quer entrar nas
              forças de segurança.
            </p>
            <div className="flex flex-wrap gap-3.5">
              <Link href="/turmas" className="btn btn-blue">Ver turmas abertas</Link>
              <Link href="/eventos" className="btn btn-outline">Próximos eventos</Link>
            </div>
            <div className="mt-14 flex gap-12 border-t border-dark pt-8">
              {[
                { num: "+800", lbl: "Aprovados" },
                { num: "12", lbl: "Anos de missão" },
                { num: "15+", lbl: "Concursos ativos" },
              ].map((s) => (
                <div key={s.lbl}>
                  <div className="font-display text-[34px] font-bold leading-none text-blue">{s.num}</div>
                  <div className="mt-1.5 text-xs uppercase tracking-[0.1em] text-steel">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TURMAS */}
      <section className="py-section">
        <div className="mx-auto max-w-site px-6">
          <SectionHead
            eyebrow="Turmas presenciais"
            title="Matrículas abertas"
            desc="Preparação presencial com professores especialistas e rotina de treinamento estruturada."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {turmas.slice(0, 3).map((t, i) => (
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

      {/* PDFS */}
      <section className="bg-navy py-section text-offwhite">
        <div className="mx-auto max-w-site px-6">
          <SectionHead
            eyebrow="Materiais digitais"
            title="PDFs e apostilas"
            desc="Material objetivo, atualizado e direto ao que cai na prova. Compre e acesse na hora."
            dark
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {produtos.slice(0, 4).map((p, i) => (
              <Reveal key={p.slug} className="h-full" delay={Math.min(i, 5) * 70}>
                <ProductCard
                  slug={p.slug}
                  href={`/produtos/${p.slug}`}
                  tag={p.tag}
                  nome={p.nome}
                  desc={p.desc}
                  preco={p.preco}
                  dark
                  tipo="produto"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTOS */}
      <section className="py-section">
        <div className="mx-auto max-w-site px-6">
          <SectionHead eyebrow="Agenda" title="Próximos eventos" />
          <div className="grid gap-5 md:grid-cols-3">
            {eventos.map((e, i) => (
              <Reveal key={e.slug} className="h-full" delay={Math.min(i, 5) * 70}>
                <ProductCard
                  slug={e.slug}
                  href={e.detalhe ? `/eventos/${e.slug}` : undefined}
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

      {/* PROFESSORES */}
      <section id="professores" className="bg-navy py-section text-offwhite">
        <div className="mx-auto max-w-site px-6">
          <SectionHead
            eyebrow="Nosso time"
            title="Professores"
            desc="Especialistas na banca, com rotina de treinamento direto ao que cai na prova."
            dark
          />
          <Reveal>
            <ProfessoresCarousel professores={professores} />
          </Reveal>
        </div>
      </section>

      {/* APROVADOS */}
      <section className="py-section">
        <div className="mx-auto max-w-site px-6">
          <SectionHead
            eyebrow="Histórias reais"
            title="Aprovados"
            desc="Mais de 800 alunos aprovados desde 2013. Conheça quem já vestiu a farda com o método Quad."
          />
          <div className="grid gap-5 lg:grid-cols-2">
            {aprovados.slice(0, 4).map((a, i) => (
              <Reveal key={a.nome} delay={Math.min(i, 5) * 70}>
                <AprovadoCard aprovado={a} />
              </Reveal>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/aprovados" className="btn btn-outline-dark">Ver todos os aprovados</Link>
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section className="bg-navy py-section text-offwhite">
        <div className="mx-auto max-w-site px-6">
          <SectionHead
            eyebrow="Conteúdo Quad"
            title="Do nosso blog"
            desc="Editais, método de estudo e bastidores da preparação — direto de quem está na banca todos os dias."
            dark
          />
          <div className="grid gap-5 md:grid-cols-3">
            {posts.slice(0, 3).map((p, i) => (
              <Reveal key={p.slug} className="h-full" delay={Math.min(i, 5) * 70}>
                <Link href={`/blog/${p.slug}`} className="focus-ring block h-full">
                  <AccentCard dark className="h-full p-6">
                    <Kicker>{p.categoria}</Kicker>
                    <h3 className="font-display mt-2 mb-1.5 text-lg font-bold uppercase leading-tight text-offwhite">
                      {p.titulo}
                    </h3>
                    <p className="text-sm text-steel-light">{p.resumo}</p>
                  </AccentCard>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/blog" className="btn btn-outline">Ver todos os posts</Link>
          </div>
        </div>
      </section>
    </>
  );
}
