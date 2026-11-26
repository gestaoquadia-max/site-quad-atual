// Brasão de cada concurso: PNG transparente de 192 × 192 em public/images/brasoes-concursos/. Usado na escolha do
// concurso das Turmas (id pelo código, "sd-pmba") e na escolha da carreira dos Simulados (id pelo nome do concurso no
// cadastro, "soldado-da-policia-militar-da-bahia"). Sem brasão, null.
const BRASOES = "/images/brasoes-concursos";

const BRASAO_DO_CONCURSO: Record<string, string> = {
  "sd-pmba": `${BRASOES}/pmba.png`,
  "cfo-pmba": `${BRASOES}/cfo.png`,
  "cfs-pmba": `${BRASOES}/sgto.png`,
  "sgt-pmba": `${BRASOES}/sgto.png`,
  "sd-bmba": `${BRASOES}/bmba.png`,
  "sd-cbmba": `${BRASOES}/bmba.png`,
  "cfo-bmba": `${BRASOES}/bmba.png`,
  "cfo-cbmba": `${BRASOES}/bmba.png`,
  "ipc-pcba": `${BRASOES}/civil.png`,
  "inv-pcba": `${BRASOES}/civil.png`,
  "sd-pmpe": `${BRASOES}/pmpe.png`,
};

// Pelo nome do concurso (o id da carreira na Central de Simulados), em ordem: a primeira regra que bate vale. Pedido de
// 26/11/2026: as carreiras da Central apareciam sem brasão (o mapa acima é por código); CFO e SD do BMBA usam o mesmo.
const BRASAO_PELO_NOME: [RegExp, string][] = [
  [/bombeiro.*bahia/, "bmba.png"],
  [/policia-militar-da-bahia/, ""],
  [/policia-civil-da-bahia/, "civil.png"],
  [/policia-civil-de-pernambuco/, "pcpe.png"],
  [/(policia|policial)-penal-de-pernambuco/, "pppe.png"],
  [/policia-militar-de-pernambuco/, "pmpe.png"],
  [/policia-militar-do-piaui/, "pmpi.png"],
  [/policia-militar-de-sao-paulo/, "pmsp.png"],
];

// Na PM da Bahia, o brasão muda com o cargo.
function brasaoDaPmba(id: string) {
  if (id.startsWith("oficial") || id.includes("cfo")) return "cfo.png";
  if (id.startsWith("sargento") || id.includes("cfs")) return "sgto.png";
  return "pmba.png";
}

export function brasaoDoConcurso(id: string): string | null {
  const chave = id.toLowerCase();
  if (BRASAO_DO_CONCURSO[chave]) return BRASAO_DO_CONCURSO[chave];
  const regra = BRASAO_PELO_NOME.find(([padrao]) => padrao.test(chave));
  if (!regra) return null;
  return `${BRASOES}/${regra[1] || brasaoDaPmba(chave)}`;
}
