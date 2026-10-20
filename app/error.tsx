"use client";

import { useEffect } from "react";
import Link from "next/link";
import TelaDeAviso from "@/components/TelaDeAviso";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <TelaDeAviso selo="Ops." titulo="Algo deu errado" texto="Não conseguimos carregar esta página agora. Tente novamente em alguns instantes.">
      {process.env.NODE_ENV === "development" && (
        <pre className="mb-2 w-full whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-marinho-900 p-4 text-left text-xs text-[#F3A3B1]">{error.message}</pre>
      )}
      <button type="button" onClick={reset} className="btn-q btn-q-azul h-[52px] px-6 text-[15px]">
        Tentar novamente
      </button>
      <Link href="/" className="btn-q btn-q-contorno-escuro h-[52px] px-6 text-[15px]">
        Voltar ao início
      </Link>
    </TelaDeAviso>
  );
}
