import MeusEventosConteudo from "./MeusEventosConteudo";
import CabecalhoDoAluno from "@/components/aluno/CabecalhoDoAluno";

export const metadata = { title: "Meus eventos — Área do Aluno", description: "Os eventos e simulados em que você está inscrito no Quad Concursos." };

export default function MeusEventosPage() {
  return (
    <>
      <CabecalhoDoAluno titulo="Meus eventos" subtitulo="Eventos e simulados em que você garantiu sua inscrição." />
      <MeusEventosConteudo />
    </>
  );
}
