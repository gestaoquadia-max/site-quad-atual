// Brasão de cada concurso, pelo id ("sd-pmba"): PNG transparente de 192 × 192 em public/images/brasoes-concursos/.
// Usado na escolha do concurso das Turmas e na escolha da carreira dos Simulados. Sem brasão, null.
const BRASOES = "/images/brasoes-concursos";

const BRASAO_DO_CONCURSO: Record<string, string> = {
  "sd-pmba": `${BRASOES}/pmba.png`,
  "cfo-pmba": `${BRASOES}/cfo.png`,
  "cfs-pmba": `${BRASOES}/sgto.png`,
  "sgt-pmba": `${BRASOES}/sgto.png`,
  "sd-bmba": `${BRASOES}/bmba.png`,
  "sd-cbmba": `${BRASOES}/bmba.png`,
  "ipc-pcba": `${BRASOES}/civil.png`,
  "sd-pmpe": `${BRASOES}/pmpe.png`,
};

export function brasaoDoConcurso(id: string): string | null {
  return BRASAO_DO_CONCURSO[id.toLowerCase()] ?? null;
}
