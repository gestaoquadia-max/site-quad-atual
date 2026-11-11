import Link from "next/link";
import Trilha from "@/components/Trilha";
import Onda from "@/components/home/Onda";
import CarrosselDeAprovados from "@/components/aprovados/CarrosselDeAprovados";
import { FOTOS_DE_APROVADOS } from "@/lib/aprovados";
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

// Aprovados (entrega da designer, 11/11/2026): o carrossel com as fotos dos alunos aprovados (lib/aprovados.ts) e, no
// fim, o convite para as turmas. Os cartões com depoimento (CartaoComDepoimento, no histórico do git) podem voltar
// quando as histórias vierem da API.
export default function AprovadosPage() {
  return (
    <>
      <section className="overflow-x-clip bg-nevoa pb-[clamp(64px,8vw,96px)] pt-[clamp(28px,3vw,40px)]">
        <div className="conteiner">
          <Trilha tom="claro" itens={[{ rotulo: "Início", href: "/" }, { rotulo: "Aprovados" }]} className="mb-[clamp(28px,4vw,48px)]" />
          <CarrosselDeAprovados fotos={FOTOS_DE_APROVADOS} />
        </div>
      </section>
      <Onda para="escuro" />
      {/* data-fim-escuro: a página termina no escuro, então o rodapé dispensa a onda dele. */}
      <section data-fim-escuro="" className="fundo-escuro-da-onda bg-marinho-950 py-[clamp(48px,6vw,80px)] text-white">
        <div className="conteiner flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[640px]">
            <h2 className="titulo-secao mb-3">A próxima história pode ser a sua</h2>
            <p className="text-[17px] leading-[1.6] text-prata-clara">
              {totalDeAprovados("", " ")}Escolha a modalidade de preparação que combina com o seu momento.
            </p>
          </div>
          <Link href="/turmas" className="btn-q btn-q-azul h-[54px] px-7 text-base">
            Conhecer as turmas
          </Link>
        </div>
      </section>
    </>
  );
}
