// Áreas em espera no site (09/11/2026): a aba continua no menu, mas a página, as páginas de cada item e a seção da home
// mostram o aviso "Em desenvolvimento" (components/EmDesenvolvimento.tsx), e nada dessas áreas pode ser comprado por
// elas. A conta de administrador continua vendo tudo, para o desenvolvimento (components/AreaEmEspera.tsx).
// Para reabrir uma área para todos, basta trocar o valor dela para false.
export type AreaDoSite = "materiais" | "loja" | "mentorias";

export const EM_ESPERA: Record<AreaDoSite, boolean> = {
  materiais: true,
  loja: true,
  mentorias: true,
};

export const TEXTO_EM_ESPERA = {
  materiais: "Em breve, as apostilas e os kits do Quad vão estar aqui, com teoria direto ao ponto e questões comentadas da banca.",
  loja: "Em breve, os produtos oficiais do Quad Concursos vão estar aqui, com retirada na sede.",
  mentorias: "Em breve, os planos das Mentorias do Quad vão estar aqui, com estratégia, cronograma personalizado e análise de desempenho.",
} as const;

// Os aprovados não são uma área em espera: falta o conteúdo real (as histórias virão da API).
export const TEXTO_DOS_APROVADOS =
  "Em breve, as histórias dos alunos do Quad aprovados na PM-BA, no CFO e em outras forças de segurança vão estar aqui.";
