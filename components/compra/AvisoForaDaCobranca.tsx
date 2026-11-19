"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { avisoDeForaDaCobranca, foraDaCobranca } from "@/lib/fora-da-cobranca";

// O aviso da linha que saiu de venda entre a reserva e o pagamento e não foi cobrada (lib/fora-da-cobranca.ts). Os
// nomes ficam guardados na aba pelo checkout; sem eles, nada aparece.
export default function AvisoForaDaCobranca({ fechamento }: { fechamento: string }) {
  const [nomes, setNomes] = useState<string[]>([]);

  useEffect(() => {
    // O armazenamento da aba só existe no navegador: é lido depois da montagem.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNomes(foraDaCobranca(fechamento));
  }, [fechamento]);

  if (nomes.length === 0) return null;
  return (
    <div role="status" className="mt-6 rounded-xl border border-[#F1D9A6] bg-[#FFF8E8] p-4 text-sm leading-[1.55] text-[#7A4B00]">
      <ul className="space-y-1">
        {nomes.map((nome) => (
          <li key={nome}>{avisoDeForaDaCobranca(nome)}</li>
        ))}
      </ul>
      <p className="mt-2">
        {nomes.length === 1 ? "O item continua" : "Os itens continuam"} no seu{" "}
        <Link href="/carrinho" className="font-semibold underline">
          carrinho
        </Link>
        .
      </p>
    </div>
  );
}
