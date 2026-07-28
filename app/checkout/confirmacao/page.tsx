import Link from "next/link";

export const metadata = { title: "Pagamento aprovado — Quad Concursos" };

export default function ConfirmacaoPage() {
  return (
    <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-navy-deep px-6 py-12 text-center">
      <div className="max-w-[480px]">
        <div className="hexagon mx-auto mb-7 flex h-[72px] w-[72px] items-center justify-center bg-blue text-[32px] text-navy-deep">
          ✓
        </div>
        <h1 className="font-display mb-3 text-h2 font-bold uppercase text-offwhite">
          Pagamento aprovado
        </h1>
        <p className="mb-8 text-steel-light">
          Sua matrícula está confirmada. Enviamos os detalhes para o seu e-mail e o acesso já está
          liberado na sua área do aluno.
        </p>
        <Link href="/aluno" className="btn btn-blue">
          Ir para a área do aluno
        </Link>
      </div>
    </div>
  );
}
