import Link from "next/link";

export const metadata = { title: "Página não encontrada", description: "A página que você procurou não existe ou mudou de endereço." };

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-navy-deep px-6 py-12 text-center">
      <div className="max-w-[480px]">
        <div className="hexagon font-display mx-auto mb-7 flex h-[72px] w-[72px] items-center justify-center bg-blue text-2xl font-bold text-navy-deep">
          404
        </div>
        <h1 className="font-display mb-3 text-h2 font-bold uppercase text-offwhite">
          Página não encontrada
        </h1>
        <p className="mb-8 text-steel-light">
          O endereço que você acessou não existe ou foi movido. Confira o link ou volte para o início.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-blue">
            Voltar ao início
          </Link>
          <Link href="/turmas" className="btn btn-outline">
            Ver turmas
          </Link>
        </div>
      </div>
    </div>
  );
}
