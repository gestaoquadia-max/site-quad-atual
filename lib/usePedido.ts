"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CartItem } from "./cart";
import { ErroDaApi } from "./http";
import { alvoDoItem } from "./itens";
import { esvaziarCarrinhoDoServidor, reservar, simular, type Alvo, type LinhaDoCarrinho, type Simulacao } from "./loja";

export type Pedido = {
  // id do item do carrinho do site → linha reservada no servidor
  linhas: Map<string, LinhaDoCarrinho>;
  // id do item do carrinho do site → por que não pôde ser reservado
  recusados: Map<string, string>;
  simulacao: Simulacao | null;
  expiraEm: string | null;
};

type Estado =
  | { fase: "preparando" }
  | { fase: "pronto"; pedido: Pedido }
  | { fase: "erro"; mensagem: string };

function mesmaLinha(alvo: Alvo, l: LinhaDoCarrinho) {
  if (alvo.atividade) return l.alvo.atividade?.id === alvo.atividade.id;
  return l.alvo.itemId === alvo.itemId && (l.alvo.variacao?.id ?? undefined) === alvo.variacaoId;
}

function mensagem(e: unknown, padrao: string) {
  return e instanceof ErroDaApi ? e.message : padrao;
}

// Passa o carrinho do site para o servidor: esvazia o de lá, reserva item por item (o servidor confere preço,
// vagas e estoque) e simula o total com o cupom. Refaz tudo quando os itens mudam.
export function usePedido(itens: CartItem[], ativo: boolean) {
  const [estado, setEstado] = useState<Estado>({ fase: "preparando" });
  const [cupom, setCupom] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const chave = itens.map((i) => `${i.id}×${i.quantidade}`).join("|");
  // Os itens entram no efeito pela chave (id × quantidade), não pela lista, que é um objeto novo a cada render.
  const itensAtuais = useRef(itens);
  useEffect(() => {
    itensAtuais.current = itens;
  });

  useEffect(() => {
    if (!ativo || !chave) return;
    let cancelado = false;
    (async () => {
      setEstado({ fase: "preparando" });
      try {
        await esvaziarCarrinhoDoServidor();
        const linhas = new Map<string, LinhaDoCarrinho>();
        const recusados = new Map<string, string>();
        let expiraEm: string | null = null;
        for (const item of itensAtuais.current) {
          const alvo = alvoDoItem(item);
          if (!alvo) {
            recusados.set(item.id, "Este item ainda não pode ser comprado pelo site.");
            continue;
          }
          try {
            const carrinho = await reservar(alvo, item.quantidade);
            const linha = carrinho.linhas.find((l) => mesmaLinha(alvo, l));
            expiraEm = carrinho.expiraEm;
            if (!linha) recusados.set(item.id, "Não foi possível reservar este item.");
            else if (linha.situacao !== "VIGENTE") recusados.set(item.id, linha.motivo ?? "Item indisponível no momento.");
            else linhas.set(item.id, linha);
          } catch (e) {
            if (e instanceof ErroDaApi && e.status === 401) throw e;
            recusados.set(item.id, mensagem(e, "Não foi possível reservar este item."));
          }
          if (cancelado) return;
        }
        const simulacao = linhas.size > 0 ? await simular(null) : null;
        if (!cancelado) {
          setCupom(null);
          setEstado({ fase: "pronto", pedido: { linhas, recusados, simulacao, expiraEm } });
        }
      } catch (e) {
        if (!cancelado) setEstado({ fase: "erro", mensagem: mensagem(e, "Não foi possível preparar o seu pedido. Verifique sua internet e tente novamente.") });
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [chave, ativo, tentativa]);

  // Aplica (ou tira, com null) o cupom: a API confere as regras e calcula o desconto.
  const aplicarCupom = useCallback(
    async (codigo: string | null) => {
      if (estado.fase !== "pronto") return;
      const simulacao = await simular(codigo);
      setCupom(codigo);
      setEstado({ fase: "pronto", pedido: { ...estado.pedido, simulacao } });
    },
    [estado],
  );

  const refazer = useCallback(() => setTentativa((t) => t + 1), []);

  return { estado, cupom, aplicarCupom, refazer };
}
