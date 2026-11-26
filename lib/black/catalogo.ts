// O que é fixo na página de Materiais da Black (entrega da designer de 25/11/2026, dados/catalogo.json): os concursos
// de cada tela, os brasões, as capas, as prévias dos módulos e os textos. Preço, produto e compra vêm da API
// (listarMateriaisDaBlack, lib/vitrine.ts): concurso sem produto cadastrado aparece como "Em breve".
// Imagens em public/images/black-friday/{brasoes,capas,previas}.

const IMG = "/images/black-friday";

export type ConcursoDaBlack = {
  id: string;
  nome: string;
  // Sem brasão (PCPE e CFO BM, ainda não enviados): um círculo com a sigla.
  brasao: string | null;
  sigla: string;
  capa: string | null;
  // Como o concurso aparece no cadastro da API (material.concurso.codigo), sem hífen, espaço ou barra e em maiúsculas.
  // A confirmar com o backend (docs/pedidos-backend-black.md, pedido 4.2).
  codigos: string[];
};

export function codigoNormalizado(codigo: string) {
  return codigo.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

const SD_PMBA = ["SDPMBA", "SOLDADOPMBA", "CFSDPMBA"];
const CFO_PMBA = ["CFOPMBA", "CFOPM", "CFO"];
const PMPE = ["SDPMPE", "PMPE", "SOLDADOPMPE"];
const PMAL = ["SDPMAL", "PMAL", "SOLDADOPMAL"];
const SD_BM = ["SDBMBA", "SDCBMBA", "CBMBA", "BMBA", "SOLDADOBM", "SOLDADOBMBA", "SDBM"];

// Tela do Combo de Simulados: os 7 concursos, na ordem da entrega.
export const CONCURSOS_DO_COMBO: ConcursoDaBlack[] = [
  { id: "sd-pmba", nome: "Soldado PMBA", sigla: "SD PMBA", brasao: `${IMG}/brasoes/sd-pmba.webp`, capa: `${IMG}/capas/simulado-sd-pmba.webp`, codigos: SD_PMBA },
  { id: "cfo-pmba", nome: "CFO PMBA", sigla: "CFO", brasao: `${IMG}/brasoes/cfo-pmba.webp`, capa: `${IMG}/capas/simulado-cfo.webp`, codigos: CFO_PMBA },
  { id: "pmpe", nome: "PMPE", sigla: "PMPE", brasao: `${IMG}/brasoes/pmpe.webp`, capa: `${IMG}/capas/simulado-pmpe.webp`, codigos: PMPE },
  { id: "pmal", nome: "PMAL", sigla: "PMAL", brasao: `${IMG}/brasoes/pmal.webp`, capa: `${IMG}/capas/simulado-pmal.webp`, codigos: PMAL },
  { id: "pcpe", nome: "PCPE", sigla: "PCPE", brasao: null, capa: null, codigos: ["PCPE", "AGENTEPCPE", "INVESTIGADORPCPE"] },
  { id: "sd-bm", nome: "Soldado BM", sigla: "SD BM", brasao: `${IMG}/brasoes/sd-bmba.webp`, capa: `${IMG}/capas/simulado-cbmba.webp`, codigos: SD_BM },
  { id: "cfo-bm", nome: "CFO BM", sigla: "CFO BM", brasao: null, capa: null, codigos: ["CFOBM", "CFOBMBA", "CFOCBMBA"] },
];

export type PreviaDoModulo = { materia: string; paginas: string[]; miniaturas: string[]; pdf: string; arquivo: string };

function previa(chave: string, materia: string): PreviaDoModulo {
  const n = [1, 2, 3, 4, 5, 6];
  return {
    materia,
    paginas: n.map((i) => `${IMG}/previas/${chave}-p${i}.webp`),
    miniaturas: n.map((i) => `${IMG}/previas/mini-${chave}-p${i}.webp`),
    pdf: `${IMG}/previas/previa-${chave}.pdf`,
    arquivo: `previa-${materia.toLowerCase().replace(/\s+/g, "-")}-${chave}.pdf`,
  };
}

// Tela dos Módulos teóricos: os 5 concursos, com a prévia de cada um (a matéria da prévia ainda a confirmar pelo Quad,
// pendência 8 da entrega).
export const CONCURSOS_DOS_MODULOS: (ConcursoDaBlack & { previa: PreviaDoModulo })[] = [
  { id: "sd-pmba", nome: "Soldado PMBA", sigla: "SD PMBA", brasao: `${IMG}/brasoes/sd-pmba.webp`, capa: `${IMG}/capas/modulo-sdpmba.webp`, codigos: SD_PMBA, previa: previa("sdpmba", "Módulo de Informática") },
  { id: "cfo-pmba", nome: "CFO PMBA", sigla: "CFO", brasao: `${IMG}/brasoes/cfo-pmba.webp`, capa: `${IMG}/capas/modulo-cfo.webp`, codigos: CFO_PMBA, previa: previa("cfo", "Módulo de Informática") },
  { id: "sd-pmpe", nome: "Soldado PMPE", sigla: "SD PMPE", brasao: `${IMG}/brasoes/pmpe.webp`, capa: `${IMG}/capas/modulo-pmpe.webp`, codigos: PMPE, previa: previa("pmpe", "Módulo de Raciocínio Lógico") },
  { id: "sd-pmal", nome: "Soldado PMAL", sigla: "SD PMAL", brasao: `${IMG}/brasoes/pmal.webp`, capa: `${IMG}/capas/modulo-pmal.webp`, codigos: PMAL, previa: previa("pmal", "Módulo de Informática") },
  { id: "sd-cbmba", nome: "Soldado CBMBA", sigla: "SD BM", brasao: `${IMG}/brasoes/sd-bmba.webp`, capa: `${IMG}/capas/modulo-cbmba.webp`, codigos: SD_BM, previa: previa("cbmba", "Módulo de Língua Portuguesa") },
];

export const VADE_MECUM = { nome: "Vade Mecum Soldado PMBA", capa: `${IMG}/capas/vade-mecum-sd-pmba.webp`, codigos: SD_PMBA };

export const TEXTOS = {
  combo: {
    titulo: "Combo de Simulados",
    cartao: "Escolha o concurso e leve os Simulados 01 a 05, com gabarito comentado.",
    tela: "Simulados 01 a 05 do seu concurso, prova objetiva e dissertativa no mesmo caderno, com gabarito comentado.",
    resumo: "5 simulados · objetiva + dissertativa · gabarito comentado",
  },
  modulos: {
    titulo: "Módulos teóricos",
    cartao: "Pacote completo do seu concurso ou módulos avulsos, por matéria.",
    tela: "Material teórico do seu concurso, organizado pelo edital. Leve o pacote com todos os módulos ou compre só as matérias que precisa.",
  },
  vade: { cartao: "Lei seca do edital com BIZU, ATENÇÃO NA PROVA, PEGADINHA FREQUENTE e RAIO-X." },
};

// As capas do leque dos cartões (na ordem: atrás à esquerda, atrás à direita, meio à esquerda, meio à direita, frente).
export const LEQUE_DO_COMBO = ["simulado-cbmba", "simulado-pmpe", "simulado-cfo", "simulado-pmal", "simulado-sd-pmba"].map((c) => `${IMG}/capas/${c}.webp`);
export const LEQUE_DOS_MODULOS = ["modulo-cbmba", "modulo-pmal", "modulo-cfo", "modulo-pmpe", "modulo-sdpmba"].map((c) => `${IMG}/capas/${c}.webp`);
