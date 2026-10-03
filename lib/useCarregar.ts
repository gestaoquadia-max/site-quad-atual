"use client";

import { useEffect, useState } from "react";
import { ErroDaApi } from "./http";

// Carrega dados de uma tela da área do aluno e expõe carregando / erro / tentar de novo.
// `carregar` deve ser uma função estável (declarada fora do componente); `chave` null = ainda não dá para carregar.
export function useCarregar<K extends string, T>(chave: K | null, carregar: (chave: K) => Promise<T>) {
  const [tentativa, setTentativa] = useState(0);
  const atual = chave === null ? null : `${chave}#${tentativa}`;
  const [resultado, setResultado] = useState<{ id: string; dados?: T; erro?: string } | null>(null);

  useEffect(() => {
    if (chave === null || atual === null) return;
    let cancelado = false;
    carregar(chave)
      .then((dados) => {
        if (!cancelado) setResultado({ id: atual, dados });
      })
      .catch((e) => {
        if (cancelado) return;
        const erro =
          e instanceof ErroDaApi ? e.message : "Não foi possível conectar. Verifique sua internet e tente novamente.";
        setResultado({ id: atual, erro });
      });
    return () => {
      cancelado = true;
    };
  }, [chave, atual, carregar]);

  const pronto = atual !== null && resultado?.id === atual;
  return {
    carregando: !pronto,
    dados: pronto ? resultado.dados : undefined,
    erro: pronto ? (resultado.erro ?? null) : null,
    tentarNovamente: () => setTentativa((t) => t + 1),
  };
}
