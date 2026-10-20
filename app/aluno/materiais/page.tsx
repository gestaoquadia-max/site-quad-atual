import MeusMateriaisConteudo from "./MeusMateriaisConteudo";
import CabecalhoDoAluno from "@/components/aluno/CabecalhoDoAluno";

export const metadata = { title: "Meus materiais — Área do Aluno", description: "Os materiais das suas turmas no Quad Concursos, do mais recente para o mais antigo." };

// ?turma=<id> chega de "Ver materiais da turma", em Minhas turmas.
export default async function MeusMateriaisPage({ searchParams }: { searchParams: Promise<{ turma?: string | string[] }> }) {
  const { turma } = await searchParams;
  return (
    <>
      <CabecalhoDoAluno titulo="Meus materiais" subtitulo="Os materiais publicados nas suas turmas, disponíveis para download." />
      <MeusMateriaisConteudo turmaInicial={typeof turma === "string" ? turma : null} />
    </>
  );
}
