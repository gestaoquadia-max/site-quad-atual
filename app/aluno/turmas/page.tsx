import MinhasTurmasConteudo from "./MinhasTurmasConteudo";

export const metadata = { title: "Minhas turmas — Área do Aluno" };

export default function MinhasTurmasPage() {
  return (
    <>
      <h2 className="font-display text-[28px] font-bold uppercase">Minhas turmas</h2>
      <p className="mb-8 text-sm text-steel">Acompanhe seu progresso nas turmas em que está matriculado.</p>
      <MinhasTurmasConteudo />
    </>
  );
}
