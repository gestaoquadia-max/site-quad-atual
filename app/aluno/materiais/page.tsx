import MeusMateriaisConteudo from "./MeusMateriaisConteudo";

export const metadata = { title: "Meus materiais — Área do Aluno" };

// ?turma=<id> chega de "Ver materiais da turma", em Minhas turmas.
export default async function MeusMateriaisPage({ searchParams }: { searchParams: Promise<{ turma?: string | string[] }> }) {
  const { turma } = await searchParams;
  return (
    <>
      <h2 className="font-display text-[28px] font-bold uppercase">Meus materiais</h2>
      <p className="mb-8 text-sm text-steel">Os materiais publicados nas suas turmas, disponíveis para download.</p>
      <MeusMateriaisConteudo turmaInicial={typeof turma === "string" ? turma : null} />
    </>
  );
}
