// Fotos dos alunos aprovados na seção Aprovados da Home (11/11/2026; a página /aprovados saiu): 10 das fotos enviadas pela equipe, em
// public/images/aprovados. A palavra (APROVADO, APROVADA, APROVADOS, APROVADAS) e o concurso saem do nome de cada
// arquivo recebido ("APROVADA CFO PMBA.JPG" → APROVADA, CFO • PMBA). Quando a API tiver o cadastro dos aprovados
// (foto + concurso, pelo Painel), a lista passa a vir de lá.
export type FotoDeAprovado = { src: string; palavra: string; concurso: string; alt: string };

export const FOTOS_DE_APROVADOS: FotoDeAprovado[] = [
  { src: "aprovada-cfo-pmba.jpg", palavra: "Aprovada", concurso: "CFO • PMBA", alt: "Aluna do Quad aprovada no CFO da PMBA, de farda" },
  { src: "aprovado-sd-pmba-1.jpg", palavra: "Aprovado", concurso: "SD • PMBA", alt: "Aluno do Quad aprovado para Soldado da PMBA, de farda" },
  { src: "aprovado-cfo-pmba-1.jpg", palavra: "Aprovado", concurso: "CFO • PMBA", alt: "Aluno do Quad aprovado no CFO da PMBA, de farda de gala" },
  { src: "aprovada-oficial-cbmba.jpg", palavra: "Aprovada", concurso: "Oficial • CBMBA", alt: "Aluna do Quad aprovada para oficial do Corpo de Bombeiros da Bahia, de farda" },
  { src: "aprovado-sd-pmba-2.jpg", palavra: "Aprovado", concurso: "SD • PMBA", alt: "Aluno do Quad aprovado para Soldado da PMBA, de farda" },
  { src: "aprovados-cfo-pmba.jpg", palavra: "Aprovados", concurso: "CFO • PMBA", alt: "Dois alunos do Quad aprovados no CFO da PMBA, de farda de gala" },
  { src: "aprovadas-pmba.jpg", palavra: "Aprovadas", concurso: "PMBA", alt: "Duas alunas do Quad aprovadas na PMBA, de farda" },
  { src: "aprovado-cfo-pmba-2.jpg", palavra: "Aprovado", concurso: "CFO • PMBA", alt: "Aluno do Quad aprovado no CFO da PMBA, de farda de gala" },
  { src: "aprovado-sd-pmba-3.jpg", palavra: "Aprovado", concurso: "SD • PMBA", alt: "Aluno do Quad aprovado para Soldado da PMBA, de farda" },
  { src: "aprovado-cfo-pmba-3.jpg", palavra: "Aprovado", concurso: "CFO • PMBA", alt: "Aluno do Quad aprovado no CFO da PMBA, de farda de gala" },
];
