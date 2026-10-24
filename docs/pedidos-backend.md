# Pedidos para o backend — Site do Quad Concursos

**De:** time do site (Next.js) · **Atualizado em:** 23/10/2026
**Base:** testes na API local (`localhost:8080`) e leituras públicas da API de produção (`https://api.quadconcursos.com.br`).

Este documento lista **só o que ainda falta**. Os pedidos já atendidos saíram daqui e ficam no histórico do git (por exemplo: CORS do `Idempotency-Key`, falhas de segurança, cadastro e perfil do aluno, esqueci a senha, aceite dos termos, login em cookie, carrinho no servidor, cupons, slug e nível da turma na vitrine, preços em centavos e lotes, vitrine de professores e chaves de sandbox do Pagar.me).

> **Banco compartilhado:** a API e o banco também atendem o **app Viver o Quad**. Toda mudança pedida aqui precisa considerar o impacto no app; os itens em que isso pesa estão marcados com ⚠️.

**Padrões que valem para tudo:**
- Manter o formato de erro atual (`status`, `title`, `detail`, `codigo`, `erros[]`). O site já lê esse formato.
- Rotas "do próprio usuário" pegam o id **da sessão**, nunca de um parâmetro enviado pelo cliente.
- Rotas públicas (sem login) só levam dados que qualquer pessoa pode ver, nunca dados de alunos.

## Resumo

| # | Pedido | Prioridade |
|---|---|---|
| 1.2 | Produção: `CORS_ORIGENS` com o domínio do site e `COOKIES_DOMINIO` | Alta (antes do lançamento) |
| 1.3 | Autorizar o domínio do site na conta do Pagar.me | Alta (antes do lançamento) |
| 1.4 | Publicar a API e o site juntos (preços em centavos) | Alta (no lançamento) |
| 2.6 | Vitrine: atividades gratuitas | Média |
| 2.7 | Vitrine: a lista de lotes (preço cheio e vagas de cada lote) | Alta |
| 3 | Professores: fotos e só os professores do site | Média |
| 4.1 | Verificação do celular por código ⚠️ | Alta |
| 4.2 | `emailVerificado` e `telefoneVerificado` no cadastro do aluno | Alta |
| 4.3 | Limite de tentativas no cadastro e no envio de código | Média |
| 4.4 | `GET /api/usuarios/eu` para conta sem cadastro de aluno | Baixa |
| 4.5 | Foto de perfil | Baixa |
| 5.1 | Material digital (PDF) | Média |
| 5.3 | Simulados: formatos de estudo e combos | Média |
| 5.4 | Textos de venda da turma e programação do evento | Média |
| 6 | Sete perguntas que precisam de resposta | — |

---

## 1. Antes do lançamento

### 1.2 Produção: domínio do site no CORS e nos cookies

**O problema.** O código do login em cookie já está em produção, mas o site só funciona nela com duas configurações:
- **`CORS_ORIGENS`:** hoje a pré-verificação vinda de `https://quadconcursos.com.br` e de `https://www.quadconcursos.com.br` responde **403** (conferido em 23/10/2026). Sem isso, o navegador não deixa o site ler a vitrine nem fazer login.
- **`COOKIES_DOMINIO`:** os cookies da sessão (`quad_acesso`, `quad_renovacao`, `quad_sessao`) precisam valer no domínio do site. Sem isso, o aluno entra e "cai" logo em seguida.

**O pedido.** Configurar as duas variáveis em produção com os dois endereços do site, sem liberar qualquer origem.

**Como conferir:**
```
curl -i -X OPTIONS https://api.quadconcursos.com.br/api/loja/carrinho/eu/fechamento   -H "Origin: https://quadconcursos.com.br" -H "Access-Control-Request-Method: POST"   -H "Access-Control-Request-Headers: content-type,idempotency-key,x-quad-cliente"
```
Deve responder 200, com essa origem em `Access-Control-Allow-Origin` e `idempotency-key` em `Access-Control-Allow-Headers`.

### 1.3 Autorizar o domínio do site no Pagar.me

**O problema.** O site gera o token do cartão direto do navegador (`https://api.pagar.me/core/v5/tokens?appId={chavePublica}`), para que o número do cartão nunca passe pelo nosso servidor. O Pagar.me só aceita esse pedido vindo de domínios autorizados na conta.

**O pedido.** Autorizar `quadconcursos.com.br` e `www.quadconcursos.com.br` (e `localhost:3000`, para testes, se a conta permitir) no painel do Pagar.me. Isso fica na conta do Pagar.me, não no código.

### 1.4 Publicar a API e o site juntos

**O problema.** Desde 23/10/2026 os preços em reais vêm em **centavos** (vitrine e carrinho), e o site já foi adaptado. Se a API nova for ao ar antes do site novo, o site antigo leria `4500` como R$ 4.500 na Garrafa Quad de R$ 45. Se o site novo for antes da API nova, ele mostraria R$ 0,45.

**O pedido.** Combinar a publicação: API e site no mesmo momento.

---

## 2. Vitrine pública

A vitrine (`/api/loja/vitrine/atividades` e `/api/loja/vitrine`) é a única fonte do site para turmas, eventos, simulados e produtos, porque o visitante não tem login. Em 23/10/2026 ela ficou completa ("vitrine completa", PR #119), e o site já usa: modalidade, edição e ano, concurso (`rotulo` "SD/PMBA"), sala, horários e dias da turma, espécie, resumo e professores do evento, e janelas do simulado. As atividades antigas, sem edição ou concurso, ainda completam pelo nome. Falta:

### 2.6 Atividades gratuitas

**Por que o site precisa.** A vitrine só lista o que tem preço maior que zero. Um evento ou simulado gratuito não aparece no site, embora o site já saiba inscrever direto (`POST /api/inscricoes/eu`).

**O pedido.** Listar também as atividades gratuitas abertas a inscrição (com `preco: 0`), ou uma rota pública própria para elas.

### 2.7 A lista de lotes na vitrine

**Por que o site precisa.** A regra é que o último lote é o preço cheio e os anteriores são promoção (decisão de 24/10/2026). O site quer mostrar duas coisas que dependem de todos os lotes, e não só do vigente:
- **O preço promocional:** "De ~~R$ 1.197~~ por R$ 997", na página e no cartão da turma (e depois em eventos, simulados e loja). O preço cheio é o do último lote.
- **As vagas de cada lote** dentro das vagas totais, para dar urgência: uma barra dividida em "1º lote (esgotado) · 2º lote: R$ 997, restam 12 · Lote final: R$ 1.197, 15 vagas".

A vitrine manda só o lote **vigente** (`ordem`, `rotulo`, `preco`, `quantidade`, `restantesNoLote`, `total`). Com ele, o site já mostra a parte do lote atual e soma o resto num bloco só ("próximos lotes: 25 vagas"), mas não sabe o preço do último lote nem como as vagas se dividem entre os próximos.

**O pedido.** Acrescentar à vitrine (turma, evento, simulado e item) a lista de lotes em reais, na ordem em que se vendem:

```
lotes: [
  { ordem: 1, rotulo: "1º lote",    preco: 79700,  quantidade: 10, restantes: 0  },
  { ordem: 2, rotulo: "2º lote",    preco: 99700,  quantidade: 15, restantes: 12 },
  { ordem: 3, rotulo: "Lote final", preco: 119700, quantidade: 15, restantes: 15 }
]
```

Os preços em centavos, como o resto da vitrine. O `lote` vigente pode continuar como está. Se for mais simples, um campo `precoCheio` no `lote` vigente resolve só o preço riscado (o site já lê `lote.precoCheio`), mas não as vagas de cada lote.

---

## 3. Professores

`GET /api/professores/vitrine`, `/{id}` e `/slug/{slug}` já são públicos (o slug desde 23/10/2026, e o endereço do site é `/professores/danilo-moura`), e o site usa (home, página do professor, sitemap e autor do blog). A **minibio** é a coluna `graduacao` (decisão de 23/10/2026): o texto cadastrado ali aparece abaixo do nome do professor e no cartão da home, então o campo deve ser preenchido como uma apresentação curta (2 ou 3 linhas, até os 200 caracteres que a coluna aceita), não só o nome do curso. Faltam:

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

### 5.3 Simulados: formatos de estudo e combos

**O problema.** A Central de Simulados do site vende cada edição em formatos de estudo (presencial, PDF, plataforma, impresso) e em combos de várias edições. A API só tem o simulado presencial.

**O pedido.** Os formatos de cada edição, com preço e vagas, e os combos.

### 5.4 Textos de venda da turma e programação do evento

**O problema.** A vitrine traz a descrição da turma e, desde 23/10/2026, o resumo e os professores de cada evento (o site já mostra "Quem conduz", com link para a página do professor). Ainda faltam o que está incluso na turma e a programação do evento (horário, título e descrição de cada parte). As páginas escondem essas seções.

**O pedido.** Os campos descritos em [contrato-api-conteudo.md](contrato-api-conteudo.md). A grade de professores **da turma** não é necessária: a decisão de 21/10/2026 foi não mostrar.

---

## 6. Perguntas que precisam de resposta

1. **Carrinho sem login:** o visitante monta o carrinho sem conta, e o site manda os itens ao carrinho do servidor só depois do login. Está certo assim, ou o carrinho do servidor deveria aceitar visitante?
2. **Variações:** além da camisa (tamanhos), quais itens vão ter variação?
3. **Parcelas:** `GET /api/loja/pagamentos/configuracao` traz até 12 parcelas. Há juros? A partir de quantas parcelas, e quem paga (aluno ou Quad)? (A compra em **dois cartões** já está no site desde 23/10/2026, pela lista `pagamento.cartoes`; o site **não oferece mais boleto**.)
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
- Professores reais (24/10/2026): os 27 da vitrine de produção (nome, graduação e matérias), com os turnos da planilha da coordenação, copiados para o banco local com contas fictícias (`prof.<nome>@exemplo.com`, senha `Quad@2026`, CPF gerado). Foram criadas as matérias que faltavam. Os professores de teste Ana Souza, Danilo Moura e Danilo Mourão ribeiro foram desativados (o "Evento de teste (Claude)" passou para o Danilo Ribeiro Moura). ⚠️ **Possível erro na API:** desativar a conta do professor de teste "Davi" (`DELETE /api/usuarios/{id}`) responde 409 `CPF_JA_CADASTRADO`, o que não faz sentido numa desativação; ele continua aparecendo na vitrine local
- Minibio de teste (23/10/2026): a graduação dos cinco professores da vitrine local virou um texto começando com "[TESTE]", para ver a minibio no site. Trocar pelo texto real no cadastro
- Pagamentos no sandbox do Pagar.me (23/10/2026), conta A, Caneca Quad R$ 35: um PIX aguardando, um cartão aprovado, dois cartões aprovados (R$ 20 + R$ 15) e um cartão `4000 0000 0000 0028`, que o sandbox também aprovou: a conta usa o **simulador PSP**, em que cartão válido com CVV `123` aprova, CVV começando com `6` é recusado pelo emissor e CPF `111.111.111-11` é recusado pelo antifraude. Recusas testadas com CVV `612`: um cartão (RECUSADA, código 9109) e dois cartões com o segundo recusado (o primeiro foi estornado)
- Seed de desenvolvimento do backend (19/10/2026, `seeds/seed.sh`): administrador `admin@quad.local`, professores, salas, matérias e alunos `@quad.local`, todos com a senha `Quad@2026`
- Turmas à venda:
  - "Turma de teste (site)" (19/10/2026): de 03/11/2026 a 26/02/2027, no Auditório, 40 vagas
  - "Rondesp Manhã" (Auditório) e "Rondesp Noite" (Sala 101, começa uma semana depois), modalidade Rondesp, concurso SD-PMBA, R$ 1.197, 40 vagas cada: o banco deu os números 1 e 2 (23/10/2026). Substituem as "RONDESP 2 - Soldado PMBA - Manhã/Noite" de 21/10, criadas antes da numeração automática e desativadas (DELETE; dá para reativar)
  - "Rondesp Tarde" (Auditório, 14h às 17h, de 23/11/2026 a 23/02/2027), modalidade Rondesp, concurso SD-PMBA, dois lotes: o banco deu o número 3 (24/10/2026). Para simular a virada de lote, o 1º lote passou a ter 2 vagas (R$ 997) e o final 38 (R$ 1.197), e as contas A e B compraram com o cartão de teste do sandbox (PAGA): o 1º lote esgotou e a turma virou sozinha para o lote final. Um PIX de R$ 997 da conta A foi recusado pelo sandbox (`failed`), enquanto o PIX de R$ 35 da caneca tinha passado: vale o backend conferir se é regra do simulador PSP para o valor
  - "INVESTIGADOR 1 - IPC PCBA - Noite" (Sala 102), modalidade TODOS, R$ 1.497, 25 vagas
  - Concurso "SD-PMBA" (cargo SD, órgão PMBA) e as turmas "Patamo Manhã" (Sala 101, 1º lote R$ 997 + lote final R$ 1.197) e "Patamo Noite" (Sala 101, R$ 1.197), de 01/03 a 30/06/2027 (23/10/2026). Criadas pelo cadastro novo: o banco deu os números 1 e 2 (cada turma o seu número, sem repetir entre turnos), e o site mostra PATAMO 1 e PATAMO 2
- Um produto de cada área (20/10/2026):
  - Evento "Aulão de Véspera": presencial em 14/11/2026, das 14h às 19h, no Auditório, R$ 30, 60 vagas
  - Simulado "Simulado 77 — Soldado PMBA": presencial em 07/11/2026, das 8h às 12h30, no Auditório, R$ 25, 60 vagas
  - Materiais impressos (`MODULOS`): Direito Constitucional R$ 50, Direito Penal Militar R$ 45, Português para PM R$ 40, Raciocínio Lógico R$ 35, Legislação PM-BA R$ 45 e Kit Completo CFP R$ 150
  - Loja (`OUTROS`): Camisa Quad R$ 60 (P, M, G e GG), Caneca Quad R$ 35 e Garrafa Quad R$ 45
