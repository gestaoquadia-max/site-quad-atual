import { Suspense } from "react";
import { metadadosDaPagina } from "@/lib/seo";
import { listarTurmas } from "@/lib/vitrine";
import EscolhaDeModalidade from "@/components/turmas/EscolhaDeModalidade";
import ComModalidadeDoEndereco from "@/components/turmas/ComModalidadeDoEndereco";
import SecaoDeCombos from "@/components/combos/SecaoDeCombos";
import { listarCombosDaArea } from "@/lib/combos";

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts); o Next exige um número escrito aqui.
export const revalidate = 60;

export const metadata = metadadosDaPagina({
  titulo: "Turmas presenciais",
  descricao:
    "Turmas presenciais em Feira de Santana: RONDESP, PATAMO e BOPE para Soldado e CFO da PM-BA, e turmas para Polícia Civil, Bombeiros e outros concursos.",
  caminho: "/turmas",
});

export default async function TurmasPage() {
  const [turmas, combos] = await Promise.all([listarTurmas(), listarCombosDaArea("turmas")]);
  // Sem o ?m= do endereço (enquanto a página carrega no navegador), nenhuma modalidade vem marcada.
  return (
    <>
      <Suspense fallback={<EscolhaDeModalidade turmas={turmas} inicial={null} />}>
        <ComModalidadeDoEndereco turmas={turmas} />
      </Suspense>
      <SecaoDeCombos
        combos={combos}
        titulo="Combos de turmas"
        descricao="Turmas juntas por um preço menor que a soma. O combo é pago à parte do carrinho, numa compra só."
        fundo="branco"
      />
    </>
  );
}
