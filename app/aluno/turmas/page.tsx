import MinhasTurmasConteudo from "./MinhasTurmasConteudo";

export const metadata = { title: "Minhas turmas — Área do Aluno", description: "As turmas em que você está matriculado no Quad Concursos, com horário e progresso." };

export default function MinhasTurmasPage() {
  return (
    <>
      <h1 className="font-display text-[28px] font-bold uppercase">Minhas turmas</h1>
      <p className="mb-8 text-sm text-steel">Acompanhe seu progresso nas turmas em que está matriculado.</p>
      <MinhasTurmasConteudo />
    </>
  );
}
