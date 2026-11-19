// O número do pedido (seis dígitos; recado da API de 19/11/2026): o que o aluno diz na recepção e o que vem nos e-mails.
export default function NumeroDoPedido({ numero, className = "mt-5" }: { numero: string; className?: string }) {
  return (
    <p className={`flex w-fit flex-wrap items-baseline gap-x-2 rounded-xl bg-nevoa px-4 py-3 text-[15px] text-ardosia ${className}`}>
      Pedido nº <strong className="font-display text-[20px] font-extrabold tracking-[0.04em] text-tinta">{numero}</strong>
    </p>
  );
}
