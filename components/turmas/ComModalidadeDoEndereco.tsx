"use client";

import { useSearchParams } from "next/navigation";
import type { Turma } from "@/lib/data";
import { modalidades } from "@/lib/conteudo";
import EscolhaDeModalidade from "./EscolhaDeModalidade";

// /turmas?m=patamo abre a página já com a modalidade escolhida (links da Home e do carrossel).
export default function ComModalidadeDoEndereco({ turmas }: { turmas: Turma[] | null }) {
  const parametros = useSearchParams();
  const m = parametros.get("m");
  const inicial = modalidades.find((x) => x.id === m)?.id ?? null;
  // /turmas?cargo=ipc-pcba abre na aba do cargo (sem ?cargo=, a primeira: SD • PMBA).
  const cargo = parametros.get("cargo");
  // Só vale ao abrir a página: depois, a escolha fica no estado do componente (e o endereço é atualizado por ele).
  return <EscolhaDeModalidade turmas={turmas} inicial={inicial} cargoInicial={cargo} />;
}
