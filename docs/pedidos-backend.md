# Pedidos para o backend — Site do Quad Concursos

**De:** time do site (Next.js) · **Atualizado em:** 23/10/2026
**Base:** testes na API local (`localhost:8080`) e leituras públicas da API de produção (`https://api.quadconcursos.com.br`).

Este documento lista **só o que ainda falta**. Os pedidos já atendidos saíram daqui e ficam no histórico do git (por exemplo: falhas de segurança 1.1 a 1.4, cadastro e perfil do aluno, esqueci a senha, aceite dos termos, login em cookie, carrinho no servidor, cupons, slug e nível da turma na vitrine, preços em centavos e lotes, vitrine de professores e chaves de sandbox do Pagar.me).

> **Banco compartilhado:** a API e o banco também atendem o **app Viver o Quad**. Toda mudança pedida aqui precisa considerar o impacto no app; os itens em que isso pesa estão marcados com ⚠️.

**Padrões que valem para tudo:**
- Manter o formato de erro atual (`status`, `title`, `detail`, `codigo`, `erros[]`). O site já lê esse formato.
- Rotas "do próprio usuário" pegam o id **da sessão**, nunca de um parâmetro enviado pelo cliente.
- Rotas públicas (sem login) só levam dados que qualquer pessoa pode ver, nunca dados de alunos.

## Resumo

| # | Pedido | Prioridade |
|---|---|---|
| 1.1 | CORS não aceita o cabeçalho `Idempotency-Key`: nenhum pagamento sai pelo site | **Urgente** |
| 1.2 | Produção: `CORS_ORIGENS` com o domínio do site e `COOKIES_DOMINIO` | Alta (antes do lançamento) |
| 1.3 | Autorizar o domínio do site na conta do Pagar.me | Alta (antes do lançamento) |
| 1.4 | Publicar a API e o site juntos (preços em centavos) | Alta (no lançamento) |
| 2.1 | Vitrine: edição e ano | Alta |
| 2.2 | Vitrine: cargo e órgão do concurso | Alta |
| 2.3 | Vitrine: horário e dias da turma | Alta |
| 2.4 | Vitrine: janelas do simulado | Média |
| 2.5 | Vitrine: espécie do evento (aulão ou evento) | Média |
| 2.6 | Vitrine: atividades gratuitas | Média |
| 3 | Professores: minibio, slug, credenciais, fotos e só os professores do site | Média |
| 4.1 | Verificação do celular por código ⚠️ | Alta |
| 4.2 | `emailVerificado` e `telefoneVerificado` no cadastro do aluno | Alta |
| 4.3 | Limite de tentativas no cadastro e no envio de código | Média |
| 4.4 | `GET /api/usuarios/eu` para conta sem cadastro de aluno | Baixa |
| 4.5 | Foto de perfil | Baixa |
| 5.1 | Material digital (PDF) | Média |
| 5.2 | Sumário e ficha técnica dos materiais | Baixa |
| 5.3 | Simulados: formatos de estudo e combos | Média |
| 5.4 | Textos de venda e professores dos eventos | Média |
| 6 | Sete perguntas que precisam de resposta | — |

---

## 1. Antes do lançamento

### 1.1 CORS não aceita o cabeçalho `Idempotency-Key` (urgente)

**O problema.** Para fechar o carrinho (`POST /api/loja/carrinho/eu/fechamento`), a API exige o cabeçalho `Idempotency-Key`. Ele evita cobrar duas vezes quando o aluno clica duas vezes em "Pagar". Antes de mandar esse pedido, o navegador pergunta à API quais cabeçalhos ela aceita (a pré-verificação `OPTIONS` do CORS), e a resposta é `Access-Control-Allow-Headers: content-type, x-quad-cliente`. Como o `Idempotency-Key` não está na lista, o navegador **bloqueia o fechamento antes de enviá-lo**.

**O efeito.** No teste de 23/10/2026, já com as chaves de sandbox, cartão aprovado, cartão recusado, PIX e boleto falharam no checkout com "Não foi possível concluir o pagamento". Nenhuma cobrança chegou a ser criada. Hoje **nenhum pagamento sai pelo site**.

**O pedido.** Incluir `Idempotency-Key` na lista `ACEITOS` de `ConfiguracaoDeCors.java`. A mesma lista atende `POST /api/loja/compras`, `AvisoController` e `LoteController`, que também exigem o cabeçalho.

**Como conferir:**
```
curl -i -X OPTIONS http://localhost:8080/api/loja/carrinho/eu/fechamento \
  -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,idempotency-key,x-quad-cliente"
```
A resposta deve trazer `idempotency-key` em `Access-Control-Allow-Headers`. Assim que estiver no ar, o site repete os quatro pagamentos no sandbox.

### 1.2 Produção: domínio do site no CORS e nos cookies

**O problema.** O código do login em cookie já está em produção, mas o site só funciona nela com duas configurações:
- **`CORS_ORIGENS`:** hoje a pré-verificação vinda de `https://quadconcursos.com.br` e de `https://www.quadconcursos.com.br` responde **403** (conferido em 23/10/2026). Sem isso, o navegador não deixa o site ler a vitrine nem fazer login.
- **`COOKIES_DOMINIO`:** os cookies da sessão (`quad_acesso`, `quad_renovacao`, `quad_sessao`) precisam valer no domínio do site. Sem isso, o aluno entra e "cai" logo em seguida.

**O pedido.** Configurar as duas variáveis em produção com os dois endereços do site, sem liberar qualquer origem.

**Como conferir:** a mesma pré-verificação do item 1.1, contra `https://api.quadconcursos.com.br`, com `Origin: https://quadconcursos.com.br`, deve responder 200 com essa origem em `Access-Control-Allow-Origin`.

### 1.3 Autorizar o domínio do site no Pagar.me

**O problema.** O site gera o token do cartão direto do navegador (`https://api.pagar.me/core/v5/tokens?appId={chavePublica}`), para que o número do cartão nunca passe pelo nosso servidor. O Pagar.me só aceita esse pedido vindo de domínios autorizados na conta.

**O pedido.** Autorizar `quadconcursos.com.br` e `www.quadconcursos.com.br` (e `localhost:3000`, para testes, se a conta permitir) no painel do Pagar.me. Isso fica na conta do Pagar.me, não no código.

### 1.4 Publicar a API e o site juntos

**O problema.** Desde 23/10/2026 os preços em reais vêm em **centavos** (vitrine e carrinho), e o site já foi adaptado. Se a API nova for ao ar antes do site novo, o site antigo leria `4500` como R$ 4.500 na Garrafa Quad de R$ 45. Se o site novo for antes da API nova, ele mostraria R$ 0,45.

**O pedido.** Combinar a publicação: API e site no mesmo momento.

---

## 2. Vitrine pública: o que o banco já tem e a rota pública não mostra

A vitrine (`/api/loja/vitrine/atividades` e `/api/loja/vitrine`) é a única fonte do site para turmas, eventos, simulados e produtos, porque o visitante não tem login. Desde 22/10/2026 ela traz o `slug` e o nível da turma, e o site já usa. Os campos abaixo já existem no banco (V115 a V119), mas não saem na vitrine. Até chegarem, o site tira parte deles do nome da turma, o que quebra se o nome for cadastrado fora do padrão.

### 2.1 Edição e ano

**Por que o site precisa.** O título da turma é a modalidade mais a edição ("RONDESP 2"). Além disso, a página da turma junta os turnos da mesma turma (Manhã, Tarde, Noite) pela modalidade, edição e concurso. Hoje a edição sai do nome cadastrado ("RONDESP 2 - Soldado PMBA - Manhã").

**O pedido.** `edicao` e `ano` na turma, no evento e no simulado.

### 2.2 Cargo e órgão do concurso

**Por que o site precisa.** A página `/turmas` separa as turmas em abas por cargo ("SD • PMBA", "CFO • PMBA", "IPC • PCBA"), e cada turma mostra esse selo. A vitrine traz só o `concursoId`, e `GET /api/concursos` exige login.

**O pedido.** `cargo` e `orgao` (o rótulo "SD/PMBA") junto da turma, do evento e do simulado. Uma rota pública de concursos (código, nome, cargo e órgão) também resolve.

### 2.3 Horário e dias da turma

**Por que o site precisa.** O aluno escolhe o turno pelo horário. Hoje o cartão e a página da turma mostram "Horário: A confirmar".

**O pedido.** `horarioInicial`, `horarioFim`, `horarioInicial2`, `horarioFim2` e `dias` (dias da semana) no detalhe da turma.

### 2.4 Janelas do simulado

**Por que o site precisa.** Um simulado pode acontecer em até dez dias (as janelas, V117), mas a vitrine ainda manda uma data só. A Central de Simulados mostraria só o primeiro dia.

**O pedido.** A lista de janelas (data, início e fim de cada uma) no detalhe do simulado.

### 2.5 Espécie do evento

**Por que o site precisa.** A agenda separa aulões de eventos (corujão, gincana, palestra). O banco já tem a espécie (V118), mas a vitrine não mostra.

**O pedido.** `especie` (AULAO ou EVENTO) no detalhe do evento.

### 2.6 Atividades gratuitas

**Por que o site precisa.** A vitrine só lista o que tem preço maior que zero. Um evento ou simulado gratuito não aparece no site, embora o site já saiba inscrever direto (`POST /api/inscricoes/eu`).

**O pedido.** Listar também as atividades gratuitas abertas a inscrição (com `preco: 0`), ou uma rota pública própria para elas.

---

## 3. Professores

`GET /api/professores/vitrine` e `/{id}` já são públicos, e o site usa (home, página do professor, sitemap e autor do blog). Faltam:

- **`minibio`** (2 ou 3 linhas) e, se possível, uma **bio completa**. Sem elas, o cartão e a página do professor ficam só com nome, matérias e graduação.
- **`slug`** (ex.: `danilo-moura`). Hoje o endereço é o nome seguido do id (`/professores/danilo-moura-6cb5e8ae-…`), que é feio de divulgar. O slug deve seguir a regra das turmas: nasce do nome e não muda.
- **`credenciais`** em lista (ex.: "Ex-policial militar da PM-BA"). A seção "Credenciais" mostra hoje só a graduação.
- **Fotos:** nenhum professor tem `fotoUrl` no banco local. O site usa a foto que já tinha do Danilo enquanto isso.
- **Só os professores do site:** "Danilo Mourão ribeiro" e "Davi" aparecem na vitrine local e parecem cadastros de teste. Em produção, a vitrine deve listar só os professores ativos que devem aparecer no site.

---

## 4. Conta do aluno

### 4.1 Verificação do celular por código ⚠️

**Por que o site precisa.** Decisão de 02/10/2026: o celular é o único dado obrigatório para liberar a conta; o e-mail é confirmado depois, por link (isso já funciona). As telas do site estão prontas: o passo 3 do cadastro e a troca de telefone em "Meu perfil" pedem o código. Enquanto as rotas não existem, o passo 3 deixa o aluno seguir sem verificar.

**Rotas:**
- **`POST /api/usuarios/eu/telefone/verificacao`**, corpo `{ "novoTelefone": "(75) 99999-0000" }`. Gera um código de 6 dígitos e envia por SMS ou WhatsApp **para o número novo**. Não troca o telefone ainda. Resposta: `{ "expiraEm": "...", "podeReenviarEm": "..." }`.
- **`POST /api/usuarios/eu/telefone/confirmacao`**, corpo `{ "codigo": "123456" }`. Código certo: grava o número novo.

**Regras:**
- O código vale 10 minutos, aceita até 5 tentativas erradas e só pode ser reenviado depois de 60 segundos.
- Erros (`codigo`): `CODIGO_INVALIDO`, `CODIGO_EXPIRADO`, `MUITAS_TENTATIVAS`, `REENVIO_MUITO_CEDO` e `TELEFONE_IGUAL_AO_ATUAL` (aceitar o mesmo número quando ele ainda não foi verificado, como no cadastro).
- Campo **`telefoneVerificado`** no usuário: começa `false` no cadastro e vira `true` na confirmação.
- **Conta não verificada:** o login funciona (para o aluno conseguir verificar), mas as demais rotas do aluno respondem **403** com `codigo: "CELULAR_NAO_VERIFICADO"`. Assim o site sabe que deve levar o aluno de volta à verificação.

**⚠️ App Viver o Quad:** o bloqueio não pode atingir as contas que já existem (hoje nenhuma tem o celular verificado), senão todos os alunos do app ficam bloqueados. Sugestão: marcar `telefoneVerificado = true` nas contas existentes, ou bloquear só as contas criadas depois da mudança.

**A decidir:** qual serviço envia o SMS ou WhatsApp, e se o mesmo número pode estar em duas contas (`TELEFONE_EM_USO`).

### 4.2 `emailVerificado` e `telefoneVerificado` no cadastro do aluno

**Por que o site precisa.** O site lê o aluno em `GET /api/alunos/eu`. Com esses dois campos, ele sabe quando mostrar o alerta "confirme seu e-mail" em "Meu perfil" e quando levar o aluno à verificação do celular (item 4.1).

**O pedido.** Incluir os dois booleanos na resposta de `GET /api/alunos/eu`.

### 4.3 Limite de tentativas

**Por que o site precisa.** O login (5 erros por e-mail) e o cupom já têm limite. O cadastro (`POST /api/alunos`), a consulta de disponibilidade (`POST /api/usuarios/disponibilidade`) e o envio de código (item 4.1) não têm. Sem limite, um robô pode criar contas em massa, descobrir quais e-mails e CPFs estão cadastrados ou disparar SMS sem parar (e cada SMS custa).

**O pedido.** Limite por IP e por conta nessas três rotas, respondendo 429 com o tempo de espera.

### 4.4 `GET /api/usuarios/eu` para conta sem cadastro de aluno (prioridade baixa)

**Por que o site precisa.** Com o login em cookie, o site não lê mais o token. Ele pega o id e os dados da conta em `GET /api/alunos/eu`, que responde **409** para professor e administrador. Nesse caso, o site mostra só "Minha conta", sem nome nem e-mail.

**O pedido.** `GET /api/usuarios/eu` para qualquer conta logada, com `{ id, nome, email, telefone, papeis }`. Só afeta quem da equipe entrar no site com a própria conta.

### 4.5 Foto de perfil (prioridade baixa)

**O pedido.** `POST /api/usuarios/eu/foto` (multipart), só JPG e PNG, até 2 MB, guardada no S3. A URL passa a vir em `GET /api/alunos/eu` (`fotoUrl`).

---

## 5. Produtos que a API ainda não cobre

### 5.1 Material digital (PDF)

**O problema.** Não existe tipo de item para o material em PDF. Hoje todo material entra como impresso (`MODULOS`, retirada no Quad), e a opção "Digital" do site fica sem venda.

**O pedido.** Um tipo de item digital vendido em reais, com o arquivo liberado em "Meus materiais" (`GET /api/materiais/eu`) depois do pagamento. Hoje o item digital só se vende em Quad Coins.

### 5.2 Sumário e ficha técnica dos materiais

**O problema.** O item só tem `descricao`. A página do material tem espaço para o sumário (capítulos) e a ficha (páginas, edição, banca), e esconde essas partes enquanto não vêm.

**O pedido.** Campos para o sumário (lista de capítulos) e a ficha técnica. O formato sugerido está em [contrato-api-conteudo.md](contrato-api-conteudo.md), seção 3.

### 5.3 Simulados: formatos de estudo e combos

**O problema.** A Central de Simulados do site vende cada edição em formatos de estudo (presencial, PDF, plataforma, impresso) e em combos de várias edições. A API só tem o simulado presencial.

**O pedido.** Os formatos de cada edição, com preço e vagas, e os combos.

### 5.4 Textos de venda e professores dos eventos

**O problema.** A vitrine traz a descrição da turma, mas não os textos de venda (o que está incluso, a programação do evento) nem os professores de cada evento. As páginas escondem essas seções.

**O pedido.** Os campos descritos em [contrato-api-conteudo.md](contrato-api-conteudo.md). A grade de professores **da turma** não é necessária: a decisão de 21/10/2026 foi não mostrar.

---

## 6. Perguntas que precisam de resposta

1. **Carrinho sem login:** o visitante monta o carrinho sem conta, e o site manda os itens ao carrinho do servidor só depois do login. Está certo assim, ou o carrinho do servidor deveria aceitar visitante?
2. **Variações:** além da camisa (tamanhos), quais itens vão ter variação?
3. **Parcelas:** `GET /api/loja/pagamentos/configuracao` traz até 12 parcelas e `cartoesMaximos: 2`. Há juros? A partir de quantas parcelas, e quem paga (aluno ou Quad)? `cartoesMaximos` quer dizer que o aluno pode dividir a compra em dois cartões?
4. **Situações do pagamento:** qual a lista completa de situações do fechamento (paga, aguardando, recusada, expirada, estornada…)? O site trata hoje PAGA, AGUARDANDO e RECUSADA.
5. **E-mails da compra:** compra confirmada, boleto gerado e acesso liberado já existem ou precisam ser criados?
6. **Materiais diários:** os "materiais diários" das turmas são os de `/api/materiais` (por turma, matéria e tópico)? E falta um armazenamento de arquivos no ambiente local (bucket de teste ou MinIO) para testar o download, que hoje responde 503 "nenhum bucket foi configurado".
7. **Conteúdo institucional:** aprovados, depoimentos em vídeo e blog vão vir da API ou de um sistema de conteúdo à parte?

---

## Contas e dados de teste na API local

Criados durante os testes do site; podem ser apagados:
- `teste.claude.1790858155@exemplo.com` · senha `senha12345` (conta A)
- `teste.claude.b.1790949238109@exemplo.com` · senha `senha12345` (conta B)
- `teste.claude.c.1790962937953@exemplo.com` · senha `senha12345` (conta C)
- Conta "Teste Dup" (`dup.<número>@exemplo.com` · senha `senha12345`), com o mesmo CPF da conta C
- Matrículas (05/10/2026): conta B na turma C.O.R.E. e conta A na turma Regular Tarde, ambas com origem SECRETARIA
- Evento "Evento de teste (Claude)" (gratuito, online, 20/11/2026, professor Danilo Moura), com a inscrição da conta B
- Materiais (05/10/2026): concurso "TESTE-CLAUDE" com o tópico "Atos administrativos"; na Regular Tarde, um vídeo e um resumo em PDF (sem arquivo); na C.O.R.E., uma lista em PDF (sem arquivo)
- Compras em reais da conta A (05/10/2026): turma Regular Tarde no cartão (paga, 3x, Visa final 4242) e "Apostila de teste (Claude)" no PIX (aguardando pagamento), com as cobranças correspondentes
- Conta B: 20 Quad Coins creditados, personagem escolhido e a compra da "Boina exclusiva" (paga com as moedas)
- Seed de desenvolvimento do backend (19/10/2026, `seeds/seed.sh`): administrador `admin@quad.local`, professores, salas, matérias e alunos `@quad.local`, todos com a senha `Quad@2026`
- Turmas à venda:
  - "Turma de teste (site)" (19/10/2026): de 03/11/2026 a 26/02/2027, no Auditório, 40 vagas
  - "RONDESP 2 - Soldado PMBA - Manhã" (Auditório) e "- Noite" (Sala 101, começa uma semana depois), modalidade NIVELAMENTO, R$ 1.197, 40 vagas cada
  - "INVESTIGADOR 1 - IPC PCBA - Noite" (Sala 102), modalidade TODOS, R$ 1.497, 25 vagas
- Um produto de cada área (20/10/2026):
  - Evento "Aulão de Véspera": presencial em 14/11/2026, das 14h às 19h, no Auditório, R$ 30, 60 vagas
  - Simulado "Simulado 77 — Soldado PMBA": presencial em 07/11/2026, das 8h às 12h30, no Auditório, R$ 25, 60 vagas
  - Materiais impressos (`MODULOS`): Direito Constitucional R$ 50, Direito Penal Militar R$ 45, Português para PM R$ 40, Raciocínio Lógico R$ 35, Legislação PM-BA R$ 45 e Kit Completo CFP R$ 150
  - Loja (`OUTROS`): Camisa Quad R$ 60 (P, M, G e GG), Caneca Quad R$ 35 e Garrafa Quad R$ 45
