import MinhasTurmasConteudo from "./MinhasTurmasConteudo";
import CabecalhoDoAluno from "@/components/aluno/CabecalhoDoAluno";

export const metadata = { title: "Minhas turmas — Área do Aluno", description: "As turmas em que você está matriculado no Quad Concursos, com horário e progresso." };

export default function MinhasTurmasPage() {
  return (
    <>
      <CabecalhoDoAluno titulo="Minhas turmas" subtitulo="Acompanhe seu progresso nas turmas em que está matriculado." />
      <MinhasTurmasConteudo />
    </>
  );
}
