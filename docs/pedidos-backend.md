# Pedidos para o backend — Site do Quad Concursos

**De:** time do site (Next.js) · **Data:** 02/10/2026
**Base:** testes feitos na API local (`localhost:8080`) e comparação com a spec publicada (`https://api.quadconcursos.com.br/v3/api-docs`). As rotas citadas existem nas duas.

## Resumo

| # | Pedido | Tipo | Prioridade |
|---|---|---|---|
**| 1.1 | Aluno lê e **altera** o endereço de outro aluno | ✅ **Resolvido** (conferido em 03/10/2026: agora responde 403) | — |**
| 1.2 | `PATCH /api/usuarios/{id}` permite trocar telefone sem verificação | Corrigir regra | **Crítica** |
| 1.3 | Confirmar que listas (matrículas, inscrições, compras) só trazem dados do próprio aluno | Confirmar | **Crítica** |
**| 1.4 | Cadastro aceita CPF que já pertence a outra conta | ✅ **Resolvido** (conferido em 03/10/2026: 409 `CPF_JA_CADASTRADO`) | — |**
**| 2.1 | Ler o próprio cadastro | ✅ **Resolvido** via `GET /api/alunos/eu` (CPF desde 03/10/2026). Falta só `emailVerificado`/`telefoneVerificado` (item 2.6) | — |**
| 2.2 | `PATCH /api/usuarios/eu` (só nome) | Criar | Alta |
| 2.3 | `GET`/`PATCH /api/enderecos/eu` | Opcional (a falha do item 1.1 já foi corrigida) | Baixa |
| 2.4 | Esqueci minha senha | Criar | Alta |
| 2.5 | Verificação de telefone por código (perfil) | Criar | Alta |
| 2.6 | Verificação no cadastro: celular obrigatório, e-mail por link depois | Criar | Alta |
| 2.7 | Registrar o aceite dos termos no cadastro | Criar | Alta |
| 3 | Catálogo público (turmas, eventos, materiais, professores) sem login | Criar / ampliar | Alta |
| 4 | Rotas "minhas" da área do aluno | Confirmar / criar | Alta |
| 5.1 | Compra com vários itens num único pagamento | Decidir e criar | Alta |
| 5.2 | Cupons de desconto | Criar | Alta |
| 5.3–5.7 | Detalhes da compra (valores em reais, parcelas, chave pública, situação, inscrição gratuita) | Confirmar | Alta |
| 6.1 | CORS com o domínio do site | Configurar | Alta (antes do lançamento) |
| 6.2 | Swagger anunciando `https` | Configurar | Média |
| 6.3 | Limite de tentativas no login e no cadastro | Criar | Média |
**| 2.9 | Consultar se e-mail, CPF e telefone já estão cadastrados (antes do endereço) | ✅ **Resolvido** via `POST /api/usuarios/disponibilidade` (o site já usa). Falta o limite de tentativas (item 6.3) | — |
| 2.8 | Foto de perfil | Criar | Baixa |

**Padrões que valem para tudo:**
- Manter o formato de erro atual (`status`, `title`, `detail`, `codigo`, `erros[]`). O site já lê esse formato.
- Rotas "do próprio usuário" devem pegar o id **do token**, nunca de um parâmetro enviado pelo cliente.

---

## 1. Segurança (corrigir antes de qualquer outra coisa)

### 1.1 Um aluno consegue ler e alterar o endereço de outro aluno

**Rotas afetadas:**
- `GET /api/enderecos/usuario/{usuarioId}`
- `GET /api/enderecos/{id}`
- `PATCH /api/enderecos/{id}`

**Como reproduzir** (testado na API local em 02/10/2026):
1. Crie duas contas de aluno, A e B.
2. Logado como **B**, chame `GET /api/enderecos/usuario/{id do usuário A}` → **200**, com o endereço completo de A.
3. Logado como **B**, chame `PATCH /api/enderecos/{id do endereço de A}` com `complemento: "ALTERADO PELA CONTA B"` → **200**, e o endereço de A foi alterado.

**Comportamento esperado:** quando quem chama é um aluno e o endereço não é dele, responder **403**. Administrador continua com acesso total.

**Correção sugerida:** criar o item 2.3 (`/api/enderecos/eu`) e, nas rotas por id, comparar o dono do endereço com o `sub` do token quando o papel for `ALUNO`.

**Por que é crítico:** endereço residencial é dado pessoal (LGPD). O id ser um UUID difícil de adivinhar não protege, porque ids aparecem em outras respostas da API.

### 1.2 Telefone pode ser trocado sem verificação

`PATCH /api/usuarios/{id}` aceita `telefone`. A regra do negócio é que **cada troca de telefone exige confirmação por código** (item 2.5). Se o aluno puder chamar essa rota, ele troca o telefone direto pela API, sem passar pela verificação.

**Esperado:** para o papel `ALUNO`, recusar (400) qualquer tentativa de alterar `telefone`, `email` ou `cpf` por essa rota ou pela `/eu`. Telefone só muda pelo fluxo de verificação.

### 1.3 Confirmar que as listas só devolvem os dados do próprio aluno

Com token de aluno, estas rotas respondem **200**:
- `GET /api/matriculas`
- `GET /api/inscricoes`
- `GET /api/loja/compras`

Como o banco de teste estava vazio, não foi possível confirmar se elas devolvem **só os registros do aluno logado** ou os de todos.

**Esperado:** para `ALUNO`, cada uma traz apenas os registros dele.

**Vale também revisar** toda rota que recebe id na URL, com a mesma pergunta do item 1.1: "um aluno acessa o dado de outro trocando o id?".

---

### 1.4 Cadastro aceita CPF duplicado

**Como reproduzir** (API local, 02/10/2026): `POST /api/alunos` com um CPF que já pertence a outra conta, mas com e-mail e telefone diferentes → **201**, e a conta é criada. E-mail e telefone repetidos são recusados corretamente (**409** `EMAIL_JA_CADASTRADO` e `TELEFONE_JA_CADASTRADO`).

**Esperado:** recusar com **409** e `codigo: "CPF_JA_CADASTRADO"`, no mesmo formato dos outros dois. Comparar só os números (ignorar pontos e traço). Revisar se já existem CPFs duplicados no banco.

O site já está preparado para esse código: volta o aluno ao passo 1 com a mensagem "Já existe uma conta com este CPF".

---

## 2. Conta do aluno

### 2.1 Ler o próprio cadastro — feito via `GET /api/alunos/eu`, falta o CPF

**Entregue em 02/10/2026:** `GET /api/alunos/eu` (`MeuPerfilResponse`) passou a trazer `nomeCompleto`, `email` e `telefone`. O site já usa essa rota: barra lateral, menu e Perfil mostram os dados reais, e o site deixou de chamar `GET /api/usuarios/{id}` para aluno.

**Falta, na mesma rota:**
- **`cpf`.** A regra do negócio é que o aluno **vê** todos os seus dados, inclusive o CPF; ele só não pode **editar**. Hoje o Perfil mostra "—".
- **`emailVerificado` e `telefoneVerificado`** (itens 2.5 e 2.6), para o site saber quando mostrar o alerta de e-mail e quando levar o aluno à verificação do celular.

### 2.2 `PATCH /api/usuarios/eu` — editar o próprio cadastro

- **Corpo:** `{ "nome": "..." }`. **Só o nome.**
- **Recusar:** `telefone` (vai pelo item 2.5), `email` e `cpf` (não editáveis pelo aluno).
- **Resposta:** `UsuarioResponse` atualizado.

### 2.3 `GET /api/enderecos/eu` e `PATCH /api/enderecos/eu`

Mesmo formato das rotas atuais (`EnderecoResponse` e `AtualizarEnderecoRequest`), mas pegando o usuário do token. Hoje o site usa `/api/enderecos/usuario/{id}` e `PATCH /api/enderecos/{id}`; quando as rotas `/eu` existirem, o site passa a usá-las.

### 2.4 Esqueci minha senha

**Situação hoje:** não existe rota. O link já está na tela de login.

**Pedido:**
1. `POST /auth/senha/esqueci` com `{ "email": "..." }`.
   - Responde **202 sempre**, mesmo se o e-mail não existir, para não revelar quais e-mails têm conta.
   - Se existir, envia um e-mail com um link `https://<domínio do site>/redefinir-senha?token=...`.
   - Token de uso único, válido por 1 hora.
2. `POST /auth/senha/redefinir` com `{ "token": "...", "novaSenha": "..." }`.
   - Mesma regra de senha do cadastro (8 a 72 caracteres).
   - Erros com `codigo`: `TOKEN_INVALIDO`, `TOKEN_EXPIRADO`.
   - Depois de redefinir, encerrar as sessões abertas dessa conta.

**A combinar:** domínio do link e remetente do e-mail.

### 2.5 Verificação de telefone (perfil)

**Ordem obrigatória:**
1. O aluno digita o número novo.
2. O código é enviado **para o número novo**.
3. O aluno digita o código.
4. Só então o telefone é trocado. Até a confirmação, o número atual continua valendo.

**Rotas:**

**a) `POST /api/usuarios/eu/telefone/verificacao`**, corpo `{ "novoTelefone": "(75) 99999-0000" }`
- Gera o código (6 dígitos) e envia por SMS ou WhatsApp para o número novo.
- Guarda no banco: número pendente, código (com hash), validade (10 min) e tentativas.
- **Não altera** o telefone ainda.
- **Resposta:** `{ "expiraEm": "...", "podeReenviarEm": "..." }`.

**b) `POST /api/usuarios/eu/telefone/confirmacao`**, corpo `{ "codigo": "123456" }`
- Código válido → grava o número novo e devolve `UsuarioResponse`.

**Regras:**
- Até 5 tentativas erradas por código.
- Reenvio só depois de 60 segundos.
- Código expira em 10 minutos.

**Erros (`codigo`):**
- `CODIGO_INVALIDO`
- `CODIGO_EXPIRADO`
- `MUITAS_TENTATIVAS`
- `REENVIO_MUITO_CEDO`
- `TELEFONE_IGUAL_AO_ATUAL` (exceto quando o telefone atual ainda não foi verificado, como no cadastro — item 2.6)
- `TELEFONE_EM_USO` (se a regra for não permitir o mesmo número em duas contas — **a decidir**)

**A decidir:** qual serviço envia o SMS ou WhatsApp.

### 2.6 Verificação no cadastro: celular obrigatório, e-mail depois

**Decisão (02/10/2026):**
- **Só o celular é obrigatório** para liberar a conta.
- O **e-mail** é confirmado depois, por link. Enquanto não for confirmado, o site mostra um alerta em "Meu perfil".

**a) Celular — obrigatório, no passo 3 do cadastro**

**Fluxo no site** (a tela já está pronta):
1. O aluno cria a conta (`POST /api/alunos`).
2. O site faz o login automático.
3. O site chama **as mesmas rotas do item 2.5**, com o telefone digitado no cadastro:
   - `POST /api/usuarios/eu/telefone/verificacao` com `{ "novoTelefone": "<telefone do cadastro>" }`
   - `POST /api/usuarios/eu/telefone/confirmacao` com `{ "codigo": "123456" }`
4. "Corrigir número" e "Reenviar código" usam as mesmas rotas.

**O que o backend precisa:**
- **Campo `telefoneVerificado`** (boolean) no usuário. Começa `false` no cadastro e vira `true` na confirmação.
- **Mesmo número permitido:** aceitar `novoTelefone` igual ao telefone atual quando ele ainda não foi verificado.
- **Conta não verificada bloqueada:** enquanto `telefoneVerificado = false`, o login funciona (para o aluno conseguir verificar), mas as demais rotas do aluno respondem **403** com `codigo: "CELULAR_NAO_VERIFICADO"`. As únicas liberadas são as de verificação e o `GET /api/usuarios/eu`. Assim o site sabe que deve levar o aluno de volta à tela de verificação.
- **Dado no cadastro do usuário:** incluir `telefoneVerificado` no `UsuarioResponse` (item 2.1).

> **Provisório no site:** enquanto essas rotas responderem 404, o passo 3 deixa o aluno continuar sem verificar. Quando o backend existir, isso é removido.

**b) E-mail — confirmado depois, por link**

1. Logo após o cadastro, enviar um e-mail com o link `https://<domínio do site>/confirmar-email?token=...`.
   - Token de uso único, com validade de 7 dias.
2. **`POST /auth/email/confirmar`**, rota **pública**, corpo `{ "token": "..." }`.
   - Marca o e-mail como verificado.
   - Erros: `TOKEN_INVALIDO`, `TOKEN_EXPIRADO`.
3. **`POST /api/usuarios/eu/email/verificacao`**, sem corpo: reenvia o e-mail com um link novo.
   - Respeitar um tempo mínimo entre reenvios.
   - Erro `REENVIO_MUITO_CEDO`.
4. **Campo `emailVerificado`** (boolean) no `UsuarioResponse` (item 2.1). O alerta do perfil aparece quando ele for `false`.

As telas já estão prontas: o alerta com "Reenviar e-mail de confirmação" e a página `/confirmar-email`, que confirma com um clique para o link não ser gasto por pré-visualizações de e-mail.

### 2.7 Registrar o aceite dos termos no cadastro

O cadastro do site exige marcar "Li e aceito os Termos de uso e a Política de privacidade" e **já envia** no `POST /api/alunos` (desde 03/10/2026):

```json
{ "aceiteTermos": true, "versaoDosTermos": "2026-10-03" }
```

Hoje a API ignora esses campos.

**Pedido:**
- **Recusar** o cadastro sem `aceiteTermos: true` (400).
- **Gravar** a data e hora do aceite e a `versaoDosTermos`, para saber qual texto cada aluno aceitou.
- Quando os termos mudarem, o site troca a versão; o backend não precisa saber o conteúdo dos termos.

### 2.9 Consultar duplicidade antes de pedir o endereço

**Situação:** a API só confere se e-mail, CPF e telefone já existem quando a conta é criada, no fim do passo 2 do cadastro. O aluno preenche o endereço inteiro e só então descobre que o e-mail já tem conta.

**Pedido:** uma rota **pública** chamada ao clicar em "Continuar" no passo 1:

`POST /api/alunos/disponibilidade`, corpo `{ "email": "...", "cpf": "...", "telefone": "..." }`

- **Resposta 200:** `{ "emailEmUso": false, "cpfEmUso": false, "telefoneEmUso": true }`.
- **Não cria nada.** A checagem continua valendo no `POST /api/alunos`, porque a pessoa pode demorar entre um passo e outro.
- **Segurança:** a rota revela se um e-mail ou CPF tem conta. O próprio cadastro já revela isso hoje (409), mas uma rota de consulta facilita testes em massa. Por isso ela precisa de **limite de tentativas por IP** (item 6.3) e não pode devolver nenhum outro dado da conta.

### 2.8 Foto de perfil (prioridade baixa)

- **Rota:** `POST /api/usuarios/eu/foto` (multipart).
- **Arquivo:** só JPG e PNG, até 2 MB, guardado no S3.
- **Retorno:** a URL da foto passa a vir no item 2.1 (`fotoUrl`).

---

## 3. Catálogo público (visitante sem login)

**Situação hoje:**
- `GET /api/turmas`, `GET /api/eventos` e `GET /api/professores` respondem **401** sem login. As páginas públicas do site (home, lista e detalhe de turma, evento e professor) são abertas a qualquer visitante, então não conseguem usar essas rotas.
- `GET /api/loja/vitrine/atividades?tipo=TURMA|EVENTO|SIMULADO` é pública, mas devolve só `id`, `nome`, `imagemUrl` e os preços. Faltam os dados que as páginas exibem.

**Pedido:** rotas públicas, sem login, só com dados que podem ser vistos por qualquer pessoa, nunca dados de alunos. Pode ser ampliando a vitrine ou criando rotas próprias.

**Turmas** (lista e detalhe):
- id e `slug` (para URLs como `/turmas/cfp-2026-1`)
- nome, rótulo curto (ex.: "CFP · Soldado PM-BA"), descrição curta e texto de apresentação
- preço total em reais (turma é valor fechado pelo período, **não** mensalidade) e máximo de parcelas
- duração, início, dias, horário, modalidade e local
- situação: inscrições abertas / em breve / encerrada
- vagas totais e ocupadas
- o que está incluso
- professores (nome, papel ou matéria, foto)

**Eventos** (lista e detalhe):
- id, `slug`, nome, rótulo, descrição e texto de apresentação
- preço em reais ou gratuito
- data, horário, local (nome e endereço)
- programação (horário, título e descrição de cada item)
- o que está incluso
- vagas totais e ocupadas
- situação

**Professores:**
- nome, foto, minibio, matérias

**Materiais em PDF vendidos avulsos:** não encontrei na API onde ficam (os itens de `/api/loja/itens` são skins). Onde vão ficar? Campos necessários: nome, descrição, preço, nº de páginas, sumário e capa.

**A decidir junto:** aprovados, depoimentos em vídeo e blog vêm da API ou de um sistema de conteúdo à parte?

---

## 4. Área do aluno

| O site precisa | O que existe | Pedido |
|---|---|---|
| Minhas turmas (com progresso) | `GET /api/matriculas` | Confirmar que, para aluno, traz só as matrículas dele (item 1.3) e incluir dados da turma e progresso (aulas concluídas e total). Ou criar `GET /api/matriculas/eu` |
| Meus materiais | `GET /api/materiais/eu` e `GET /api/materiais/{id}/arquivo` | Confirmar que o download funciona para o aluno e bloqueia material de turma em que ele não está |
| Materiais diários por turma | — | Aguardando a documentação da estrutura atual |
| Meus eventos | `GET /api/inscricoes` | Confirmar o filtro por aluno (item 1.3) ou criar `GET /api/inscricoes/eu` |
| Minhas compras | `GET /api/loja/compras` | Confirmar o filtro por aluno (item 1.3) |

---

## 5. Compra e pagamento

**O que já existe e o site vai usar:** `POST /api/loja/compras` com:
- `formaDePagamento`: `CARTAO`, `PIX` ou `BOLETO`
- `pagamento.cartao`: `{ token, parcelas }`, com o cartão tokenizado no navegador
- resposta com `pix` (código, imagem, validade) e `boleto` (linha digitável, PDF, vencimento)
- retorno de pagamento do provedor em `POST /api/loja/pagamentos/eventos`

### 5.1 Vários itens num único pagamento — decisão necessária

**Situação:** o carrinho do site permite vários itens (ex.: turma + material). Hoje `CriarCompraRequest` aceita **um** item (`itemId` ou `atividade`) com `quantidade`.

**Opções:**
- **(a) Recomendada:** criar um pedido com N itens e **uma** cobrança.
- **(b)** O site cria uma compra por item. Isso gera várias cobranças: vários PIX, várias faturas de cartão. Experiência ruim.

### 5.2 Cupons de desconto

**Situação:** hoje os cupons estão fixos no código do site, só para teste.

**Pedido:**
- **Validar:** `GET /api/cupons/{codigo}` (ou uma rota de cálculo) devolve o desconto e as regras (validade, itens, uso único).
- **Aplicar:** a compra recebe `cupom` e calcula o desconto **no servidor**. O site nunca define o preço final.

### 5.3 Valores em reais

- **Unidade de `precoEmReais`:** a vitrine traz esse campo como inteiro. É em centavos?
- **Total em reais na compra:** `CompraResponse.total` usa `ValorResponse`, cuja moeda é só `QUAD_COINS` ou `DIAMANTES`. Para compras em reais, confirmar onde o site lê o total. Seria `pagamento.valorEmCentavos`?

### 5.4 Parcelas

Qual o máximo de parcelas, se há juros e se depende do valor ou do item. O site precisa dessa informação para montar a lista de parcelas. Hoje o site usa até 3x sem juros.

### 5.5 Chave pública do Pagar.me

O site precisa da **chave pública** (de teste e de produção) para tokenizar o cartão no navegador. A chave secreta fica **só no backend**.

### 5.6 Situação do pagamento

- **Lista de situações:** quais são todos os valores possíveis de `situacao` da compra (ex.: aguardando pagamento, paga, recusada, expirada, estornada)?
- **Como o site descobre que pagou:** depois de um PIX ou boleto, o site pode consultar `GET /api/loja/compras/{compraId}` a cada poucos segundos? Ou há outra forma recomendada?

### 5.7 Inscrição gratuita

O site vai usar `POST /api/inscricoes/eu` com `{ "tipo": "EVENTO", "atividadeId": "..." }` para eventos gratuitos. **Confirmar** se é esse o uso esperado.

### 5.8 E-mails da compra

Compra confirmada, boleto gerado e acesso liberado. Confirmar se já existem ou se precisam ser criados.

---

## 6. Infraestrutura

### 6.1 CORS
Hoje só `http://localhost:3000` é aceito. `https://quadconcursos.com.br` e `https://www.quadconcursos.com.br` recebem **403**. **Liberar o domínio final do site antes do lançamento**, sem liberar qualquer origem.

### 6.2 Swagger anunciando `http`
A spec publicada declara o servidor como `http://api.quadconcursos.com.br`. O botão de testar rotas do Swagger falha, porque a página abre em HTTPS. Sugestão: `server.forward-headers-strategy=framework` no Spring.

### 6.3 Limite de tentativas
Limitar tentativas de login, de cadastro e de envio de código (itens 2.4 a 2.6) por IP e por conta, contra força bruta e robôs.

---

## Contas de teste na API local

Criadas durante os testes do site; podem ser apagadas:
- `teste.claude.1790858155@exemplo.com` · senha `senha12345`
- `teste.claude.b.1790949238109@exemplo.com` · senha `senha12345`
- `teste.claude.c.1790962937953@exemplo.com` · senha `senha12345`
- Conta "Teste Dup" (`dup.<número>@exemplo.com` · senha `senha12345`), criada ao reproduzir o item 1.4. Ela tem o mesmo CPF da conta C
