import Image from "next/image";
import Link from "next/link";
import { aprovados, type Aprovado } from "@/lib/data";
import { getIniciais } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { SeloExemplo } from "@/components/home/Cartoes";
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

// "Soldado PM-BA — 8º lugar geral" → cargo + resultado (como no cartão da home).
function CartaoComDepoimento({ aprovado }: { aprovado: Aprovado }) {
  const [cargo, resultado = "Aprovado"] = aprovado.concurso.split(" — ");
  return (
    <article className="flex h-full flex-col gap-5 rounded-[20px] border border-linha bg-white p-[clamp(20px,2.4vw,28px)] shadow-[0_1px_2px_rgba(16,27,45,0.05),0_12px_28px_-22px_rgba(7,20,38,0.25)]">
      <div className="flex items-center gap-4">
        <span className="relative grid h-16 w-16 flex-none place-items-center overflow-hidden rounded-2xl bg-[linear-gradient(160deg,#1B3A63_0%,#071426_80%)] font-display text-lg font-extrabold text-white">
          {aprovado.fotoUrl ? <Image src={aprovado.fotoUrl} alt="" fill sizes="64px" className="object-cover" /> : getIniciais(aprovado.nome)}
        </span>
        <div className="min-w-0">
          {aprovado.exemplo && (
            <span className="mb-1.5 block">
              <SeloExemplo />
            </span>
          )}
          <h2 className="font-display text-lg font-extrabold leading-tight">{aprovado.nome}</h2>
          <p className="mt-0.5 text-[13.5px] text-ardosia">
            {aprovado.turma} · {aprovado.ano}
          </p>
        </div>
      </div>
      <p className="font-display text-[clamp(20px,2vw,24px)] font-extrabold leading-[1.15] tracking-[-0.02em]">
        {cargo} <span className="block text-azul-forte">{resultado}</span>
      </p>
      <blockquote className="mt-auto border-l-[3px] border-azul pl-4 text-[15.5px] leading-[1.65] text-ardosia-escura">“{aprovado.depoimento}”</blockquote>
    </article>
  );
}

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
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-5">
            {aprovados.map((a) => (
              <CartaoComDepoimento key={a.nome} aprovado={a} />
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white py-[clamp(56px,7vw,96px)]">
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
