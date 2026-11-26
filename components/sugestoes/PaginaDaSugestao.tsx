"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { buscarSugestao, itemDaSugestao, type SugestaoDaVitrine } from "@/lib/sugestoes";
import CartaoDaSugestao from "./CartaoDaSugestao";

// A página do link do e-mail de sugestão: um cartão grande com "Adicionar ao carrinho" (e segue para o carrinho), ou
// "Ver o combo". Sugestão que saiu ou não existe: o aviso e o caminho para a página inicial.
export default function PaginaDaSugestao({ id }: { id: string }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [estado, setEstado] = useState<SugestaoDaVitrine | "nao-encontrada" | "falhou" | null>(null);

  useEffect(() => {
    let cancelado = false;
    buscarSugestao(id).then((r) => {
      if (!cancelado) setEstado(r ?? "falhou");
    });
    return () => {
      cancelado = true;
    };
  }, [id]);

  let conteudo;
  if (estado === null) {
    conteudo = (
      <p role="status" className="text-[15px] text-ardosia">
        Carregando a sugestão…
      </p>
    );
  } else if (estado === "nao-encontrada" || estado === "falhou" || (!estado.combo && !estado.produto?.aVenda)) {
    conteudo = (
      <div className="flex flex-col items-start gap-4">
        <h1 className="font-display text-[clamp(1.8rem,3.6vw,2.4rem)] font-extrabold tracking-[-0.03em]">
          {estado === "falhou" ? "Não foi possível abrir esta sugestão" : "Esta sugestão não está mais disponível"}
        </h1>
        <p className="text-[15.5px] leading-[1.6] text-ardosia">
          {estado === "falhou" ? "Verifique sua internet e tente de novo em instantes." : "Veja as turmas, os simulados e os materiais do Quad na página inicial."}
        </p>
        <Link href="/" className="btn-q btn-q-azul h-12 px-[22px] text-[15px]">
          Ir para a página inicial
        </Link>
      </div>
    );
  } else {
    const sugestao = estado;
    conteudo = (
      <div className="flex flex-col gap-5">
        <h1 className="font-display text-[clamp(1.8rem,3.6vw,2.4rem)] font-extrabold tracking-[-0.03em]">Separamos isto para você</h1>
        <CartaoDaSugestao
          grande
          sugestao={sugestao}
          acao={{
            rotulo: "Adicionar ao carrinho",
            aoEscolher: (variacao) => {
              const item = itemDaSugestao(sugestao, variacao);
              if (!item) return;
              addItem(item);
              router.push("/carrinho");
            },
          }}
        />
      </div>
    );
  }

  return (
    <section className="bg-nevoa py-[clamp(48px,7vw,96px)]">
      <div className="conteiner max-w-[860px]">{conteudo}</div>
    </section>
  );
}
