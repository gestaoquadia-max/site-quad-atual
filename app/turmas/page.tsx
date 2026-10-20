import { Suspense } from "react";
import { metadadosDaPagina } from "@/lib/seo";
import { listarTurmas } from "@/lib/vitrine";
import EscolhaDeModalidade from "@/components/turmas/EscolhaDeModalidade";
import ComModalidadeDoEndereco from "@/components/turmas/ComModalidadeDoEndereco";

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts); o Next exige um número escrito aqui.
export const revalidate = 60;

export const metadata = metadadosDaPagina({
  titulo: "Turmas presenciais",
  descricao:
    "Turmas presenciais RONDESP, PATAMO e BOPE para Soldado PM-BA, CFO e outros concursos em Feira de Santana. Escolha o seu nível de preparação.",
  caminho: "/turmas",
});

export default async function TurmasPage() {
  const turmas = await listarTurmas();
  // Sem o ?m= do endereço (enquanto a página carrega no navegador), nenhuma modalidade vem marcada.
  return (
    <Suspense fallback={<EscolhaDeModalidade turmas={turmas} inicial={null} />}>
      <ComModalidadeDoEndereco turmas={turmas} />
    </Suspense>
  );
}
