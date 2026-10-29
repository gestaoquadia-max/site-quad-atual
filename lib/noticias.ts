import { SITE_DE_TESTE } from "./seo";

// Notícias de concursos da barra azul do topo (components/NewsTicker.tsx).
// SIMULAÇÃO (29/10/2026): textos de exemplo para ver o formato, até a API ter o cadastro de avisos pelo console
// (docs/pedidos-backend.md, item 5.5). Por serem inventadas, só aparecem no localhost e no site de teste, nunca no
// domínio oficial; lá a barra continua com as turmas abertas.
export type NoticiaDeConcurso = { rotulo: string; texto: string };

const NOTICIAS_DE_EXEMPLO: NoticiaDeConcurso[] = [
  { rotulo: "Edital", texto: "PM-BA: comissão do concurso de Soldado formada; edital previsto para o 1º semestre de 2027" },
  { rotulo: "Inscrições", texto: "CBM-BA: inscrições para Soldado Bombeiro abertas até 30/11 no site da banca" },
  { rotulo: "Prova", texto: "PC-BA: prova objetiva de Investigador marcada para 14/12, nos turnos da manhã e da tarde" },
  { rotulo: "Resultado", texto: "PM-BA CFO: gabarito preliminar publicado; recursos até 06/11" },
  { rotulo: "Convocação", texto: "PM-BA CFS: lista de convocados para o curso de Sargentos sai na próxima semana" },
];

export function noticiasDaBarra(): NoticiaDeConcurso[] {
  return process.env.NODE_ENV === "development" || SITE_DE_TESTE ? NOTICIAS_DE_EXEMPLO : [];
}
