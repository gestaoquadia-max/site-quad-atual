// As Mentorias da Black Friday (27 a 30/11/2026): o preço da campanha e o checkout da Tutory de cada concurso
// (links enviados pelo Quad em 26/11/2026). A página /mentorias abre a escolha do concurso; /mentorias/<id> leva ao
// checkout. Sem preço riscado nem parcelas (decisão de 26/11/2026).

export const PRECO_DA_MENTORIA = "R$ 277";

const BRASOES = "/images/brasoes-concursos";
const TUTORY = "https://pay.plataformatutory.com.br/checkout";

export type MentoriaDaBlack = { id: string; nome: string; brasao: string; checkout: string };

export const MENTORIAS_DA_BLACK: MentoriaDaBlack[] = [
  { id: "sd-pmba", nome: "Soldado PMBA", brasao: `${BRASOES}/pmba.png`, checkout: `${TUTORY}/5566bc3b-8852-4d70-9c0a-0b98001bc64a` },
  { id: "cfo-pmba", nome: "CFO PMBA", brasao: `${BRASOES}/cfo.png`, checkout: `${TUTORY}/294a5555-bfdb-4917-ae08-558b33c632c2` },
  { id: "sd-bmba", nome: "Soldado BMBA", brasao: `${BRASOES}/bmba.png`, checkout: `${TUTORY}/7a58f58e-9a87-494c-9d81-36b38360f0c8` },
  { id: "cfo-bmba", nome: "CFO BMBA", brasao: `${BRASOES}/bmba.png`, checkout: `${TUTORY}/b3043934-6abb-4a2f-a9e6-c768343c0a0b` },
  { id: "sd-pmpe", nome: "Soldado PMPE", brasao: `${BRASOES}/pmpe.png`, checkout: `${TUTORY}/8ad1b386-89f8-4631-b4ad-269e531acf80` },
];

export function mentoriaDaBlack(id: string) {
  return MENTORIAS_DA_BLACK.find((m) => m.id === id) ?? null;
}

export const INCLUSO_NA_MENTORIA = ["12 meses de acompanhamento", "Plano de estudos pelo seu edital", "Suporte direto da equipe Quad"];
