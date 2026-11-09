import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import AprovadosEmDesenvolvimento from "@/components/AprovadosEmDesenvolvimento";
import { institucional } from "@/lib/institucional";
import { metadadosDaPagina } from "@/lib/seo";

// "Mais de 800 alunos aprovados desde 2013." só com os números confirmados em lib/institucional.ts; senão, nada.
function totalDeAprovados(antes: string, depois = "") {
  const { totalDeAprovados: total, anoDeFundacao: ano } = institucional;
  if (!total) return "";
  return `${antes}Mais de ${total} alunos aprovados${ano ? ` desde ${ano}` : ""}.${depois}`;
}

export const metadata = metadadosDaPagina({
  titulo: "Aprovados",
  descricao:
    `Histórias de alunos do Quad Concursos aprovados na PM-BA, no CFO e em outras forças de segurança.${totalDeAprovados(" ")}`,
  caminho: "/aprovados",
});

// Os cartões com depoimento (CartaoComDepoimento, no histórico do git) voltam quando as histórias reais vierem da API.
export default function AprovadosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Quad Aprovado"
        title="Aprovados"
        desc={`${totalDeAprovados("", " ")}Conheça quem já vestiu a farda com o método Quad.`}
      />
      <section className="bg-nevoa py-[clamp(48px,6vw,88px)]">
        <div className="conteiner">
          <AprovadosEmDesenvolvimento />
        </div>
      </section>
      <section className="bg-nevoa-clara py-[clamp(56px,7vw,96px)]">
        <div className="conteiner flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[640px]">
            <h2 className="titulo-secao mb-3">A próxima história pode ser a sua</h2>
            <p className="text-[17px] leading-[1.6] text-ardosia">Escolha a modalidade de preparação que combina com o seu momento.</p>
          </div>
          <Link href="/turmas" className="btn-q btn-q-azul h-[54px] px-7 text-base">
            Conhecer as turmas
          </Link>
        </div>
      </section>
    </>
  );
}
