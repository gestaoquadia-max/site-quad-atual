import Link from "next/link";
import AccentCard from "@/components/AccentCard";
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
      <PageHeader
        eyebrow="Quem somos"
        title="Sobre o Quad"
        desc="Preparação séria para quem quer vestir a farda. Feira de Santana, Bahia — desde 2013."
      />

      <section className="py-section">
        <div className="mx-auto max-w-narrow px-6">
          <span className="eyebrow">Nossa história</span>
          <h2 className="font-display my-4 text-2xl font-bold uppercase">De uma banca de reforço a uma missão</h2>
          <div className="space-y-3 text-[15px] leading-relaxed text-[#4A5462]">
            <p>
              O Quad nasceu como uma banca de reforço em física, química e matemática, fundada por Danilo Moura. Anos
              depois, Danilo se tornou policial — e trouxe consigo a missão de preparar outras pessoas para conquistas
              como a dele.
            </p>
            <p>
              O que começou como apoio escolar se revelou algo maior: um espaço onde o conhecimento anda lado a lado com
              o cuidado.
            </p>
            <p>
              O aluno Quad carrega uma história difícil, mas não se vitimiza. Trabalha o dia todo, estuda à noite, sente
              medo e enfrenta. Para ele, o Quad é mais que um cursinho: é um lugar de reconstrução.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-navy-deep py-section text-offwhite">
        <div className="mx-auto max-w-narrow px-6">
          <span className="eyebrow text-blue">Missão</span>
          <p className="font-display mt-4 text-2xl font-bold uppercase leading-snug md:text-[28px]">
            Transformar vidas por meio da educação de alta performance, acolhendo, direcionando e preparando nossos
            alunos com excelência para conquistar a aprovação e iniciar uma nova trajetória com propósito.
          </p>
        </div>
      </section>

      <section className="py-section">
        <div className="mx-auto max-w-site px-6">
          <span className="eyebrow">O que nos guia</span>
          <h2 className="font-display my-4 text-2xl font-bold uppercase">Nossos valores</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {valores.map((v) => (
              <AccentCard key={v.nome} className="p-6">
                <h3 className="font-display mb-1.5 text-lg font-bold uppercase leading-tight">{v.nome}</h3>
                <p className="text-sm text-[#5A6472]">{v.texto}</p>
              </AccentCard>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-light py-section">
        <div className="mx-auto max-w-narrow px-6 text-center">
          <p className="font-display mb-6 text-xl font-bold uppercase">
            Nossa bandeira é a educação. Nossa causa é transformar vidas.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/turmas" className="btn btn-blue">
              Conheça as turmas
            </Link>
            <Link href="/contato" className="btn btn-outline-dark">
              Fale com a gente
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
