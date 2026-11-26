"use client";

import BlocoDeSugestoes from "./BlocoDeSugestoes";

// As sugestões na página de um produto: à venda, "Mais completo" e "Leve junto"; esgotado, "Mais em conta".
// alvo: o produto como a API recebe ("TURMA:<id>", "ITEM:<id>:DIGITAL"); sem ele, nada aparece.
export default function SugestoesDoProduto({
  alvo,
  esgotado,
  sobreEscuro = false,
  className = "",
}: {
  alvo: string | null | undefined;
  esgotado: boolean;
  sobreEscuro?: boolean;
  className?: string;
}) {
  if (!alvo) return null;
  return esgotado ? (
    <BlocoDeSugestoes
      lugar="esgotado"
      alvos={[alvo]}
      tipos={["DOWN_SELL"]}
      maximo={3}
      titulo="Esgotou, mas tem esta opção"
      sobreEscuro={sobreEscuro}
      className={className}
    />
  ) : (
    <BlocoDeSugestoes
      lugar="produto"
      alvos={[alvo]}
      tipos={["UP_SELL", "CROSS_SELL"]}
      maximo={3}
      titulo="Combina com este"
      sobreEscuro={sobreEscuro}
      className={className}
    />
  );
}
