export type Turma = {
  slug: string;
  tag: string;
  nome: string;
  desc: string;
  preco: string;
  precoSufixo?: string;
  status: "aberta" | "breve" | "encerrada";
  statusLabel: string;
  // Novo visual (Turmas por modalidade). A API ainda não tem modalidade nem nome do concurso: lib/vitrine.ts deduz
  // pelo nome e pela descrição da turma. Ausente = não deu para saber.
  modalidade?: "rondesp" | "patamo" | "bope";
  // Insígnia da MODALIDADE da turma (toda turma tem uma; null = ainda sem arquivo, o site mostra a marca do Quad).
  insignia: string | null;
  // MODALIDADE da planilha, em qualquer cargo ("RONDESP", "INVESTIGADOR"); id = nome em minúsculas, sem acento.
  // Sem modalidade no cadastro, o nome da turma faz o papel.
  modalidadeNome: string;
  modalidadeId: string;  concurso?: string;
  turno?: string;
  // "06/07/2026"
  inicio?: string;
  // Foto da turma cadastrada na API (capa da página da turma).
  imagem?: string;
  detalhe?: {
    lead: string;
    specs: { label: string; valor: string; destaque?: boolean }[];
    // Ausentes quando a turma não tem limite de vagas.
    vagasTotal?: number;
    vagasOcupadas?: number;
    incluso: string[];
  };
};

export type Produto = {
  slug: string;
  tag: string;
  nome: string;
  desc: string;
  preco: string;
  // Formatos à venda. Da API vem só "impresso" (tipo MODULOS, retirada no Quad); a versão digital ainda não existe lá.
  formatos?: ("digital" | "impresso")[];
  esgotado?: boolean;
  detalhe?: {
    lead: string;
    specs: { label: string; valor: string; destaque?: boolean }[];
    sumario: string[];
  };
};

export type Evento = {
  slug: string;
  tag: string;
  nome: string;
  desc: string;
  preco: string;
  status: "aberta" | "breve" | "encerrada";
  statusLabel: string;
  detalhe?: {
    lead: string;
    sobre: string[];
    specs: { label: string; valor: string; destaque?: boolean }[];
    programacao: { horario: string; titulo: string; desc: string }[];
    incluso: string[];
    local: { nome: string; endereco: string; obs?: string };
    // Data e hora completas (ISO, horário de Brasília), para os buscadores. Na API: `inicio`/`fim` (docs/contrato-api-conteudo.md).
    inicio?: string;
    fim?: string;
    vagasTotal?: number;
    vagasOcupadas?: number;
    professores?: { iniciais: string; nome: string; papel: string }[];
  };
};

export type Aprovado = {
  nome: string;
  concurso: string;
  turma: string;
  ano: string;
  depoimento: string;
  fotoUrl?: string;
};

export const aprovados: Aprovado[] = [
  {
    nome: "Larissa Nunes",
    concurso: "Soldado PM-BA — 8º lugar geral",
    turma: "Turma CFP 2024.1",
    ano: "2024",
    depoimento:
      "O que fez diferença foi estudar só o que a banca realmente cobra. Os simulados quinzenais foram praticamente a prova em si.",
  },
  {
    nome: "Rafael Andrade",
    concurso: "Soldado PM-BA — Aprovado",
    turma: "Turma CFP 2023.2",
    ano: "2024",
    depoimento:
      "Depois de duas tentativas sozinho, entrei no Quad e em um ciclo só consegui minha aprovação. A rotina estruturada foi essencial.",
  },
  {
    nome: "Camila Torres",
    concurso: "Oficial PM-BA — 3º lugar geral",
    turma: "Turma CFO Intensiva 2023",
    ano: "2024",
    depoimento:
      "A correção individual das discursivas foi o diferencial. Consegui evoluir minha escrita em poucos meses de treino direcionado.",
  },
  {
    nome: "Diego Farias",
    concurso: "PRF — Aprovado",
    turma: "Turma PRF 2023",
    ano: "2023",
    depoimento:
      "Vim de fora de Feira de Santana só pra estudar presencial no Quad. Valeu cada quilômetro rodado nas aulas de sábado.",
  },
  {
    nome: "Beatriz Souza",
    concurso: "Soldado PM-BA — Aprovada",
    turma: "Turma CFP 2023.1",
    ano: "2023",
    depoimento:
      "Comecei do zero em Direito e Português. O acompanhamento próximo dos professores me deu segurança até o dia da prova.",
  },
  {
    nome: "Thiago Almeida",
    concurso: "Soldado PM-BA — 15º lugar geral",
    turma: "Turma CFP 2022.2",
    ano: "2023",
    depoimento:
      "O treinamento físico orientado aos sábados fez toda diferença no TAF. Cheguei preparado tanto na prova teórica quanto na prática.",
  },
];

export type Professor = {
  slug: string;
  nome: string;
  materia: string;
  bio: string;
  bioCompleta: string;
  formacao: string[];
  fotoUrl?: string;
};

export const professores: Professor[] = [
  {
    slug: "danilo-moura",
    nome: "Danilo Moura",
    materia: "Direito Administrativo",
    fotoUrl: "/images/professores/danilo.webp",
    bio: "Fundador do Quad Concursos, ex-policial militar e à frente da preparação presencial desde 2013.",
    bioCompleta:
      "Danilo fundou o Quad Concursos em 2013 depois de passar pela própria caserna como policial militar. Desde então já formou mais de 800 aprovados, sempre com o mesmo método: estudar só o que a banca realmente cobra.",
    formacao: [
      "Bacharel em Direito",
      "Ex-policial militar da PM-BA",
      "Fundador do Quad Concursos (2013)",
      "+12 anos de experiência em preparação presencial",
    ],
  },
  {
    slug: "fernanda-ribeiro",
    nome: "Fernanda Ribeiro",
    materia: "Direito Constitucional",
    bio: "10 anos de experiência acompanhando a banca da PM-BA, especialista em direitos e garantias fundamentais.",
    bioCompleta:
      "Fernanda acompanha de perto o estilo de cobrança da banca da PM-BA há uma década, com foco especial no capítulo de Direitos e Garantias Fundamentais — o que mais cai nas provas de Soldado e Oficial.",
    formacao: [
      "Bacharel em Direito",
      "Pós-graduada em Direito Constitucional",
      "10 anos de experiência com bancas militares",
    ],
  },
  {
    slug: "marcos-vinicius",
    nome: "Marcos Vinícius",
    materia: "Direito Penal Militar",
    bio: "Referência em jurisprudência atualizada do STM e STF, com foco nas questões mais cobradas em prova.",
    bioCompleta:
      "Marcos mantém o material de Direito Penal Militar sempre atualizado com as decisões mais recentes do STM e do STF, traduzindo jurisprudência complexa em conteúdo direto ao ponto para quem está estudando para a prova.",
    formacao: [
      "Bacharel em Direito",
      "Especialista em Direito Penal Militar",
      "Atualização constante em jurisprudência do STM/STF",
    ],
  },
  {
    slug: "juliana-prado",
    nome: "Juliana Prado",
    materia: "Língua Portuguesa",
    bio: "Especialista em interpretação de texto e gramática aplicada às últimas provas das bancas militares.",
    bioCompleta:
      "Juliana ensina português com foco total em interpretação de texto — a habilidade que mais separa aprovados de reprovados nas provas de concursos militares. Gramática é sempre aplicada às últimas provas da banca, nunca decorada.",
    formacao: [
      "Licenciada em Letras",
      "Especialista em interpretação de texto para concursos",
      "Professora de Português desde 2016",
    ],
  },
  {
    slug: "rodrigo-aguiar",
    nome: "Rodrigo Aguiar",
    materia: "Redação e Discursiva",
    bio: "Corretor de banca, orienta a produção textual das turmas de oficiais com correção individual.",
    bioCompleta:
      "Rodrigo já atuou como corretor de banca e traz esse olhar para dentro da sala de aula, corrigindo individualmente cada redação e peça discursiva das turmas de oficiais até o texto sair no padrão que a banca espera.",
    formacao: [
      "Bacharel em Letras",
      "Ex-corretor de banca de concursos militares",
      "Especialista em redação e discursiva",
    ],
  },
  {
    slug: "camila-duarte",
    nome: "Camila Duarte",
    materia: "Raciocínio Lógico",
    bio: "Método direto de resolução passo a passo, do básico às questões mais cobradas em concursos militares.",
    bioCompleta:
      "Camila desenvolveu um método de resolução passo a passo para Raciocínio Lógico que parte do zero e chega até as questões mais cobradas em concursos militares, sem depender de fórmulas decoradas.",
    formacao: [
      "Bacharel em Matemática",
      "Especialista em Raciocínio Lógico para concursos",
      "Professora do Quad desde 2019",
    ],
  },
];

export type Post = {
  slug: string;
  titulo: string;
  resumo: string;
  conteudo: string[];
  categoria: string;
  autor: string;
  data: string;
  tempoLeitura: string;
  imagemUrl?: string;
};

export const posts: Post[] = [
  {
    slug: "taf-cfp-soldado-pm-ba-como-funciona",
    titulo: "Como funciona o TAF do CFP Soldado PM-BA",
    resumo: "Entenda as provas do Teste de Aptidão Física, os índices mínimos exigidos e como montar um treino que respeita o seu ponto de partida.",
    categoria: "Preparação física",
    autor: "Danilo Moura",
    data: "10 JUL 2026",
    tempoLeitura: "6 min",
    conteudo: [
      "O Teste de Aptidão Física costuma ser o maior medo de quem nunca teve rotina de treino — e também a parte mais fácil de resolver com antecedência, já que os índices exigidos são conhecidos desde o edital.",
      "No CFP Soldado PM-BA, as provas mais comuns são corrida, flexão de braço, abdominal e barra fixa (para os homens). Cada uma tem um índice mínimo por faixa etária, e reprovar em qualquer uma delas elimina o candidato, independente da nota nas provas teóricas.",
      "O erro mais comum é deixar o treino físico para os últimos dois meses antes da prova. Índices de corrida e barra fixa em especial pedem meses de adaptação progressiva — começar cedo, mesmo que devagar, rende muito mais do que uma reta final intensa.",
      "Nas turmas presenciais do Quad, o treinamento físico orientado aos sábados acompanha o calendário da prova desde o primeiro mês, ajustando a carga conforme o nível de cada aluno.",
    ],
  },
  {
    slug: "edital-prf-2026-o-que-ja-sabemos",
    titulo: "Edital PRF 2026: o que já sabemos até agora",
    resumo: "Um panorama do que já foi sinalizado sobre o próximo concurso da PRF e como já começar a se preparar mesmo antes da publicação oficial.",
    categoria: "Editais",
    autor: "Fernanda Ribeiro",
    data: "02 JUL 2026",
    tempoLeitura: "5 min",
    conteudo: [
      "Mesmo sem edital publicado, já dá para se preparar para o concurso da PRF com base no histórico das últimas edições — a banca costuma manter o mesmo perfil de cobrança em Direito Constitucional, Administrativo e Legislação de Trânsito.",
      "Quem espera o edital sair para começar a estudar geralmente perde os meses mais valiosos de preparação: os primeiros, quando dá para construir base sem a pressão da contagem regressiva.",
      "A recomendação para quem já decidiu prestar PRF é montar uma rotina de revisão das disciplinas de maior peso histórico enquanto acompanha os sinais oficiais de publicação do edital.",
      "A turma PRF do Quad já está com lista de espera aberta e desconto garantido para quem entrar antes da publicação oficial.",
    ],
  },
  {
    slug: "erros-que-reprovam-na-discursiva-do-cfo",
    titulo: "5 erros que reprovam candidatos na discursiva do CFO",
    resumo: "Os problemas mais comuns nas redações e peças discursivas de quem presta o Curso de Formação de Oficiais — e como corrigir cada um deles.",
    categoria: "Redação e discursiva",
    autor: "Rodrigo Aguiar",
    data: "24 JUN 2026",
    tempoLeitura: "7 min",
    conteudo: [
      "Depois de corrigir centenas de discursivas, os mesmos erros aparecem repetidamente — e a boa notícia é que quase todos são fáceis de corrigir com prática dirigida.",
      "1. Fugir do tema proposto ao tentar encaixar um repertório decorado. 2. Não seguir a estrutura esperada pela banca (introdução, desenvolvimento e conclusão bem demarcados). 3. Excesso de opinião pessoal em peças que pedem fundamentação técnica.",
      "4. Desconhecer a legislação específica citada no enunciado — muitos candidatos escrevem bem, mas erram o conteúdo jurídico exigido. 5. Não revisar o texto: erros de concordância e pontuação custam pontos que fariam diferença na classificação final.",
      "Nas turmas de CFO do Quad, cada redação recebe correção individual, apontando exatamente qual desses cinco pontos precisa de mais atenção antes da próxima tentativa.",
    ],
  },
  {
    slug: "direitos-garantias-fundamentais-capitulo-que-mais-cai",
    titulo: "Direitos e Garantias Fundamentais: o capítulo que mais cai na prova",
    resumo: "Por que esse é o capítulo da Constituição mais cobrado nas provas de concursos militares e como estudá-lo sem se perder nos incisos.",
    categoria: "Direito Constitucional",
    autor: "Fernanda Ribeiro",
    data: "15 JUN 2026",
    tempoLeitura: "6 min",
    conteudo: [
      "O artigo 5º da Constituição Federal concentra boa parte das questões de Direito Constitucional em provas de concursos militares — e não é à toa: é o capítulo que mais se conecta com a rotina de quem vai atuar na segurança pública.",
      "O erro mais comum é tentar decorar os mais de 78 incisos do artigo sem entender a lógica por trás deles. A banca raramente cobra o texto literal isolado — geralmente cruza o conteúdo com situações práticas.",
      "A estratégia que funciona é agrupar os incisos por tema (liberdade, igualdade, devido processo legal, direitos de reunião e associação) em vez de estudar em ordem numérica.",
      "Esse é justamente o recorte usado no material de Direito Constitucional do Quad, que separa o capítulo por temas e cruza cada um com as questões mais recentes da banca.",
    ],
  },
  {
    slug: "rotina-de-estudos-trabalhando-integral",
    titulo: "Como organizar sua rotina de estudos trabalhando período integral",
    resumo: "Estratégias práticas para quem tem pouco tempo livre no dia a dia e precisa aproveitar cada hora de estudo disponível.",
    categoria: "Método de estudo",
    autor: "Juliana Prado",
    data: "05 JUN 2026",
    tempoLeitura: "5 min",
    conteudo: [
      "A maior parte de quem presta concurso militar trabalha em período integral — o que torna o planejamento do tempo tão importante quanto o conteúdo estudado.",
      "O primeiro passo é mapear os horários realmente disponíveis na semana, incluindo trechos pequenos como deslocamento e intervalos, e reservar esses momentos para revisão rápida em vez de conteúdo novo.",
      "Estudar poucas disciplinas por dia com profundidade rende mais do que tentar revisar tudo superficialmente — a rotina das turmas presenciais do Quad já é estruturada dessa forma, com uma disciplina principal por aula.",
      "Nos fins de semana, o ideal é reservar um bloco fixo para simulado nos moldes da banca, para treinar não só o conteúdo, mas o tempo de prova.",
    ],
  },
  {
    slug: "por-que-simulados-nos-moldes-da-banca-mudam-tudo",
    titulo: "Simulados: por que fazer nos moldes exatos da banca muda tudo",
    resumo: "A diferença entre resolver questões soltas e enfrentar uma prova completa, no tempo e no formato reais da banca organizadora.",
    categoria: "Método de estudo",
    autor: "Camila Duarte",
    data: "28 MAI 2026",
    tempoLeitura: "4 min",
    conteudo: [
      "Resolver questões soltas por disciplina é importante, mas não substitui a experiência de enfrentar uma prova completa, no tempo e na ordem exatos da banca organizadora.",
      "O simulado nos moldes da banca treina algo que nenhuma lista de questões treina sozinha: o gerenciamento do tempo entre disciplinas e a gestão da ansiedade durante as horas de prova.",
      "Muitos candidatos dominam o conteúdo, mas erram por gestão de tempo — chegam à última disciplina sem tempo para terminar. Isso só se resolve simulando a prova real, várias vezes, antes do dia da prova.",
      "Por isso o Quad organiza simulados abertos periódicos com correção comentada ao vivo — a ideia é que o dia da prova real seja o simulado que o aluno menos vai estranhar.",
    ],
  },
];
