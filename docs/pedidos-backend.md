# Pedidos para o backend — Site do Quad Concursos

**De:** time do site (Next.js) · **Data:** 02/10/2026
**Base:** testes feitos na API local (`localhost:8080`) e comparação com a spec publicada (`https://api.quadconcursos.com.br/v3/api-docs`). As rotas citadas existem nas duas.

## Resumo

| # | Pedido | Tipo | Prioridade |
|---|---|---|---|
>| 1.1 | Aluno lê e **altera** o endereço de outro aluno | ✅ **Resolvido** (conferido em 03/10/2026: agora responde 403) | — |**`

> | 1.2 | Telefone trocado sem verificação | ✅ **Resolvido** (conferido em 13/10/2026: `PATCH /api/alunos/eu` recusa telefone com 400) | — |

>| 1.3 | Confirmar que listas (matrículas, inscrições, compras) só trazem dados do próprio aluno | ✅ **Resolvido** (comprovado com dados em 05/10/2026: matrículas, inscrições e compras) | — |

> | 1.4 | Cadastro aceita CPF que já pertence a outra conta | ✅ **Resolvido** (conferido em 03/10/2026: 409 `CPF_JA_CADASTRADO`) | — |**``

>| 2.1 | Ler o próprio cadastro | ✅ **Resolvido** via `GET /api/alunos/eu` (CPF desde 03/10/2026). Falta só `emailVerificado`/`telefoneVerificado` (item 2.6) | — |**

> | 2.2 | Editar o próprio nome | ✅ **Resolvido** via `PATCH /api/alunos/eu` (conferido em 07/10/2026; o site já usa, só com o nome). O telefone não passa mais por ela (item 1.2 resolvido) | — |

> | 2.3 | `GET`/`PATCH /api/enderecos/eu` | Opcional (a falha do item 1.1 já foi corrigida) | Baixa |

> | 2.4 | Esqueci minha senha | ✅ **Resolvido** (conferido em 14/10/2026, local e produção; o site já usa). Falta conferir o link num e-mail real | — |

| 2.5 | Verificação de telefone por código (perfil) | Criar | Alta |

| 2.6 | Verificação no cadastro: celular obrigatório, e-mail por link depois | Parcial (14/10/2026): o e-mail por link está pronto e o site já usa; falta o código do celular | Alta |

> | 2.7 | Registrar o aceite dos termos no cadastro | ✅ **Resolvido e publicado** (conferido em 22/10/2026: produção já tem mudanças posteriores da `main`). O app não cria alunos, então não quebra (ver 2.7) | — |

> | 2.9 | Consultar se e-mail, CPF e telefone já estão cadastrados (antes do endereço) | ✅ **Resolvido** via `POST /api/usuarios/disponibilidade` (o site já usa). Falta o limite de tentativas (item 6.3) | — |

| 2.10 | Login em cookie protegido (o token sai do navegador) | ✅ **Resolvido na API local** (conferido em 21/10/2026: os 5 testes de entrega passaram, e o login do app segue igual). O site já migrou (21/10/2026). Falta publicar em produção com `COOKIES_DOMINIO` e `CORS_ORIGENS` | Alta |

| 2.8 | Foto de perfil | Criar | Baixa |

| 2.11 | `GET /api/usuarios/eu` para conta sem cadastro de aluno (professor, administrador) | Criar | Baixa |

| 3 | Catálogo público (turmas, eventos, materiais, professores) sem login | Parcial (21/10/2026): professores públicos em `GET /api/professores/vitrine` e `/{id}` (nome, graduação, matérias, foto); o site já usa (21/10/2026); faltam slug e minibio. Turmas, eventos e materiais seguem só com a vitrine, que desde 22/10/2026 tem `slug` e o nível da turma (o site já usa); faltam edição, cargo e órgão, horário da turma, janelas do simulado e espécie do evento (item 3.1) | Alta |

| 4 | Rotas "minhas" da área do aluno | ✅ Quase tudo resolvido (09/10/2026). Falta: armazenamento de arquivos para testar o download e confirmar os "materiais diários" | Média |

| 5.1 | Compra com vários itens num único pagamento | ✅ Decidido e criado (carrinho no servidor, 07/10/2026). Faltam 3 respostas (ver 5.1) | Alta |

| 5.2 | Cupons de desconto | ✅ **Resolvido** (19/10/2026): simulação com o cupom, desconto calculado pela API, pagamento só com cupom e limite de tentativas. O checkout do site já usa | — |

| 5.3–5.7 | Detalhes da compra (valores em reais, parcelas, chave pública, situação, inscrição gratuita) | Parcial (09/10/2026): parcelas e chave pública já vêm da API; preços em reais inteiros não comportam centavos (5.3) | Alta |

| 6.1 | CORS com o domínio do site | Configurar | Alta (antes do lançamento) |

| 6.2 | Swagger anunciando `https` | Parcial: `forward-headers-strategy` configurado, mas o Swagger agora fica desligado em produção (`DOCS_ABERTOS=false`; `/v3/api-docs` responde 404) | Média |

| 6.3 | Limite de tentativas no login e no cadastro | Parcial: login bloqueia após 5 erros no e-mail, e o cupom tem limite; faltam o cadastro e a consulta de disponibilidade | Média |



> **Banco compartilhado:** a API e o banco também atendem o **app Viver o Quad**. Toda mudança pedida aqui precisa considerar o impacto no app; os itens em que isso pesa estão marcados com ⚠️.

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

**Atualização (07/10/2026):** a rota nova `PATCH /api/alunos/eu` aceita `{ "telefone": "..." }` e troca o número na hora, sem código. O site não manda o telefone por ela, mas qualquer aluno logado consegue chamar a rota direto.

✅ **Resolvido (conferido em 13/10/2026):** a rota agora aceita só `nome` e `nomeDeGuerra` (este é do app). Qualquer outro campo, telefone inclusive, responde 400. Teste com a conta A: o pedido de troca recebeu 400 e o telefone continuou `75999990000`.

**Comprovado na API local em 09/10/2026** (conta de teste A, número restaurado depois):

| Passo | Resultado |
|---|---|
| 1. `GET /api/alunos/eu` | telefone `75999990000` |
| 2. `PATCH /api/alunos/eu` com `{ "telefone": "75900001111" }`, sem nenhum código | **200**, telefone `75900001111` |
| 3. `GET /api/alunos/eu` de novo | telefone `75900001111`: **trocou sem verificação** |
| 4. `PATCH` com o número original | 200, voltou para `75999990000` | **Pedido:** tirar `telefone` dessa rota (ou recusar com 400) e deixar a troca só pelo fluxo do item 2.5, em que o número novo só vale depois de confirmado o código.

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

✅ **Resolvido em 07/10/2026** com `PATCH /api/alunos/eu`, que responde o corpo de `GET /api/alunos/eu` atualizado. O telefone não passa por ela (item 1.2 resolvido em 13/10/2026).

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

✅ **Resolvido em 14/10/2026** com nomes diferentes dos propostos, e o site já foi ajustado:
- `POST /auth/senha/recuperacao` → 202 com `{ validadeEmMinutos: 30, reenvioEmSegundos: 60 }`;
- `POST /auth/senha/recuperacao/verificacao` → 204, ou 422 `TOKEN_INVALIDO` (link vencido, usado ou adulterado);
- `POST /auth/senha/recuperacao/redefinicao` → 204.

Testado na API local: o link vale uma vez só, e a redefinição encerra as sessões abertas (a renovação antiga passou a dar 401).

**Falta confirmar:** que o link do e-mail é `https://<domínio do site>/redefinir-senha?token=...` (o caminho e o nome do parâmetro que o site lê). Em desenvolvimento, `http://localhost:3000/redefinir-senha?token=...`.

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

> **⚠️ Atenção — o banco é compartilhado com o app Viver o Quad:** o bloqueio `CELULAR_NAO_VERIFICADO` não pode atingir as contas que já existem (hoje nenhuma tem o celular verificado), senão todos os alunos do app ficam bloqueados. Sugestão: ao criar o campo, marcar `telefoneVerificado = true` para as contas existentes (ou aplicar o bloqueio só a contas criadas depois da mudança). Definir também se o app passa a pedir a verificação.

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

✅ **Resolvido na API local (migração 105, conferido em 13/10/2026).** `aceiteTermos` e `versaoDosTermos` são obrigatórios no `POST /api/alunos`, e o aceite vai para a tabela `aceites_dos_termos` (usuário, versão e data). Testado criando uma conta pelo cadastro do site: o aceite foi gravado com a versão `2026-10-06`. Sem os campos, com `aceiteTermos: false` ou sem a versão, a API responde 400.

**Pendências resolvidas (conferido em 22/10/2026):**
- **Produção:** o aceite entrou na `main` em 13/10/2026 (`cbb6dfc5`), e a produção já responde com mudanças posteriores da mesma `main` (vitrine de professores de 21/10 e `slug` de 22/10). Conferido só por rotas públicas de leitura, sem criar conta em produção.
- **App Viver o Quad:** o app não chama `POST /api/alunos`. O "Criar conta" do login abre uma folha que manda o aluno se cadastrar no site (`CadastroNoSiteSheet`); a recepção só lê a lista de alunos (GET). Conferido na cópia do app de 17/10/2026, que não é um repositório git: vale confirmar com o time do app se a versão atual segue assim.

### 2.9 Consultar duplicidade antes de pedir o endereço

**Situação:** a API só confere se e-mail, CPF e telefone já existem quando a conta é criada, no fim do passo 2 do cadastro. O aluno preenche o endereço inteiro e só então descobre que o e-mail já tem conta.

**Pedido:** uma rota **pública** chamada ao clicar em "Continuar" no passo 1:

`POST /api/alunos/disponibilidade`, corpo `{ "email": "...", "cpf": "...", "telefone": "..." }`

- **Resposta 200:** `{ "emailEmUso": false, "cpfEmUso": false, "telefoneEmUso": true }`.
- **Não cria nada.** A checagem continua valendo no `POST /api/alunos`, porque a pessoa pode demorar entre um passo e outro.
- **Segurança:** a rota revela se um e-mail ou CPF tem conta. O próprio cadastro já revela isso hoje (409), mas uma rota de consulta facilita testes em massa. Por isso ela precisa de **limite de tentativas por IP** (item 6.3) e não pode devolver nenhum outro dado da conta.

### 2.10 Login em cookie protegido

**Decisão (05/10/2026):** o login do aluno deixa de ficar no navegador (`localStorage`) e passa para **cookies protegidos**, que nenhum script da página consegue ler. Motivo: hoje um script malicioso consegue copiar o token de renovação e ficar com a conta do aluno por 7 dias (`docs/seguranca.md`, item S5). Com os cookies, o site também consegue bloquear `/aluno` e `/checkout` no servidor.

**Cookies que o backend grava**

| Cookie | Conteúdo | Atributos | Validade |
|---|---|---|---|
| `quad_acesso` | Token de acesso | `HttpOnly; Secure; SameSite=Lax; Path=/` | A do token (~15 min) |
| `quad_renovacao` | Token de renovação | `HttpOnly; Secure; SameSite=Strict; Path=/auth` (só vai para as rotas de autenticação) | 7 dias |
| `quad_sessao` | Só o valor `1`, sem nenhum segredo | `Secure; SameSite=Lax; Path=/` (**sem** `HttpOnly`) | 7 dias, igual ao de renovação |

- **Domínio:** em produção, `Domain=.quadconcursos.com.br`, para valer no site (`quadconcursos.com.br`) e na API (`api.quadconcursos.com.br`). Em desenvolvimento (`localhost`), sem `Domain`; cookie não depende da porta, então vale para `localhost:3000` e `localhost:8080`.
- **`Secure` em desenvolvimento:** navegadores aceitam cookie `Secure` em `http://localhost`. Se der problema, pode ficar sem `Secure` só no perfil de desenvolvimento.
- **Para que serve o `quad_sessao`:** só indica que existe uma sessão. O site o usa para saber, sem chamar a API, se mostra "Entrar" ou o avatar, e para o bloqueio de `/aluno` no servidor. Ele não dá acesso a nada; quem dá acesso é o `quad_acesso`.

**Mudanças nas rotas**

1. **`POST /auth/login`** ⚠️ (o app também usa esta rota):
   - **quando a requisição vem do site** (cabeçalho `X-Quad-Cliente: site`): grava os três cookies e devolve no corpo só `acessoExpiraEm` e `renovacaoExpiraEm`, **sem os tokens**;
   - **quando vem do app** (sem esse cabeçalho): continua exatamente como hoje, com os tokens no corpo, sem cookies.
   - Motivo: se o corpo trouxesse os tokens também para o site, um script malicioso poderia pedir uma renovação e ler os tokens novos, anulando a proteção do cookie.
2. **`POST /auth/refresh`** ⚠️:
   - **site:** lê o token de renovação **do cookie `quad_renovacao`**, troca os tokens e grava os cookies de novo, **sem** os tokens no corpo;
   - **app:** continua como hoje (token de renovação no corpo e tokens novos na resposta).
3. **`POST /auth/logout`:** revoga a sessão e **apaga os três cookies** (`Max-Age=0`).
4. **Autenticação das demais rotas:** aceitar o token **do cookie `quad_acesso` ou do cabeçalho `Authorization`**. O cabeçalho continua valendo para o Swagger e para o **app Viver o Quad**, que compartilha esta API: **o app não deve ser afetado** por esta mudança (o login dele continua recebendo os tokens como hoje, se ele não usar os cookies).

**CORS**
- `allowCredentials(true)`.
- Origens **exatas**: `http://localhost:3000`, `https://quadconcursos.com.br` e `https://www.quadconcursos.com.br`. Com credenciais, a origem `*` não é permitida.
- Liberar o cabeçalho `X-Quad-Cliente` (abaixo).

**Proteção contra requisições forjadas (CSRF)**
- O `SameSite` já impede a maior parte.
- Além disso, para requisições que **alteram dados** (POST, PUT, PATCH, DELETE) autenticadas **pelo cookie**, exigir o cabeçalho `X-Quad-Cliente: site`. Outro site não consegue enviar esse cabeçalho sem passar pelo CORS, que vai recusá-lo. Requisições autenticadas pelo cabeçalho `Authorization` não precisam dele.

**O que muda no site** (feito depois desta entrega)
- Deixa de guardar tokens no navegador.
- Envia `credentials: "include"` e `X-Quad-Cliente: site` nas chamadas.
- Descobre o usuário por `GET /api/alunos/eu`, sem ler o token.
- Bloqueia `/aluno` e `/checkout` no servidor quando não houver o cookie `quad_sessao`.

**Como testar a entrega**
1. Login pelo Swagger com `credentials`: a resposta traz os três `Set-Cookie`.
2. `GET /api/alunos/eu` **sem** cabeçalho `Authorization`, só com os cookies: 200.
3. `POST /auth/refresh` sem corpo, só com o cookie: novos cookies gravados.
4. `POST /auth/logout`: os cookies são apagados, e o token de renovação antigo passa a dar 401.
5. Um PATCH só com cookie e **sem** `X-Quad-Cliente`: recusado (403).

### 2.8 Foto de perfil (prioridade baixa)

- **Rota:** `POST /api/usuarios/eu/foto` (multipart).
- **Arquivo:** só JPG e PNG, até 2 MB, guardado no S3.
- **Retorno:** a URL da foto passa a vir no item 2.1 (`fotoUrl`).

---

### 2.11 `GET /api/usuarios/eu` — conta sem cadastro de aluno

Com o login em cookie, o site não lê mais o token, então pega o id e os dados da conta em `GET /api/alunos/eu`. Uma conta de professor ou administrador recebe **409** ali e o site não tem outra rota para os dados dela: mostra só "Minha conta", sem nome nem e-mail.

- **Rota:** `GET /api/usuarios/eu`, para qualquer conta logada.
- **Resposta:** `{ id, nome, email, telefone, papeis }`.
- Prioridade baixa: o site é para alunos; isso só afeta quem da equipe entrar com a própria conta.

---

## 3. Catálogo público (visitante sem login)

**Situação hoje:**
- `GET /api/turmas`, `GET /api/eventos` e `GET /api/professores` respondem **401** sem login. As páginas públicas do site (home, lista e detalhe de turma, evento e professor) são abertas a qualquer visitante, então não conseguem usar essas rotas.
- `GET /api/loja/vitrine/atividades?tipo=TURMA|EVENTO|SIMULADO` e o detalhe `.../{tipo}/{id}` são públicos. Desde 10/10/2026 trazem também datas, turno ou horário, modalidade, descrição (turma) e vagas em tempo real. Desde 22/10/2026 (modelo novo do banco, V115 a V119) trazem também o `slug`, abrem pelo slug (`.../{tipo}/slug/{slug}` e `/api/loja/vitrine/slug/{slug}`) e, na turma, `tipo`, `modalidade` (o nível), `codinome` e `concursoId`; no evento externo, o `endereco`. O site já usa tudo isso (item 3.1). Ainda faltam os textos de venda e os professores dos eventos. O comparativo campo a campo está em [mapa-api-conteudo.md](mapa-api-conteudo.md), e o **formato exato pedido** (JSON de cada conteúdo, em ordem de prioridade) está em [contrato-api-conteudo.md](contrato-api-conteudo.md).

### 3.1 Modelo novo do banco na vitrine (22/10/2026)

**Entregue e já usado pelo site:**
- **`slug`** em turma, evento, simulado e item, e as rotas por slug. Os endereços do site passaram a ser o slug (`/turmas/rondesp-2-soldado-pmba-manha`); os antigos (nome + id) redirecionam.
- **Nível da turma** em `modalidade` (NIVELAMENTO, INTERMEDIARIO, AVANCADO, TODOS). O site não deduz mais o nível pelo nome, a não ser nas turmas antigas (REGULAR, QUESTOES).
- **`endereco`** do evento externo, mostrado no lugar do endereço do Quad.

**Falta na vitrine** (o banco já tem, mas a rota pública não mostra; até lá, o site tira do nome da turma):
- **`edicao`** e **`ano`** da turma, do evento e do simulado. O título da turma ("RONDESP 2") e o agrupamento dos turnos de uma mesma turma dependem da edição.
- **`cargo`** e **`orgao`** do concurso (o rótulo "SD/PMBA"). A vitrine traz só o `concursoId`, e `GET /api/concursos` exige login. Basta mandar os dois junto da turma, do evento e do simulado (ou abrir uma rota pública de concursos com código, nome, cargo e órgão).
- **Horário da turma** (`horarioInicial`, `horarioFim`, `horarioInicial2`, `horarioFim2`) e os **dias da semana**. Hoje o site mostra "A confirmar".
- **Janelas do simulado** (de 1 a 10 dias). A vitrine ainda manda uma data só.
- **Espécie do evento** (AULAO ou EVENTO), para separar aulões de eventos na agenda.

**Pedido:** rotas públicas, sem login, só com dados que podem ser vistos por qualquer pessoa, nunca dados de alunos. Pode ser ampliando a vitrine ou criando rotas próprias.

**Turmas** (lista e detalhe):
- id e `slug` (para URLs como `/turmas/cfp-2026-1`)
- nome, rótulo curto (ex.: "CFP · Soldado PM-BA"), descrição curta e texto de apresentação
- preço total em reais (turma é valor fechado pelo período, **não** mensalidade) e máximo de parcelas
- duração, início, dias, horário, modalidade e local
- situação: inscrições abertas / em breve / encerrada
- vagas totais e ocupadas
- o que está incluso
- ~~professores da turma~~: **fora do pedido** (decisão de 21/10/2026). A página da turma não mostra a grade de professores por enquanto; os professores aparecem só na página de professores (pedido abaixo).

**Eventos** (lista e detalhe):
- id, `slug`, nome, rótulo, descrição e texto de apresentação
- preço em reais ou gratuito
- data, horário, local (nome e endereço)
- programação (horário, título e descrição de cada item)
- o que está incluso
- vagas totais e ocupadas
- situação

**Professores:** ✅ parcial (21/10/2026). `GET /api/professores/vitrine` e `/{id}` trazem nome, graduação, matérias e foto, e o site já usa (home, página do professor, sitemap, link do autor no blog). Faltam:
- **`minibio`** (2 ou 3 linhas) e, se possível, uma **bio completa**. Sem elas, o cartão e a página do professor ficam só com nome, matérias e graduação.
- **`slug`** (ex.: `danilo-moura`). Até lá, o endereço é o nome seguido do id (`/professores/danilo-moura-6cb5e8ae-…`), como nas turmas.
- **`credenciais`** (lista de itens, ex.: "Ex-policial militar da PM-BA"). Hoje a seção "Credenciais" mostra só a graduação.
- **Fotos:** nenhum professor tem `fotoUrl` no banco local. O site usa a foto que já tinha do Danilo enquanto isso.
- **Cadastros de teste:** "Danilo Mourão ribeiro" e "Davi" aparecem na vitrine local; em produção, a vitrine deve listar só professores ativos que devem aparecer no site.

**Materiais em PDF vendidos avulsos:** não encontrei na API onde ficam (os itens de `/api/loja/itens` são skins). Onde vão ficar? Campos necessários: nome, descrição, preço, nº de páginas, sumário e capa.

**A decidir junto:** aprovados, depoimentos em vídeo e blog vêm da API ou de um sistema de conteúdo à parte?

---

## 4. Área do aluno

| O site precisa | O que existe | Pedido |
|---|---|---|
| Minhas turmas (com progresso) | `GET /api/matriculas`, `GET /api/turmas/{id}` e `GET /api/turmas/{id}/agenda` | ✅ Resolvido: o filtro por aluno foi comprovado (item 1.3) e o site calcula o progresso pela agenda |
| Meus materiais | `GET /api/materiais/eu` e `GET /api/materiais/{id}/arquivo` | ✅ Bloqueio comprovado (403 para material de outra turma). **Falta:** um ambiente com armazenamento configurado para testar o download — o backend local responde 503 "nenhum bucket foi configurado". Sugestão: um bucket de teste (ou MinIO) no ambiente local |
| Materiais diários por turma | `/api/materiais` (por turma, matéria e tópico)? | **Confirmar** se os "materiais diários" são esses materiais. Obs.: matéria e tópico só vêm preenchidos quando a turma está ligada ao concurso do tópico |
| Meus eventos | `GET /api/alunos/eu/atividades` | ✅ Resolvido (o site já usa) |
| Minhas compras | `GET /api/loja/compras` | ✅ Resolvido: filtro por aluno comprovado (item 1.3) |

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

**Atualização (07/10/2026):** o backend seguiu a opção (a), com um carrinho no servidor:
- `GET`/`DELETE /api/loja/carrinho/eu`;
- `PUT /api/loja/carrinho/eu/linhas` (reserva a vaga por 30 minutos) e `DELETE .../linhas/{linhaId}`;
- `POST /api/loja/carrinho/eu/renovacao` (mais 30 minutos);
- `POST /api/loja/carrinho/eu/fechamento` (uma cobrança só, tudo ou nada, com `Idempotency-Key`);
- `GET /api/loja/fechamentos/{id}`, mais `.../conciliacao` ("já paguei") e `.../cancelamento`.

**Atualização (20/10/2026): o checkout do site já usa o carrinho do servidor.** Com login, ele esvazia o carrinho de lá, reserva item por item (`PUT .../linhas`), simula o total com o cupom (`POST .../simulacao`) e fecha com `Idempotency-Key`. PIX e boleto seguem para `/checkout/pagamento/{fechamentoId}`, que consulta `GET /api/loja/fechamentos/{id}` a cada 5 s e tem o botão "Já paguei" (`.../conciliacao`). Conferido na API local:
- Reservar de novo o mesmo item **troca** a quantidade (não soma). O site conta com isso.
- Cupom inválido na simulação: 422 `CUPOM_INVALIDO`, "Este cupom não é válido." O site mostra a mensagem da API.
- **Bloqueio para testar o pagamento:** a API local está sem `PAGARME_SECRET_KEY`, `PAGARME_PUBLIC_KEY` e `PAGARME_WEBHOOK_SEGREDO`. O fechamento por cartão, PIX ou boleto responde 503 `PAGAMENTO_INDISPONIVEL` e a configuração vem com `disponivel: false`. Para o teste completo, faltam as chaves de **sandbox** (`sk_test_`/`pk_test_`) da conta do Quad.
- Para o cartão, o site gera o token direto em `https://api.pagar.me/core/v5/tokens?appId={chavePublica}`. O domínio do site precisa estar autorizado na conta do Pagar.me.

Dúvidas para o backend (continuam abertas):
- O carrinho do servidor exige login. O visitante monta o carrinho sem conta; o site manda os itens para o servidor só depois do login. Está certo assim?
- `CarrinhoResponse.totalEmReais` e `precoUnitarioEmReais` são inteiros, mas `FechamentoResponse.totalEmCentavos` está em centavos. Os campos "EmReais" estão em reais inteiros? Um material de R$ 49,90 não caberia (ver item 5.3).
- Itens agora têm `variacoes` (ex.: tamanhos). Quais itens do site vão ter variação?

### 5.2 Cupons de desconto

**Situação:** hoje os cupons estão fixos no código do site, só para teste.

**Pedido:**
- **Validar:** `GET /api/cupons/{codigo}` (ou uma rota de cálculo) devolve o desconto e as regras (validade, itens, uso único).
- **Aplicar:** a compra recebe `cupom` e calcula o desconto **no servidor**. O site nunca define o preço final.

**Atualização (16/10/2026):** as regras completas (os três tipos de desconto do WooCommerce, restrições e limites de uso) e os prompts para o backend estão em [prompts/cupons/](prompts/cupons/README.md), arquivos 00, 01, 02 e 05.

### 5.3 Valores em reais

- **Unidade de `precoEmReais`:** a vitrine traz esse campo como inteiro. É em centavos?
  - **Resposta (conferido em produção, 09/10/2026):** é em **reais inteiros** (turma "Patamo I" = 997, "Camisa Quad" = 40). **Problema:** um preço com centavos, como os materiais de R$ 49,90, não cabe. O mesmo vale para o carrinho (`precoUnitarioEmReais`, `totalEmReais`). **Pedido:** passar a usar centavos (`precoEmCentavos`), como já fazem o fechamento e o pagamento, ou confirmar que nenhum item terá centavos.
- **Total em reais na compra:** `CompraResponse.total` usa `ValorResponse`, cuja moeda é só `QUAD_COINS` ou `DIAMANTES`. Para compras em reais, confirmar onde o site lê o total. Seria `pagamento.valorEmCentavos`?

### 5.4 Parcelas

Qual o máximo de parcelas, se há juros e se depende do valor ou do item. O site precisa dessa informação para montar a lista de parcelas. Hoje o site usa até 3x sem juros.

**Atualização (09/10/2026):** `GET /api/loja/pagamentos/configuracao` (exige login) traz `disponivel`, `chavePublica`, `parcelasMaximas`, `cartoesMaximos` e `valorMinimoPorCartaoEmCentavos`. Isso responde o máximo de parcelas e a chave pública (5.5). **Falta responder:** há juros? A partir de quantas parcelas? Quem paga (aluno ou Quad)? E `cartoesMaximos` quer dizer que o aluno pode dividir a compra em mais de um cartão?

### 5.5 Chave pública do Pagar.me

O site precisa da **chave pública** (de teste e de produção) para tokenizar o cartão no navegador. A chave secreta fica **só no backend**.

✅ **Resolvido (09/10/2026):** vem em `chavePublica` de `GET /api/loja/pagamentos/configuracao`.

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
Hoje só `http://localhost:3000` é aceito. `https://quadconcursos.com.br` e `https://www.quadconcursos.com.br` recebem **403** (conferido de novo em 09/10/2026). **Liberar o domínio final do site antes do lançamento**, sem liberar qualquer origem.

### 6.2 Swagger anunciando `http`
A spec publicada declara o servidor como `http://api.quadconcursos.com.br` (ainda assim em 09/10/2026). O botão de testar rotas do Swagger falha, porque a página abre em HTTPS. Sugestão: `server.forward-headers-strategy=framework` no Spring.

### 6.3 Limite de tentativas
Limitar tentativas de login, de cadastro e de envio de código (itens 2.4 a 2.6) por IP e por conta, contra força bruta e robôs.

---

## Contas de teste na API local

Criadas durante os testes do site; podem ser apagadas:
- `teste.claude.1790858155@exemplo.com` · senha `senha12345`
- `teste.claude.b.1790949238109@exemplo.com` · senha `senha12345`
- `teste.claude.c.1790962937953@exemplo.com` · senha `senha12345`
- Matrículas de teste (05/10/2026): conta B na turma C.O.R.E. e conta A na turma Regular Tarde, ambas com origem SECRETARIA
- Evento de teste "Evento de teste (Claude)" (gratuito, online, 20/11/2026, professor Danilo Moura), com a inscrição da conta B
- Materiais de teste (05/10/2026): concurso "TESTE-CLAUDE" com o tópico "Atos administrativos"; na Regular Tarde, um vídeo e um resumo em PDF (sem arquivo); na C.O.R.E., uma lista em PDF (sem arquivo)
- Compras em reais da conta A (05/10/2026): turma Regular Tarde no cartão (paga, R$ 997, 3x, Visa final 4242) e "Apostila de teste (Claude)" no PIX (aguardando pagamento, R$ 49,90), com as cobranças correspondentes
- Conta B: 20 Quad Coins creditados (lançamento de teste), personagem escolhido e a compra da "Boina exclusiva" (paga com as moedas)
- Conta "Teste Dup" (`dup.<número>@exemplo.com` · senha `senha12345`), criada ao reproduzir o item 1.4. Ela tem o mesmo CPF da conta C
- Seed de desenvolvimento do backend aplicado em 19/10/2026 (`seeds/seed.sh`, no projeto da API). Ele criou o administrador `admin@quad.local`, professores, salas, matérias e alunos `@quad.local`, todos com a senha `Quad@2026`
- "Turma de teste (site)" (19/10/2026): regular, de 03/11/2026 a 26/02/2027, seg a sex das 18h30 às 22h, no Auditório, **à venda por R$ 997 com 40 vagas**. Existe para a vitrine local ter uma turma: a C.O.R.E. e a Regular Tarde já terminaram e por isso não aparecem
- Um produto de cada área (20/10/2026), para o site deixar os dados de exemplo e ler tudo da vitrine:
  - Evento "Aulão de Véspera": aulão presencial em 14/11/2026, das 14h às 19h, no Auditório, R$ 30, 60 vagas
  - Simulado "Simulado 77 — Soldado PMBA": presencial em 07/11/2026, das 8h às 12h30, no Auditório, R$ 25, 60 vagas. O site tira a carreira e o número do nome
  - Materiais impressos (tipo `MODULOS`, 100 unidades cada): Direito Constitucional R$ 50, Direito Penal Militar R$ 45, Português para PM R$ 40, Raciocínio Lógico R$ 35, Legislação PM-BA R$ 45 e Kit Completo CFP R$ 150 (50 unidades)
  - Loja (tipo `OUTROS`): Camisa Quad R$ 60 (tamanhos P, M, G e GG, 20 de cada), Caneca Quad R$ 35 e Garrafa Quad R$ 45 (40 de cada)

### O que a API ainda não cobre (achado ao ligar os produtos, 20/10/2026)

- **Material digital (PDF):** não há tipo de item para ele. Os materiais entram como impressos (`MODULOS`, retirada no balcão).
- **Preço com centavos:** o preço é inteiro em reais. As apostilas de R$ 49,90 foram cadastradas como R$ 50 (pedido 5.3).
- **Atividade gratuita fora da vitrine:** a vitrine só lista o que é vendido (preço > 0). Evento ou simulado gratuito não aparece no site; falta uma rota pública para eles (pedido 5.7).
- **Simulados:** faltam a carreira (concurso), o número da edição e os formatos de estudo (PDF, plataforma, impresso) e combos, que a Central de Simulados do novo visual usa.
- **Sumário e ficha dos materiais:** só há `descricao`. A página do material esconde o sumário até ele existir (contrato, seção 3).
