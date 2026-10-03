"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-navy-deep px-6 py-12 text-center">
      <div className="max-w-[480px]">
        <div className="hexagon font-display mx-auto mb-7 flex h-[72px] w-[72px] items-center justify-center bg-blue text-[32px] font-bold text-navy-deep">
          !
        </div>
        <h1 className="font-display mb-3 text-h2 font-bold uppercase text-offwhite">
          Algo deu errado
        </h1>
        <p className="mb-8 text-steel-light">
          Não conseguimos carregar esta página agora. Tente novamente em alguns instantes.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="mb-8 whitespace-pre-wrap break-words border border-dark bg-navy-mid p-4 text-left text-xs text-[#E08A8A]">
            {error.message}
          </pre>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn-blue">
            Tentar novamente
          </button>
          <Link href="/" className="btn btn-outline">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
