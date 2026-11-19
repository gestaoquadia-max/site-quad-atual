import { prazoEmTexto } from "@/lib/format";

// O prazo de venda da API (vendaAte; recado de 19/11/2026), no horário de Brasília: "Inscrições até qui., 19/11, às 21h".
// Sem o prazo (null: sem fim marcado), nada aparece.
export default function PrazoDeVenda({ vendaAte, rotulo, className = "" }: { vendaAte?: string | null; rotulo: "Inscrições" | "Matrículas" | "Vendas"; className?: string }) {
  const prazo = vendaAte ? prazoEmTexto(vendaAte) : null;
  if (!prazo) return null;
  return (
    <p className={className}>
      {rotulo} até <strong className="font-semibold">{prazo}</strong>
    </p>
  );
}
