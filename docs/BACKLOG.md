| Home nova com carrossel de destaques | FEITO || Botão flutuante do WhatsApp | FEITO || Rodapé novo | FEITO || Menu do topo novo (desktop e celular) | FEITO || Cores, fontes e largura do novo visual | FEITO |# Backlog — Site do Quad Concursos

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
| 1 | Cadastro e login | 4 | 28 | 21 |
| 2 | Páginas públicas | 3 | 17 | 10 |
| 3 | Área do aluno | 4 | 17 | 13 |
| 4 | Qualidade de código | 3 | 11 | 10 |
| 5 | Conteúdo via API | 4 | 11 | 3 |
| 6 | Painel administrativo | 3 | 6 | 0 |
| 7 | Carrinho | 1 | 7 | 3 |
| 8 | Checkout e pagamento | 4 | 15 | 4 |
| 9 | SEO e performance | 2 | 8 | 8 |
| 10 | Segurança e LGPD | 2 | 6 | 1 |
| 11 | Analytics e marketing | 1 | 4 | 0 |
| 12 | Deploy e operação | 3 | 7 | 0 |
| 13 | Redesenho do site | 9 | 28 | 5 |

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
| Registro do aceite dos termos na API | FEITO |
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
| Definir onde guardar o token (navegador ou cookie protegido) | FEITO |
| Migrar o login para cookie protegido | PENDENTE |
| Proteção da área do aluno também no servidor | PENDENTE |
| Voltar para a página anterior depois do login | FEITO |
| Login com Google (melhoria futura) | PENDENTE |

**Campos adicionais**
- **Descrição:** Manter o aluno logado com segurança e encerrar a sessão quando necessário. Testado no navegador: login normal, token vencido e renovação inválida
- **Prioridade:** Alta
- **Depende de:** Backend (login em cookie protegido, docs/pedidos-backend.md item 2.10) · Atualização do Next.js (docs/seguranca.md, item S1)

### Bloco 4 — RECUPERAÇÃO E DADOS DA CONTA

**Status:** CONCLUÍDA · **Término:** 14/10/2026

| Tarefa | Status |
|---|---|
| Endpoint de "esqueci minha senha" no backend | FEITO |
| Tela de pedido de nova senha | FEITO |
| Tela de redefinição de senha | FEITO |
| Rota para o aluno ler e editar o próprio cadastro (`/api/usuarios/eu`) | FEITO |

**Campos adicionais**
- **Descrição:** Recuperação de senha pronta em 14/10/2026: o site usa `POST /auth/senha/recuperacao` (pedir o link; vale 30 minutos e só pode ser pedido de novo depois de 60 s), `/recuperacao/verificacao` (confere o link ao abrir a página) e `/recuperacao/redefinicao` (grava a senha nova). Testado de ponta a ponta na API local: link válido, senha nova, login com ela, link recusado na segunda vez e sessões antigas encerradas. A rota do próprio cadastro ficou em `/api/alunos/eu` (e não `/api/usuarios/eu`): `GET` lê nome completo, e-mail, CPF e telefone, e `PATCH` salva o nome. Falta conferir num e-mail real se o link aponta para `/redefinir-senha?token=` no domínio do site
- **Prioridade:** Alta
- **Depende de:** —

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

**Status:** EM ANDAMENTO

| Tarefa | Status |
|---|---|
| Sobre o Quad | FEITO |
| Contato | EM ANDAMENTO |
| Termos de uso (com revisão jurídica) | EM ANDAMENTO |
| Política de privacidade (com revisão jurídica) | EM ANDAMENTO |

**Campos adicionais**
- **Descrição:** As quatro páginas existem e estão ligadas ao rodapé (`/sobre`, `/contato`, `/termos`, `/privacidade`). Sobre usa o conteúdo da base institucional. Contato, Termos e Privacidade leem os dados da empresa de `lib/institucional.ts` (CNPJ, endereço, WhatsApp, e-mails, foro), que ainda precisam ser preenchidos; termos e privacidade são minutas que precisam de revisão jurídica
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
| Salvar nome e telefone | FEITO |
| Trocar senha | FEITO |
| Exibir e editar o endereço | FEITO |
| CPF e e-mail apenas para leitura | FEITO |
| Alterar telefone pede nova verificação | EM ANDAMENTO |
| Foto de perfil (melhoria futura) | PENDENTE |

**Campos adicionais**
- **Descrição:** O aluno vê todos os seus dados, incluindo o endereço. CPF e e-mail são só para leitura; nome e endereço são editáveis; o telefone segue a ordem: o aluno digita o número novo no site, o código é enviado para esse número novo e a troca só vale depois que ele digita o código (até lá, o número atual continua cadastrado). Endereço e troca de senha já funcionam pela API. Nome completo, e-mail, CPF e telefone vêm de `GET /api/alunos/eu` (CPF desde 03/10/2026). O nome é salvo por `PATCH /api/alunos/eu` desde 07/10/2026; o telefone não vai por essa rota, só pela tarefa "Alterar telefone pede nova verificação" (tela pronta no site; falta o backend criar o envio e a conferência do código). A foto depende de uma rota de envio que ainda não existe
- **Prioridade:** Alta
- **Depende de:** Etapa 1, Bloco 4 · Backend (envio e conferência do código de verificação do telefone)

### Bloco 3 — TURMAS E MATERIAIS

**Status:** EM ANDAMENTO

| Tarefa | Status |
|---|---|
| Minhas turmas com as matrículas reais | FEITO |
| Meus materiais com download do arquivo | EM ANDAMENTO |
| Materiais diários por turma | EM ANDAMENTO |

**Campos adicionais**
- **Descrição:** As telas já usam a API: Minhas turmas lê `/api/matriculas` + `/api/turmas/{id}` e calcula o progresso pelas aulas realizadas na agenda da turma; Meus materiais lê `/api/materiais/eu` (por turma, matéria e tópico, com download e marcação de visto). Minhas turmas testada com matrículas reais em 05/10/2026 (cada aluno vê só as suas). Meus materiais testada em 05/10/2026 com materiais de teste: lista por turma, filtro, "Novo"/visto e vídeo funcionando; o download do arquivo não pôde ser testado porque o backend local não tem armazenamento de arquivos configurado (responde 503) Os PDFs vendidos avulsos ainda não existem na API
- **Prioridade:** Alta
- **Depende de:** Backend

### Bloco 4 — COMPRAS E EVENTOS

**Status:** CONCLUÍDA

| Tarefa | Status |
|---|---|
| Histórico de compras real | FEITO |
| Meus eventos com as inscrições reais | FEITO |

**Campos adicionais**
- **Descrição:** Compras lê `/api/loja/compras` e mostra só as compras em reais (cartão, PIX e boleto) — as pagas com Quad Coins ou diamantes são do app Viver o Quad e ficam de fora; para PIX pendente, permite copiar o código. Meus eventos lê `/api/alunos/eu/atividades` (próximos 12 meses e histórico dos últimos 12, com "participou"/"não compareceu"). Testadas em 05/10/2026 com dados reais do banco local
- **Prioridade:** Alta
- **Depende de:** —

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

**Status:** EM ANDAMENTO

| Tarefa | Status |
|---|---|
| Escolher a ferramenta de testes | FEITO |
| Testes de login, cadastro e checkout | FEITO |
| Verificação automática a cada envio ao GitHub | EM ANDAMENTO |

**Campos adicionais**
- **Descrição:** Evitar que uma mudança quebre os fluxos principais sem ninguém perceber. Ferramenta: Playwright (`npm run test:e2e`), com 16 testes em `tests/e2e/` (páginas públicas, login, cadastro, área do aluno e checkout), usando o Chrome do computador e a API local com os dados de teste. Verificação no GitHub em `.github/workflows/verificacao.yml` (tipos, lint, build e vulnerabilidades), ainda não executada porque o código não foi enviado ao GitHub
- **Prioridade:** Média
- **Depende de:** Enviar o código ao GitHub (commit e push)

---

## Etapa 5 — CONTEÚDO VIA API

### Bloco 1 — CONTRATO DA API DE CONTEÚDO

**Status:** CONCLUÍDA · **Início:** 10/10/2026 · **Término:** 13/10/2026

| Tarefa | Status |
|---|---|
| Mapear as rotas que já existem de turmas, eventos e materiais | FEITO |
| Definir o formato de cada conteúdo do site | FEITO |

**Campos adicionais**
- **Descrição:** Hoje o conteúdo vem de dados de exemplo em `lib/data.ts`. A troca é só da fonte de dados; as telas não precisam mudar. O mapa campo a campo está em `docs/mapa-api-conteudo.md` (10/10/2026): a vitrine pública já entrega nome, imagem, preço, datas, turno/horário, modalidade, descrição da turma e vagas em tempo real de turmas, eventos e simulados; faltam slug, textos de venda, local com endereço, professores públicos e os materiais em PDF. O formato exato que o site espera de cada conteúdo, com a ordem de prioridade para o backend, está em `docs/contrato-api-conteudo.md` (13/10/2026)
- **Prioridade:** Alta
- **Depende de:** —

### Bloco 2 — CONTEÚDO DE VENDA

**Status:** EM ANDAMENTO

| Tarefa | Status |
|---|---|
| Turmas pela API (com vagas ocupadas em tempo real) | FEITO |
| Materiais PDF pela API (com preço) | PENDENTE |
| Eventos pela API (com vagas) | EM ANDAMENTO |

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
- **Descrição:** Manter o site rápido depois que o conteúdo vier da API. Ao trazer imagens da API (bucket S3), autorizar o domínio em `images.remotePatterns` no `next.config.mjs`: as fotos usam `next/image` desde 13/10/2026 e recusam domínios não listados
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
| Identificar os itens pelo tipo e slug, não pelo nome | FEITO |
| Botão de compra da página de detalhe coloca o item no carrinho antes do checkout | FEITO |
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

**Status:** CONCLUÍDA · **Início:** 13/10/2026 · **Término:** 13/10/2026

| Tarefa | Status |
|---|---|
| Título e descrição próprios em cada página | FEITO |
| Imagem de compartilhamento e ícone do site | FEITO |
| Sitemap e robots (sem `/aluno` e `/checkout` nos buscadores) | FEITO |
| Dados estruturados de empresa, cursos e eventos para o Google | FEITO |

**Campos adicionais**
- **Descrição:** O site ser encontrado e bem exibido no Google e nas redes. Feito em 13/10/2026: título e descrição próprios em todas as páginas (`lib/seo.ts`, modelo " — Quad Concursos" no layout); ícone do site (símbolo "Q" do logo, `app/icon.svg` e `app/apple-icon.tsx`) e imagem de compartilhamento provisória (`app/opengraph-image.tsx`, trocar pela arte oficial quando houver); `robots.txt` e `sitemap.xml` (área do aluno, carrinho, checkout e links de senha/e-mail fora dos buscadores e com noindex); dados estruturados de empresa, turmas e eventos (`lib/dados-estruturados.ts`). Endereço do site em `NEXT_PUBLIC_SITE_URL`
- **Prioridade:** Alta
- **Depende de:** —

### Bloco 2 — PERFORMANCE E ACESSIBILIDADE

**Status:** CONCLUÍDA · **Término:** 13/10/2026

| Tarefa | Status |
|---|---|
| Fontes otimizadas | FEITO |
| Imagens otimizadas | FEITO |
| Acessibilidade: contraste, teclado e rótulos | FEITO |
| Medição de desempenho no celular | FEITO |

**Campos adicionais**
- **Descrição:** Site rápido e acessível para todos. Feito em 13/10/2026: fotos com `next/image` (442 KB → 12–29 KB); acessibilidade WCAG 2.1 AA sem falhas no axe (contraste corrigido, atalho "Pular para o conteúdo", menu pelo teclado, barra de avisos com pausa, títulos em ordem), com testes em `tests/e2e/acessibilidade.spec.ts`; Lighthouse no celular com 96–97 de desempenho e 100 em acessibilidade, boas práticas e SEO; LCP real de 1,7–2,0 s e checkout sem "pulo" (CLS 0,355 → 0,024). Detalhes em `docs/desempenho.md`
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

**Status:** EM ANDAMENTO

| Tarefa | Status |
|---|---|
| API aceitando chamadas só do domínio do site, com HTTPS | PENDENTE |
| Cabeçalhos de segurança no site | FEITO |
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

## Etapa 13 — REDESENHO DO SITE

> Novo visual entregue pela designer em 19/10/2026 (pasta `entrega-programador`). Feito na branch `redesign`, uma fase por bloco, com aprovação a cada fase.

### Bloco 1 — BASE VISUAL E HOME

**Status:** CONCLUÍDA

| Tarefa | Status |
|---|---|
| Cores, fontes e largura do novo visual | EM ANDAMENTO |
| Menu do topo novo (desktop e celular) | EM ANDAMENTO |
| Rodapé novo | EM ANDAMENTO |
| Botão flutuante do WhatsApp | EM ANDAMENTO |
| Home nova com carrossel de destaques | EM ANDAMENTO |

**Campos adicionais**
- **Prioridade:** Alta
- **Depende de:** —

### Bloco 2 — TURMAS PRESENCIAIS

**Status:** EM ANDAMENTO

| Tarefa | Status |
|---|---|
| Turmas por modalidade (RONDESP, PATAMO e BOPE) com filtros | EM ANDAMENTO |
| Página da turma no novo visual | PENDENTE |
| Lista de interessados (tela pronta, aguardando backend) | PENDENTE |

**Campos adicionais**
- **Prioridade:** Alta
- **Depende de:** Etapa 13, Bloco 1

### Bloco 3 — MATERIAIS E SIMULADOS

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Materiais com busca e filtro | PENDENTE |
| Página do material no novo visual | PENDENTE |
| Central de Simulados (presenciais, individuais e combos) | PENDENTE |

**Campos adicionais**
- **Prioridade:** Alta
- **Depende de:** Etapa 13, Bloco 1

### Bloco 4 — EVENTOS

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Agenda de eventos no novo visual | PENDENTE |
| Página do evento no novo visual | PENDENTE |

**Campos adicionais**
- **Prioridade:** Alta
- **Depende de:** Etapa 13, Bloco 1

### Bloco 5 — BLOG E PROFESSORES

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Blog com busca e categorias | PENDENTE |
| Página do artigo no novo visual | PENDENTE |
| Página do professor no novo visual | PENDENTE |

**Campos adicionais**
- **Prioridade:** Alta
- **Depende de:** Etapa 13, Bloco 1

### Bloco 6 — LOGIN E ÁREA DO ALUNO

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Entrar e cadastro em abas, com layout próprio | PENDENTE |
| Recuperação de senha e confirmação de e-mail no novo visual | PENDENTE |
| Área do aluno com layout próprio | PENDENTE |

**Campos adicionais**
- **Prioridade:** Alta
- **Depende de:** Etapa 13, Bloco 1

### Bloco 7 — CARRINHO E CHECKOUT

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Carrinho no novo visual | PENDENTE |
| Checkout no novo visual | PENDENTE |
| Telas de confirmação do pagamento no novo visual | PENDENTE |

**Campos adicionais**
- **Prioridade:** Alta
- **Depende de:** Etapa 13, Bloco 1

### Bloco 8 — LOJA E MENTORIAS

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Loja com produtos e variações | PENDENTE |
| Produto da loja com retirada ou frete por CEP (demonstrativo) | PENDENTE |
| Mentorias do Quad no lugar de Cursos online | PENDENTE |

**Campos adicionais**
- **Prioridade:** Alta
- **Depende de:** Etapa 13, Bloco 1

### Bloco 9 — PÁGINAS INSTITUCIONAIS NO NOVO VISUAL

**Status:** PENDENTE

| Tarefa | Status |
|---|---|
| Sobre, contato e aprovados | PENDENTE |
| Termos de uso e política de privacidade | PENDENTE |
| Páginas de não encontrada e de erro | PENDENTE |

**Campos adicionais**
- **Prioridade:** Alta
- **Depende de:** Etapa 13, Bloco 1

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
