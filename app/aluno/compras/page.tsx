import ComprasConteudo from "./ComprasConteudo";
import CabecalhoDoAluno from "@/components/aluno/CabecalhoDoAluno";

export const metadata = { title: "Compras — Área do Aluno", description: "Suas compras no Quad Concursos, com valor, forma de pagamento e situação de cada uma." };

export default function ComprasPage() {
  return (
    <>
      <CabecalhoDoAluno titulo="Compras" subtitulo="Histórico de turmas, materiais e eventos adquiridos." />
      <ComprasConteudo />
    </>
  );
}
