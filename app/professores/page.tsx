import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { CartaoProfessor } from "@/components/home/Cartoes";
import { metadadosDaPagina } from "@/lib/seo";
import { listarProfessores } from "@/lib/vitrine";

export const metadata = metadadosDaPagina({
  titulo: "Professores",
  descricao: "Conheça os professores do Quad Concursos: quem prepara os alunos para a PM-BA, o CFO e outras forças de segurança.",
  caminho: "/professores",
});

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts): professor cadastrado entra sem publicar o site de novo.
export const revalidate = 60;

// Todos os professores da vitrine da API, com os mesmos cartões da home; cada um leva à página dele.
// No celular, duas colunas de cartões compactos; do tablet em diante, quantas couberem.
export default async function ProfessoresPage() {
  const professores = await listarProfessores();

  return (
    <>
      <PageHeader eyebrow="Quem ensina" title="Professores" desc="O time que prepara os alunos do Quad, cada um na matéria em que é referência." />
      <section className="bg-marinho-950 pb-[clamp(56px,7vw,96px)] pt-[clamp(8px,2vw,24px)] text-white">
        <div className="conteiner">
          {professores && professores.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] sm:gap-5">
              {professores.map((p) => (
                <li key={p.slug}>
                  <CartaoProfessor professor={p} compacto />
                </li>
              ))}
            </ul>
          ) : (
            <p className="max-w-[560px] text-[16px] leading-[1.6] text-prata">
              {professores === null ? "Não foi possível carregar os professores agora. Tente de novo em instantes." : "Os professores aparecem aqui em breve."}
            </p>
          )}
        </div>
      </section>
      <section className="bg-white py-[clamp(56px,7vw,96px)]">
        <div className="conteiner flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[640px]">
            <h2 className="titulo-secao mb-3">Estude com quem conhece a banca</h2>
            <p className="text-[17px] leading-[1.6] text-ardosia">Escolha a turma presencial que combina com o seu momento.</p>
          </div>
          <Link href="/turmas" className="btn-q btn-q-azul h-[54px] px-7 text-base">
            Conhecer as turmas
          </Link>
        </div>
      </section>
    </>
  );
}
