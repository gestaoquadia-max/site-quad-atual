import ComprasConteudo from "./ComprasConteudo";

export const metadata = { title: "Compras — Área do Aluno", description: "Suas compras no Quad Concursos, com valor, forma de pagamento e situação de cada uma." };

export default function ComprasPage() {
  return (
    <>
      <h1 className="font-display text-[28px] font-bold uppercase">Compras</h1>
      <p className="mb-8 text-sm text-steel">Histórico de turmas, materiais e eventos adquiridos.</p>
      <ComprasConteudo />
    </>
  );
}
