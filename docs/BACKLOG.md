# Backlog — Site do Quad Concursos

Organizado no formato do **Painel Interno Quad**: tarefa → POP → **etapas** → **blocos** → **tarefas**. Cada bloco abaixo vira um cartão no POP, com sua lista de tarefas e seus campos adicionais.

## Tarefa

| Campo | Valor |
|---|---|
| Descrição | Esta é uma demanda para mapear todos os pontos desenvolvidos no site |
| Prioridade | Alta |
| Responsáveis | Davi Marques |
| Data para início | 26/08/2026 |
| Data para término | 31/10/2026 |
| Status | EM ANDAMENTO |

## Como ler

| Campo | Valores |
|---|---|
| Status do bloco | **CONCLUÍDA** · **EM ANDAMENTO** · **PENDENTE** (ainda não iniciado) |
| Status da tarefa | **FEITO** · **EM ANDAMENTO** · **PENDENTE** · **NÃO SE APLICA** |
| Prioridade (campo adicional) | **Alta**: impede o lançamento · **Média**: logo após o lançamento · **Baixa**: melhoria futura |
| Depende de (campo adicional) | **Backend** (API Java) · **Pagar.me** · **Conteúdo** (textos e fotos do Quad) · **Decisão** (alguém precisa definir) · ou outro bloco |

> Responsáveis, início e término dos blocos são definidos no Painel; só a Etapa 1, Bloco 1 já tem datas. Tarefas marcadas com "(melhoria futura)" têm prioridade Baixa dentro do bloco. Retrato de 01/10/2026.

---

## Resumo das etapas

| Etapa | Título | Blocos | Tarefas | Feitas |
|---|---|---|---|---|
| 1 | Cadastro e login | 4 | 27 | 15 |
| 2 | Páginas públicas | 3 | 17 | 9 |
| 3 | Área do aluno | 4 | 17 | 9 |
| 4 | Qualidade de código | 3 | 11 | 8 |
| 5 | Conteúdo via API | 4 | 11 | 0 |
| 6 | Painel administrativo | 3 | 6 | 0 |
| 7 | Carrinho | 1 | 7 | 3 |
| 8 | Checkout e pagamento | 4 | 15 | 4 |
| 9 | SEO e performance | 2 | 8 | 1 |
| 10 | Segurança e LGPD | 2 | 6 | 0 |
| 11 | Analytics e marketing | 1 | 4 | 0 |
| 12 | Deploy e operação | 3 | 7 | 0 |

---

## Etapa 1 — CADASTRO E LOGIN

### Bloco 1 — AJUSTE DOS ENDPOINTS DA TELA DE LOGIN

**Status:** CONCLUÍDA · **Início:** 26/08/2026 · **Término:** 27/08/2026

| Tarefa | Status |
|---|---|
| Tela de login respondendo ao banco de dados | FEITO |
| Mensagens de erro da API na tela de login (ex.: conta inativa) | FEITO |
| Sair encerrando a sessão também no servidor | FEITO |

**Campos adicionais**
- **Ajuste do Endpoints:** Esse ajuste define os endpoints para as telas de login e cadastro deixarem de ser estáticas e passarem a responder ao banco de dados
- **Prioridade:** Alta
- **Depende de:** —

### Bloco 2 — TELA DE CADASTRO

**Status:** EM ANDAMENTO

| Tarefa | Status |
|---|---|
| Cadastro em 2 passos com busca de endereço pelo CEP | FEITO |
| Cadastro respondendo ao banco de dados | FEITO |
| Validação de CPF, e-mail, senha (8 a 72), telefone com DDD e UF | FEITO |
| Mensagens de erro de cada campo vindas da API | FEITO |
| Caixa de aceite dos Termos de uso e da Política de privacidade | FEITO |
| Registro do aceite dos termos na API | EM ANDAMENTO |
| Passo 3 do cadastro: tela de verificação do e-mail e do celular | EM ANDAMENTO |
| Envio e conferência do código de verificação por e-mail | EM ANDAMENTO |
| Envio e conferência do código de verificação por SMS ou WhatsApp | EM ANDAMENTO |
| Reenviar o código e corrigir e-mail ou celular digitado errado | EM ANDAMENTO |
| Definir se a conta só é liberada depois da verificação | FEITO |
| Avisar já no passo 1 quando e-mail, CPF ou telefone já estiverem cadastrados | FEITO |

**Campos adicionais**
- **Descrição:** Tela de criação de conta do aluno, ligada à API. Decisão (02/10/2026): só o **celular** é obrigatório para liberar a conta — o passo 3 do cadastro envia um código por SMS para ele. O **e-mail** é confirmado depois, por um link, e enquanto não for confirmado aparece um alerta em "Meu perfil". As telas já estão prontas; faltam as rotas no backend (docs/pedidos-backend.md, itens 2.5 a 2.7). Enquanto a rota do celular não existir, o passo 3 deixa o aluno continuar (provisório)
- **Prioridade:** Alta
- **Depende de:** Backend (registro do aceite e envio/conferência dos códigos) · Decisão (serviço de SMS ou WhatsApp) · Etapa 2, Bloco 2 (páginas de termos e privacidade)

### Bloco 3 — SESSÃO DO USUÁRIO

**Status:** EM ANDAMENTO

| Tarefa | Status |
|---|---|
| Renovação automática do token vencido | FEITO |
| Encerrar a sessão e voltar ao login quando não der para renovar | FEITO |
| Menu de perfil na navbar (avatar, editar conta, sair) | FEITO |
| Navbar atualizando na hora ao entrar e sair, inclusive em outras abas | FEITO |
| Definir onde guardar o token (navegador ou cookie protegido) | PENDENTE |
| Proteção da área do aluno também no servidor | PENDENTE |
| Voltar para a página anterior depois do login | FEITO |
| Login com Google (melhoria futura) | PENDENTE |

**Campos adicionais**
- **Descrição:** Manter o aluno logado com segurança e encerrar a sessão quando necessário. Testado no navegador: login normal, token vencido e renovação inválida
- **Prioridade:** Alta
- **Depende de:** Decisão (armazenamento do token)

### Bloco 4 — RECUPERAÇÃO E DADOS DA CONTA

**Status:** EM ANDAMENTO

| Tarefa | Status |
|---|---|
| Endpoint de "esqueci minha senha" no backend | PENDENTE |
| Tela de pedido de nova senha | EM ANDAMENTO |
| Tela de redefinição de senha | EM ANDAMENTO |
| Rota para o aluno ler e editar o próprio cadastro (`/api/usuarios/eu`) | EM ANDAMENTO |

**Campos adicionais**
- **Descrição:** Hoje a API não tem "esqueci minha senha", e a conta de aluno recebe "sem permissão" (403) ao ler ou editar o próprio cadastro. Por isso o site mostra o nome de guerra em vez do nome completo, e não mostra o e-mail
- **Prioridade:** Alta
- **Depende de:** Backend

---

## Etapa 2 — PÁGINAS PÚBLICAS

### Bloco 1 — PÁGINAS PRINCIPAIS

**Status:** CONCLUÍDA

| Tarefa | Status |
|---|---|
| Home | FEITO |
| Turmas: lista e detalhe | FEITO |
| Materiais: lista e detalhe | FEITO |
| Eventos: lista e detalhe | FEITO |
| Cursos online | FEITO |
| Blog: lista e post | FEITO |
| Aprovados e professores | FEITO |
| Carrinho | FEITO |
| Páginas de "não encontrada" (404) e "algo deu errado" | FEITO |

**Campos adicionais**
- **Descrição:** Todas as telas públicas prontas e navegáveis, ainda com dados de exemplo
- **Prioridade:** Alta
- **Depende de:** —

### Bloco 2 — PÁGINAS INSTITUCIONAIS

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Sobre o Quad | PENDENTE |
| Contato | PENDENTE |
| Termos de uso (com revisão jurídica) | PENDENTE |
| Política de privacidade (com revisão jurídica) | PENDENTE |

**Campos adicionais**
- **Descrição:** Hoje são links sem destino no rodapé. Os termos e a privacidade já são exigidos pela caixa de aceite do cadastro
- **Prioridade:** Alta
- **Depende de:** Conteúdo

### Bloco 3 — CONTEÚDO REAL DAS PÁGINAS

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Links da Tutory em cada curso online | PENDENTE |
| Fotos reais nas galerias | PENDENTE |
| Revisar textos de exemplo (datas de 2025, nomes, vagas) | PENDENTE |
| Botão de WhatsApp para atendimento | PENDENTE |

**Campos adicionais**
- **Descrição:** Trocar o que ainda é exemplo por conteúdo real do Quad
- **Prioridade:** Alta (links e textos) · Média (fotos e WhatsApp)
- **Depende de:** Conteúdo · Decisão (WhatsApp)

---

## Etapa 3 — ÁREA DO ALUNO

### Bloco 1 — ESTRUTURA DA ÁREA DO ALUNO

**Status:** CONCLUÍDA

| Tarefa | Status |
|---|---|
| Layout com barra lateral | FEITO |
| Bloqueio de acesso sem login | FEITO |
| Nome do aluno no painel e na barra lateral | FEITO |
| Mensagens de carregando, lista vazia e erro em todas as telas | FEITO |

**Campos adicionais**
- **Descrição:** Base da área do aluno. O nome exibido é o nome de guerra até existir a rota do Etapa 1, Bloco 4
- **Prioridade:** Alta
- **Depende de:** —

### Bloco 2 — PERFIL DO ALUNO

**Status:** EM ANDAMENTO

| Tarefa | Status |
|---|---|
| Mostrar os dados reais do aluno | FEITO |
| Mensagens de carregando e erro na tela de perfil | FEITO |
| Salvar nome e telefone | EM ANDAMENTO |
| Trocar senha | FEITO |
| Exibir e editar o endereço | FEITO |
| CPF e e-mail apenas para leitura | FEITO |
| Alterar telefone com verificação por código | PENDENTE |
| Foto de perfil (melhoria futura) | PENDENTE |

**Campos adicionais**
- **Descrição:** O aluno vê todos os seus dados, incluindo o endereço. CPF e e-mail são só para leitura; nome e endereço são editáveis; o telefone segue a ordem: o aluno digita o número novo no site, o código é enviado para esse número novo e a troca só vale depois que ele digita o código (até lá, o número atual continua cadastrado). Endereço e troca de senha já funcionam pela API. Nome completo, e-mail, CPF e telefone vêm de `GET /api/alunos/eu` (CPF desde 03/10/2026); falta o backend criar a edição do nome. A foto depende de uma rota de envio que ainda não existe
- **Prioridade:** Alta
- **Depende de:** Etapa 1, Bloco 4 · Backend (envio e conferência do código de verificação do telefone)

### Bloco 3 — TURMAS E MATERIAIS

**Status:** EM ANDAMENTO

| Tarefa | Status |
|---|---|
| Minhas turmas com as matrículas reais | EM ANDAMENTO |
| Meus materiais com download do arquivo | EM ANDAMENTO |
| Materiais diários por turma | EM ANDAMENTO |

**Campos adicionais**
- **Descrição:** As telas já usam a API: Minhas turmas lê `/api/matriculas` + `/api/turmas/{id}` e calcula o progresso pelas aulas realizadas na agenda da turma; Meus materiais lê `/api/materiais/eu` (por turma, matéria e tópico, com download e marcação de visto). Testadas só sem dados (conta de teste sem matrícula). Os PDFs vendidos avulsos ainda não existem na API
- **Prioridade:** Alta
- **Depende de:** Backend

### Bloco 4 — COMPRAS E EVENTOS

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Histórico de compras real | PENDENTE |
| Meus eventos com as inscrições reais | PENDENTE |

**Campos adicionais**
- **Descrição:** Hoje as listas são fixas no código
- **Prioridade:** Alta
- **Depende de:** Backend · Etapa 8 (pedidos)

---

## Etapa 4 — QUALIDADE DE CÓDIGO

### Bloco 1 — FERRAMENTAS DO PROJETO

**Status:** CONCLUÍDA

| Tarefa | Status |
|---|---|
| Verificação de código (lint) funcionando | FEITO |
| Build de produção sem erros | FEITO |
| README atualizado | FEITO |
| Arquivo de exemplo das variáveis de ambiente | FEITO |
| Arquivo gerado automaticamente fora do Git | FEITO |
| Raiz do projeto fixada (servidor estava lento e travando) | FEITO |

**Campos adicionais**
- **Descrição:** Deixar o projeto organizado e verificável
- **Prioridade:** Alta
- **Depende de:** —

### Bloco 2 — CAMADA CENTRAL DA API

**Status:** CONCLUÍDA

| Tarefa | Status |
|---|---|
| Erros da API lidos num formato só | FEITO |
| Token e renovação tratados num só lugar | FEITO |

**Campos adicionais**
- **Descrição:** Base para todas as próximas integrações com a API (`lib/http.ts` e `lib/auth.ts`)
- **Prioridade:** Média
- **Depende de:** —

### Bloco 3 — TESTES E VERIFICAÇÃO AUTOMÁTICA

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Escolher a ferramenta de testes | PENDENTE |
| Testes de login, cadastro e checkout | PENDENTE |
| Verificação automática a cada envio ao GitHub | PENDENTE |

**Campos adicionais**
- **Descrição:** Evitar que uma mudança quebre os fluxos principais sem ninguém perceber
- **Prioridade:** Média
- **Depende de:** Decisão

---

## Etapa 5 — CONTEÚDO VIA API

### Bloco 1 — CONTRATO DA API DE CONTEÚDO

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Mapear as rotas que já existem de turmas, eventos e materiais | PENDENTE |
| Definir o formato de cada conteúdo do site | PENDENTE |

**Campos adicionais**
- **Descrição:** Hoje o conteúdo vem de dados de exemplo em `lib/data.ts`. A troca é só da fonte de dados; as telas não precisam mudar
- **Prioridade:** Alta
- **Depende de:** Backend

### Bloco 2 — CONTEÚDO DE VENDA

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Turmas pela API (com vagas ocupadas em tempo real) | PENDENTE |
| Materiais PDF pela API (com preço) | PENDENTE |
| Eventos pela API (com vagas) | PENDENTE |

**Campos adicionais**
- **Descrição:** O que o aluno compra no site
- **Prioridade:** Alta
- **Depende de:** Etapa 5, Bloco 1

### Bloco 3 — CONTEÚDO INSTITUCIONAL

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Professores pela API | PENDENTE |
| Aprovados e histórias em vídeo pela API | PENDENTE |
| Blog pela API ou por um sistema de conteúdo | PENDENTE |
| Barra de notícias do topo editável | PENDENTE |

**Campos adicionais**
- **Descrição:** Conteúdo de vitrine, que muda com frequência
- **Prioridade:** Média
- **Depende de:** Backend · Decisão (blog)

### Bloco 4 — DESEMPENHO DO CONTEÚDO

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Cache das páginas para não consultar a API a cada visita | PENDENTE |
| Imagens guardadas em nuvem, fora do código | PENDENTE |

**Campos adicionais**
- **Descrição:** Manter o site rápido depois que o conteúdo vier da API
- **Prioridade:** Média
- **Depende de:** Decisão (serviço de imagens)

---

## Etapa 6 — PAINEL ADMINISTRATIVO

### Bloco 1 — DEFINIÇÃO DA FERRAMENTA

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Decidir entre painel próprio, painel do backend ou sistema de conteúdo (CMS) | PENDENTE |

**Campos adicionais**
- **Descrição:** Alguém do Quad precisa cadastrar turmas, materiais, eventos e posts sem mexer no código
- **Prioridade:** Alta
- **Depende de:** Decisão

### Bloco 2 — CADASTRO DE CONTEÚDO

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Criar e editar turmas, materiais e eventos | PENDENTE |
| Enviar PDFs e liberar acesso por aluno ou turma | PENDENTE |
| Publicar materiais diários por turma | PENDENTE |

**Campos adicionais**
- **Descrição:** Operação do dia a dia do conteúdo
- **Prioridade:** Alta
- **Depende de:** Etapa 6, Bloco 1 · Backend

### Bloco 3 — GESTÃO DE VENDAS

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Lista de inscritos por evento e por turma | PENDENTE |
| Gestão de cupons de desconto | PENDENTE |

**Campos adicionais**
- **Descrição:** Acompanhamento das vendas e inscrições
- **Prioridade:** Média
- **Depende de:** Backend

---

## Etapa 7 — CARRINHO

### Bloco 1 — CARRINHO DE COMPRAS

**Status:** EM ANDAMENTO

| Tarefa | Status |
|---|---|
| Carrinho salvo no navegador, com quantidade, remover e total | FEITO |
| Identificar os itens pelo id, não pelo nome | FEITO |
| Definir o fluxo do botão comprar (hoje pula o carrinho) | FEITO |
| Inscrição em evento gratuito sem passar pelo checkout | EM ANDAMENTO |
| Registrar a inscrição gratuita na API | PENDENTE |
| Conferir preço e vagas no servidor antes de pagar | PENDENTE |
| Carrinho salvo na conta do aluno (melhoria futura) | PENDENTE |

**Campos adicionais**
- **Descrição:** Seleção dos itens antes do pagamento
- **Prioridade:** Alta
- **Depende de:** Decisão (fluxo de compra) · Backend

---

## Etapa 8 — CHECKOUT E PAGAMENTO

### Bloco 1 — TELAS DE CHECKOUT

**Status:** EM ANDAMENTO

| Tarefa | Status |
|---|---|
| Telas de cartão, PIX, boleto, cupom e confirmação (visual) | FEITO |
| Resumo do pedido lendo o carrinho real | FEITO |
| Turmas cobradas pelo valor fechado da duração, sem mensalidade | FEITO |
| Exigir login antes de pagar (ou criar conta no checkout) | PENDENTE |
| Telas de pagamento aprovado, pendente e recusado | FEITO |

**Campos adicionais**
- **Descrição:** O checkout lê o carrinho real. O pagamento ainda é simulado: cartão leva à tela de aprovado, e PIX e boleto à tela de aguardando pagamento, até a integração com o Pagar.me. Turmas são vendidas pelo valor fechado da duração (ex.: 3 meses por R$ 997), nunca por mensalidade
- **Prioridade:** Alta
- **Depende de:** Decisão (login antes de pagar)

### Bloco 2 — INTEGRAÇÃO COM O PAGAR.ME

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Pagamento com cartão | PENDENTE |
| Pagamento por PIX (QR Code e copia e cola) | PENDENTE |
| Pagamento por boleto (linha digitável e PDF) | PENDENTE |
| Parcelamento calculado pelo valor real | PENDENTE |

**Campos adicionais**
- **Descrição:** Cobrança de verdade
- **Prioridade:** Alta
- **Depende de:** Pagar.me · Backend

### Bloco 3 — PEDIDO E LIBERAÇÃO DE ACESSO

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Registrar o pedido na API | PENDENTE |
| Liberar o acesso automaticamente após o pagamento | PENDENTE |
| Validar cupons no backend (hoje estão no código) | PENDENTE |
| E-mails de compra confirmada, boleto gerado e acesso liberado | PENDENTE |

**Campos adicionais**
- **Descrição:** O que acontece depois que o aluno paga
- **Prioridade:** Alta
- **Depende de:** Backend · Etapa 8, Bloco 2

### Bloco 4 — FINANCEIRO

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Emissão de nota fiscal | PENDENTE |
| Reembolso e cancelamento (melhoria futura) | PENDENTE |

**Campos adicionais**
- **Descrição:** Regras financeiras além da compra avulsa
- **Prioridade:** Média
- **Depende de:** Decisão · Pagar.me

---

## Etapa 9 — SEO E PERFORMANCE

### Bloco 1 — SEO BÁSICO

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Título e descrição próprios em cada página | PENDENTE |
| Imagem de compartilhamento e ícone do site | PENDENTE |
| Sitemap e robots (sem `/aluno` e `/checkout` nos buscadores) | PENDENTE |
| Dados estruturados de empresa, cursos e eventos para o Google | PENDENTE |

**Campos adicionais**
- **Descrição:** O site ser encontrado e bem exibido no Google e nas redes
- **Prioridade:** Alta
- **Depende de:** Conteúdo (imagem e ícone)

### Bloco 2 — PERFORMANCE E ACESSIBILIDADE

**Status:** EM ANDAMENTO

| Tarefa | Status |
|---|---|
| Fontes otimizadas | FEITO |
| Imagens otimizadas | PENDENTE |
| Acessibilidade: contraste, teclado e rótulos | PENDENTE |
| Medição de desempenho no celular | PENDENTE |

**Campos adicionais**
- **Descrição:** Site rápido e acessível para todos
- **Prioridade:** Média
- **Depende de:** —

---

## Etapa 10 — SEGURANÇA E LGPD

### Bloco 1 — LGPD

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Termos e política de privacidade publicados | PENDENTE |
| Aviso de consentimento de cookies | PENDENTE |
| Canal para o aluno pedir exclusão ou cópia dos dados | PENDENTE |

**Campos adicionais**
- **Descrição:** Obrigações legais com os dados dos alunos
- **Prioridade:** Alta
- **Depende de:** Etapa 2, Bloco 2 · Decisão (cookies)

### Bloco 2 — SEGURANÇA

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| API aceitando chamadas só do domínio do site, com HTTPS | PENDENTE |
| Cabeçalhos de segurança no site | PENDENTE |
| Limite de tentativas no login e no cadastro | PENDENTE |

**Campos adicionais**
- **Descrição:** Proteção do site e da API contra uso indevido
- **Prioridade:** Alta (HTTPS) · Média (demais)
- **Depende de:** Backend

---

## Etapa 11 — ANALYTICS E MARKETING

### Bloco 1 — MEDIÇÃO

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Google Analytics | PENDENTE |
| Pixel da Meta com eventos de cadastro, checkout e compra | PENDENTE |
| Origem da visita (UTMs) mantida até a compra | PENDENTE |
| Captura de leads (melhoria futura) | PENDENTE |

**Campos adicionais**
- **Descrição:** Saber de onde vêm as vendas
- **Prioridade:** Média
- **Depende de:** Decisão

---

## Etapa 12 — DEPLOY E OPERAÇÃO

### Bloco 1 — PUBLICAÇÃO

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Escolher a hospedagem (provável Vercel) | PENDENTE |
| Apontar o domínio para o site | PENDENTE |
| Configurar as variáveis de produção (API e Pagar.me) | PENDENTE |

**Campos adicionais**
- **Descrição:** Colocar o site no ar
- **Prioridade:** Alta
- **Depende de:** Decisão · Backend · Pagar.me

### Bloco 2 — HOMOLOGAÇÃO E LANÇAMENTO

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Ambiente de homologação com API e Pagar.me em modo de teste | PENDENTE |
| Teste completo: cadastro → compra (cartão, PIX, boleto) → acesso ao material | PENDENTE |

**Campos adicionais**
- **Descrição:** Validar tudo antes de abrir para os alunos
- **Prioridade:** Alta
- **Depende de:** Etapas 1 a 8

### Bloco 3 — OPERAÇÃO

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Alerta de erros e de site fora do ar | PENDENTE |
| Backup e plano para desfazer uma publicação com problema | PENDENTE |

**Campos adicionais**
- **Descrição:** Manter o site estável depois do lançamento
- **Prioridade:** Média
- **Depende de:** Decisão · Backend

---

## Checklist para ir ao ar

- [ ] Todo o conteúdo público vem da API (ou foi revisado e é real)
- [ ] Páginas institucionais, termos e privacidade publicados
- [ ] Login, cadastro, sair, esqueci a senha e sessão funcionando
- [ ] Área do aluno mostra só dados reais do aluno logado
- [ ] Checkout lê o carrinho, cobra via Pagar.me e libera o acesso automaticamente
- [ ] Alguém do Quad consegue cadastrar turma, material e evento sem programador
- [ ] SEO básico (títulos, sitemap, robots, imagem de compartilhamento)
- [ ] Variáveis de produção configuradas e domínio no ar
- [ ] Teste ponta a ponta em homologação aprovado
