import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { metadadosDaPagina } from "@/lib/seo";

export const metadata = metadadosDaPagina({
  titulo: "Sobre o Quad",
  descricao:
    "Conheça a história, a missão e os valores do Quad Concursos, preparação para concursos militares em Feira de Santana, Bahia, desde 2013.",
  caminho: "/sobre",
});

const valores = [
  { nome: "Excelência com ética", texto: "Buscamos o melhor com responsabilidade. Erros são assumidos, nunca escondidos." },
  { nome: "Transparência e clareza", texto: "Honestidade nas relações e conflitos resolvidos com maturidade." },
  { nome: "Empatia e respeito", texto: "Ouvir antes de responder. Cada pessoa tem seu tempo e sua história." },
  { nome: "Inovação contínua", texto: "Melhorar mesmo quando tudo já funciona. Acomodação é desvio de rota." },
  { nome: "Espírito de equipe", texto: "Crescemos juntos. Aqui ninguém diz “isso não é comigo”." },
  { nome: "Desenvolvimento integral", texto: "Entregamos visão, propósito e confiança — não apenas conteúdo." },
];

export default function SobrePage() {
  return (
    <>
      <PageHeader eyebrow="Quem somos" title="Sobre o Quad" desc="Preparação séria para quem quer vestir a farda. Feira de Santana, Bahia — desde 2013." />

      <section className="bg-white py-[clamp(56px,7vw,104px)]">
        <div className="conteiner grid gap-[clamp(28px,5vw,80px)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-azul-forte">Nossa história</span>
            <h2 className="titulo-secao mt-2.5">De uma banca de reforço a uma missão</h2>
          </div>
          <div className="space-y-4 text-[17px] leading-[1.75] text-ardosia-escura">
            <p>
              O Quad nasceu como uma banca de reforço em física, química e matemática, fundada por Danilo Moura. Anos depois, Danilo se tornou
              policial — e trouxe consigo a missão de preparar outras pessoas para conquistas como a dele.
            </p>
            <p>O que começou como apoio escolar se revelou algo maior: um espaço onde o conhecimento anda lado a lado com o cuidado.</p>
            <p>
              O aluno Quad carrega uma história difícil, mas não se vitimiza. Trabalha o dia todo, estuda à noite, sente medo e enfrenta. Para ele,
              o Quad é mais que um cursinho: é um lugar de reconstrução.
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-marinho-950 py-[clamp(64px,8vw,120px)] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_70%_at_15%_20%,rgba(0,107,255,0.22),transparent_70%)]" />
        <div className="conteiner relative">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-azul-ceu">Missão</span>
          <p className="mt-4 max-w-[1080px] font-display text-[clamp(1.6rem,3.2vw,2.8rem)] font-extrabold leading-[1.15] tracking-[-0.03em] [text-wrap:balance]">
            Transformar vidas por meio da educação de alta performance, acolhendo, direcionando e preparando nossos alunos com excelência para
            conquistar a aprovação e iniciar uma nova trajetória com propósito.
          </p>
        </div>
      </section>

      <section className="bg-nevoa py-[clamp(56px,7vw,104px)]">
        <div className="conteiner">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-azul-forte">O que nos guia</span>
          <h2 className="titulo-secao mb-8 mt-2.5">Nossos valores</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-5">
            {valores.map((v, i) => (
              <article key={v.nome} className="rounded-[18px] border border-linha bg-white p-6">
                <span className="font-display text-sm font-extrabold text-azul-forte">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mb-2 mt-3 font-display text-xl font-extrabold tracking-[-0.015em]">{v.nome}</h3>
                <p className="text-[15px] leading-[1.6] text-ardosia">{v.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-[clamp(56px,7vw,96px)]">
        <div className="conteiner flex flex-col items-center gap-6 text-center">
          <p className="max-w-[760px] font-display text-[clamp(1.5rem,2.6vw,2.2rem)] font-extrabold leading-[1.15] tracking-[-0.03em] [text-wrap:balance]">
            Nossa bandeira é a educação. Nossa causa é transformar vidas.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/turmas" className="btn-q btn-q-azul h-[52px] px-6 text-[15px]">
              Conheça as turmas
            </Link>
            <Link href="/contato" className="btn-q btn-q-contorno h-[52px] px-6 text-[15px]">
              Fale com a gente
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
