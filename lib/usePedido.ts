"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CartItem } from "./cart";
import { ErroDaApi } from "./http";
import { alvoDoItem } from "./itens";
import { esvaziarCarrinhoDoServidor, reservar, simular, type Alvo, type LinhaDoCarrinho, type Simulacao } from "./loja";
import { atualizarVagas } from "./vagas";

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
  // semSessao: a API recusou a sessão (401) mesmo depois de tentar renovar; o checkout mostra o "Entre para finalizar".
  | { fase: "erro"; mensagem: string; semSessao?: boolean };

function mesmaLinha(alvo: Alvo, l: LinhaDoCarrinho) {
  // Evento com variação: a linha traz alvo.variacao, que precisa ser a escolhida.
  if (alvo.atividade) return l.alvo.atividade?.id === alvo.atividade.id && (!alvo.variacaoId || l.alvo.variacao?.id === alvo.variacaoId);
  // O impresso e o digital do mesmo material são duas linhas do mesmo item.
  const mesmaPlataforma = !alvo.plataforma || !l.alvo.plataforma || l.alvo.plataforma === alvo.plataforma;
  return l.alvo.itemId === alvo.itemId && (l.alvo.variacao?.id ?? undefined) === alvo.variacaoId && mesmaPlataforma;
}

function mensagem(e: unknown, padrao: string) {
  return e instanceof ErroDaApi ? e.message : padrao;
}

// Simula com o cupom de agora. Se a API não o aceitar mais no carrinho novo (ex.: o item que ele exigia saiu),
// simula sem ele e devolve a frase dela, que o checkout mostra no lugar do cupom.
async function simularComOCupom(cupom: string | null): Promise<{ simulacao: Simulacao; cupom: string | null; aviso: string | null }> {
  if (!cupom) return { simulacao: await simular(null), cupom: null, aviso: null };
  try {
    return { simulacao: await simular(cupom), cupom, aviso: null };
  } catch (e) {
    if (e instanceof ErroDaApi && e.status === 401) throw e;
    if (!(e instanceof ErroDaApi) || e.status >= 500) throw e;
    return { simulacao: await simular(null), cupom: null, aviso: e.message };
  }
}

// Reserva um item no carrinho do servidor e diz onde ele ficou: a linha vigente ou o motivo da recusa.
async function reservarItem(item: CartItem, linhas: Map<string, LinhaDoCarrinho>, recusados: Map<string, string>) {
  const alvo = alvoDoItem(item);
  if (!alvo) {
    recusados.set(item.id, "Este item ainda não pode ser comprado pelo site.");
    return null;
  }
  try {
    const carrinho = await reservar(alvo, item.quantidade);
    const linha = carrinho.linhas.find((l) => mesmaLinha(alvo, l));
    if (!linha) recusados.set(item.id, "Não foi possível reservar este item.");
    else if (linha.situacao !== "VIGENTE") recusados.set(item.id, linha.motivo ?? "Item indisponível no momento.");
    else linhas.set(item.id, linha);
    return carrinho.expiraEm;
  } catch (e) {
    if (e instanceof ErroDaApi && e.status === 401) throw e;
    recusados.set(item.id, mensagem(e, "Não foi possível reservar este item."));
    return null;
  }
}

// Passa o carrinho do site para o servidor: esvazia o de lá, reserva item por item (o servidor confere preço,
// vagas e estoque) e simula o total com o cupom. Quando só entra item novo (ex.: "Adicionar ao pedido" das sugestões),
// reserva só ele, sem soltar as reservas dos outros; qualquer outra mudança refaz tudo. O cupom aplicado continua nos
// dois casos (até 25/11/2026 ele saía a cada mudança).
export function usePedido(itens: CartItem[], ativo: boolean) {
  const [estado, setEstado] = useState<Estado>({ fase: "preparando" });
  const [cupom, setCupom] = useState<string | null>(null);
  // A frase da API quando o cupom deixou de valer no carrinho novo.
  const [avisoDoCupom, setAvisoDoCupom] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const chave = itens.map((i) => `${i.id}×${i.quantidade}`).join("|");
  // Os itens entram no efeito pela chave (id × quantidade), não pela lista, que é um objeto novo a cada render.
  const itensAtuais = useRef(itens);
  // O que está no efeito: o cupom de agora e o último pedido pronto (com a chave e a tentativa em que foi montado).
  const cupomAtual = useRef(cupom);
  const ultimoPronto = useRef<{ chave: string; tentativa: number; pedido: Pedido } | null>(null);
  useEffect(() => {
    itensAtuais.current = itens;
    cupomAtual.current = cupom;
  });

  useEffect(() => {
    if (!ativo || !chave) return;
    let cancelado = false;
    (async () => {
      const anterior = ultimoPronto.current;
      const antes = anterior && anterior.tentativa === tentativa ? anterior.chave.split("|") : null;
      const agora = chave.split("|");
      // Só entrou item: os de antes continuam, iguais e na mesma quantidade.
      const soEntrou = !!antes && antes.length < agora.length && antes.every((k) => agora.includes(k));
      setEstado({ fase: "preparando" });
      try {
        let linhas: Map<string, LinhaDoCarrinho>;
        let recusados: Map<string, string>;
        let expiraEm: string | null;
        let novos: CartItem[];
        if (soEntrou && anterior) {
          linhas = new Map(anterior.pedido.linhas);
          recusados = new Map(anterior.pedido.recusados);
          expiraEm = anterior.pedido.expiraEm;
          novos = itensAtuais.current.filter((i) => !antes!.includes(`${i.id}×${i.quantidade}`));
        } else {
          await esvaziarCarrinhoDoServidor();
          linhas = new Map();
          recusados = new Map();
          expiraEm = null;
          novos = itensAtuais.current;
        }
        for (const item of novos) {
          const expira = await reservarItem(item, linhas, recusados);
          if (expira) expiraEm = expira;
          if (cancelado) return;
        }
        const resultado = linhas.size > 0 ? await simularComOCupom(cupomAtual.current) : null;
        if (!cancelado) {
          const pedido = { linhas, recusados, simulacao: resultado?.simulacao ?? null, expiraEm };
          ultimoPronto.current = { chave, tentativa, pedido };
          setCupom(resultado ? resultado.cupom : null);
          setAvisoDoCupom(resultado?.aviso ?? null);
          setEstado({ fase: "pronto", pedido });
          // As vagas reservadas agora já aparecem descontadas no menu e na barra de avisos.
          atualizarVagas().catch(() => {});
        }
      } catch (e) {
        if (!cancelado) {
          ultimoPronto.current = null;
          setEstado({
            fase: "erro",
            mensagem: mensagem(e, "Não foi possível preparar o seu pedido. Verifique sua internet e tente novamente."),
            semSessao: e instanceof ErroDaApi && e.status === 401,
          });
        }
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
      const pedido = { ...estado.pedido, simulacao };
      setCupom(codigo);
      setAvisoDoCupom(null);
      if (ultimoPronto.current) ultimoPronto.current = { ...ultimoPronto.current, pedido };
      setEstado({ fase: "pronto", pedido });
    },
    [estado],
  );

  const refazer = useCallback(() => setTentativa((t) => t + 1), []);

  return { estado, cupom, avisoDoCupom, aplicarCupom, refazer };
}
