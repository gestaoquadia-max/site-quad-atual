import { Suspense } from "react";
import { metadadosDaPagina } from "@/lib/seo";
import { listarTurmas } from "@/lib/vitrine";
import EscolhaDeModalidade from "@/components/turmas/EscolhaDeModalidade";
import ComModalidadeDoEndereco from "@/components/turmas/ComModalidadeDoEndereco";
import SecaoDeCombos from "@/components/combos/SecaoDeCombos";
import SecaoDeIsoladas from "@/components/turmas/SecaoDeIsoladas";
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
  const [todas, combos] = await Promise.all([listarTurmas(), listarCombosDaArea("turmas")]);
  // As isoladas (tipo ISOLADA na API) saem da escolha de modalidade e vão para a seção delas, mais abaixo.
  const turmas = todas?.filter((t) => !t.isolada) ?? null;
  const isoladas = todas?.filter((t) => t.isolada) ?? [];
  // Sem o ?m= do endereço (enquanto a página carrega no navegador), nenhuma modalidade vem marcada.
  return (
    <>
      <Suspense fallback={<EscolhaDeModalidade turmas={turmas} inicial={null} />}>
        <ComModalidadeDoEndereco turmas={turmas} />
      </Suspense>
      <SecaoDeIsoladas turmas={isoladas} />
      <SecaoDeCombos
        combos={combos}
        titulo="Combos com turmas"
        descricao="A turma junto com outras turmas, materiais, simulados ou produtos da loja, por um preço menor que a soma. O combo é pago à parte do carrinho, numa compra só."
        fundo="branco"
      />
    </>
  );
}
