// Conteúdo editorial do novo visual (entrega da designer, out/2026): banners da Home, modalidades das turmas,
// planos das Mentorias e produtos da Loja. Fica aqui até existir um painel ou CMS com os mesmos campos.
// `exemplo: true` = registro ilustrativo, que aparece no site com o selo "Exemplo ilustrativo".

// ---------- Banners do carrossel da Home ----------
// tipo "danilo": composição institucional feita no próprio site (foto do Danilo + "+800 aprovados").
// tipo "imagem": arte da designer. Sem arte ainda (imagem vazia), mostra o título sobre o fundo escuro.
export type Banner = {
  id: string;
  // Nome interno, lido pelos leitores de tela ("Banner 2 de 3: Mentorias do Quad").
  nome: string;
  publicado: boolean;
  ordem: number;
  tipo: "danilo" | "imagem";
  // Tamanhos: desktop 1920×800, celular 1080×1350 (guia de banners da designer).
  imagem?: { desktop: string; celular: string };
  alt?: string;
  // object-position da arte, ex.: "70% 50%".
  posicao?: { desktop: string; celular: string };
  // Película escura atrás do texto, para leitura sobre a arte.
  escurecer?: boolean;
  titulo?: string;
  descricao?: string;
  // true quando a arte já traz o texto.
  ocultarTexto?: boolean;
  botao: { texto: string; link: string; cor?: string; corTexto?: string };
};

export const banners: Banner[] = [
  {
    id: "institucional-danilo",
    nome: "Institucional — Danilo Moura",
    publicado: true,
    ordem: 1,
    tipo: "danilo",
    alt: "Danilo Moura, fundador do Quad Concursos",
    botao: { texto: "Clique aqui para acessar", link: "/turmas" },
  },
  {
    id: "mentoria-quad",
    nome: "Mentorias do Quad",
    publicado: true,
    ordem: 2,
    tipo: "imagem",
    imagem: { desktop: "", celular: "" },
    alt: "Mentorias do Quad",
    posicao: { desktop: "70% 50%", celular: "50% 25%" },
    escurecer: true,
    titulo: "Mentorias do Quad",
    botao: { texto: "Clique aqui para acessar", link: "/mentorias", cor: "#8E1B2E" },
  },
  {
    id: "turmas-presenciais",
    nome: "Turmas presenciais",
    publicado: true,
    ordem: 3,
    tipo: "imagem",
    imagem: { desktop: "", celular: "" },
    alt: "Turmas presenciais do Quad Concursos",
    posicao: { desktop: "70% 50%", celular: "50% 25%" },
    escurecer: true,
    titulo: "Turmas presenciais",
    botao: { texto: "Clique aqui para acessar", link: "/turmas" },
  },
];

export function bannersPublicados() {
  return banners.filter((b) => b.publicado).sort((a, b) => a.ordem - b.ordem);
}

// ---------- Modalidades das turmas presenciais ----------
// As turmas da API ainda não têm o campo "modalidade" (docs/pedidos-backend.md).
export type Modalidade = {
  id: "rondesp" | "patamo" | "bope";
  nome: string;
  nivel: string;
  insignia: string;
  perfil: string;
  metodo: string;
  // Peso da teoria no método (o resto é resolução de questões), em %.
  teoria: number;
};

export const modalidades: Modalidade[] = [
  {
    id: "rondesp",
    nome: "RONDESP",
    nivel: "Base teórica",
    insignia: "/images/insignias/rondesp.webp",
    perfil: "Indicada para alunos que precisam construir ou fortalecer a base de conhecimento.",
    metodo: "O foco principal é a explicação da teoria, com resolução de questões para fixação.",
    teoria: 75,
  },
  {
    id: "patamo",
    nome: "PATAMO",
    nivel: "Intermediário",
    insignia: "/images/insignias/patamo.webp",
    perfil: "Indicada para alunos que já possuem algum conhecimento, mas ainda precisam consolidar os conteúdos.",
    metodo: "Combina teoria e resolução de questões de forma equilibrada.",
    teoria: 50,
  },
  {
    id: "bope",
    nome: "BOPE",
    nivel: "Avançado",
    insignia: "/images/insignias/bope.webp",
    perfil: "Indicada para alunos que já possuem uma base de conhecimento e desejam intensificar o treinamento.",
    metodo: "O foco principal é a resolução de questões, revisão e aprimoramento do desempenho.",
    teoria: 25,
  },
];

// ---------- Mentorias do Quad ----------
// Vendidas na landing própria; as âncoras abaixo existem lá.
export const LINK_DAS_MENTORIAS = "https://mentorias.quadconcursos.com.br/";

export const mentorias = [
  {
    nome: "Mentoria",
    duracao: "12 meses de acesso",
    descricao:
      "Uma preparação completa com aulas gravadas, materiais teóricos, cronograma personalizado e análise de desempenho para orientar a evolução do aluno.",
    destaque: false,
    link: `${LINK_DAS_MENTORIAS}#mentoria`,
    recursos: [
      "Aulas gravadas",
      "Materiais teóricos em PDF",
      "Cronograma personalizado na Tutory",
      "Raio-X de desempenho por tópico",
      "Análise da incidência dos assuntos na prova",
      "Materiais exclusivos de redação",
      "Ajustes após a publicação do edital",
    ],
  },
  {
    nome: "Mentoria+",
    duracao: "3 meses de acesso",
    descricao:
      "Todos os recursos da Mentoria, com acompanhamento premium para quem deseja uma preparação mais próxima e orientada.",
    destaque: true,
    link: `${LINK_DAS_MENTORIAS}#plus`,
    // Além de tudo o que a Mentoria tem.
    recursos: [
      "Encontros semanais com professores do Quad",
      "Curso Como Estudar",
      "Comunidade Esparta",
      "Relatórios individuais de desempenho",
      "Uma correção individual de redação por mês",
      "Acompanhamento individualizado com mentor aprovado em concurso público",
      "QConcursos integrado à estratégia de preparação",
    ],
  },
  {
    nome: "Combo",
    duracao: "12 meses + 3 meses Plus",
    descricao: "Mentoria por 12 meses + benefícios da Mentoria Plus por 3 meses.",
    destaque: false,
    link: `${LINK_DAS_MENTORIAS}#comparativo`,
    recursos: [] as string[],
  },
];

// ---------- Loja Quad (produtos físicos) ----------
// Os produtos vêm da vitrine de itens da API (tipo OUTROS; lib/vitrine.ts). Aqui ficam o tipo e as categorias.
export type ProdutoDaLoja = {
  // Slug (nome + id), usado no endereço da página.
  id: string;
  idNaApi: string;
  categoria: string;
  nome: string;
  descricao: string | null;
  // null = "A confirmar".
  preco: number | null;
  estoque: number | null;
  imagemUrl: string | null;
  // esgotadas: opções sem estoque (aparecem, mas não podem ser escolhidas).
  variacoes: { nome: string; opcoes: string[]; esgotadas: string[]; ids: Record<string, string> }[];
  exemplo?: boolean;
};

export const categoriasDaLoja = [
  { id: "camisas", nome: "Camisas" },
  { id: "canecas", nome: "Canecas" },
  { id: "garrafas", nome: "Garrafas" },
  { id: "outros", nome: "Outros produtos" },
];
