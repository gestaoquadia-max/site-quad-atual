# Pedidos para o backend — Site do Quad Concursos

**De:** time do site (Next.js) · **Atualizado em:** 13/11/2026
**Base:** testes na API local (`localhost:8080`), leituras públicas da API de produção (`https://api.quadconcursos.com.br`) e o **site de teste publicado** em `https://teste.quadconcursos.com.br` (Vercel, ligado à API de produção).

Este documento lista **só o que ainda falta**. Os pedidos já atendidos saíram daqui e ficam no histórico do git (por exemplo: material digital em PDF à venda, acréscimo do parcelamento pago pelo aluno, atividades gratuitas na vitrine e matrícula gratuita em turma, limite de tentativas por rota, lista de lotes e preço cheio na vitrine, CORS do `Idempotency-Key`, falhas de segurança, cadastro e perfil do aluno, esqueci a senha, aceite dos termos, login em cookie, carrinho no servidor, cupons, slug e nível da turma na vitrine, preços em centavos e lotes, vitrine de professores e chaves de sandbox do Pagar.me).

> **07/11/2026: atendido na API**, e por isso saiu da lista: **e-mails da compra (antigo 6.2)**. A API envia compra confirmada, PIX aguardando, PIX vencido e devolução (desde 28/10, e com o comprovante do Pagar.me desde 06/11), além da inscrição e da matrícula gratuitas, a partir dos modelos de [`docs/modelos-de-email.md`](modelos-de-email.md).
>
> **04/11/2026: atendidos e conferidos no site de teste**, e por isso saíram da lista:
> - **CORS e cookies do teste:** a pré-verificação vinda de `https://teste.quadconcursos.com.br` responde 200, com a origem, `Allow-Credentials` e `idempotency-key` liberados; o login no teste funciona.
> - **Entrada pelo Google no teste:** o client ID está na API (a rota responde `TOKEN_DE_PROVEDOR_INVALIDO` a um token falso, e não mais 503) e no site, que mostra o botão.
> - **Verificação do celular (4.1) e `telefoneVerificadoEm` (4.2):** testada no site de teste com o Twilio de produção; o celular foi confirmado.
> - **Combos (PR #129 e #136)** e **impresso e digital no mesmo material (PR #137, V144):** o site já usa (`/combos` e a escolha do formato dentro do material).
>
> **Liberados agora que o teste está no ar:** os pedidos 1.3 (domínio do teste no Pagar.me) e 1.6 (endereço do site nos e-mails) só podiam ser feitos com um endereço público do site.

> **Banco compartilhado:** a API e o banco também atendem o **app Viver o Quad**. Toda mudança pedida aqui precisa considerar o impacto no app; os itens em que isso pesa estão marcados com ⚠️.

**Padrões que valem para tudo:**
- Manter o formato de erro atual (`status`, `title`, `detail`, `codigo`, `erros[]`). O site já lê esse formato.
- Rotas "do próprio usuário" pegam o id **da sessão**, nunca de um parâmetro enviado pelo cliente.
- Rotas públicas (sem login) só levam dados que qualquer pessoa pode ver, nunca dados de alunos.

## Resumo

| # | Pedido | Prioridade |
|---|---|---|
| 1.2 | Domínio oficial no CORS e nos cookies (o teste já funciona) | Alta (no lançamento) |
| 1.3 | Autorizar no Pagar.me o domínio do teste agora, e o oficial no lançamento | Alta |
| 1.4 | Publicar a API e o site juntos (preços em centavos) | Alta (no lançamento) |
| 1.5 | Entrada pelo Google: origens do domínio oficial (o teste já funciona) | Média (no lançamento) |
| 1.6 | Endereço do site nos e-mails (`SITE_URL` e `URL_DE_REDEFINICAO_DE_SENHA`) apontando para o teste | Alta |
| 2.7 | Imagens: medida mínima, proporção e formato no envio pelo console (hoje corta em 560 × 560 e salva em JPG) | Alta (antes do lançamento) |
| 3 | Professores: fotos e só os professores do site | Média |
| 3.1 | Foto do professor: a API já aceita a original 4:5 (PR #139); falta o console enviar sem reduzir e reenviar as fotos de 512 × 512 | Alta |
| 4.6 | Conferir o CPF na Receita no cadastro (cpfcnpj.com.br) | Média |
| 4.7 | Depois de confirmar o e-mail no clique (como hoje), redirecionar para a página do site com o resultado | Alta |
| 4.4 | `GET /api/usuarios/eu` para conta sem cadastro de aluno | Baixa |
| 4.5 | Foto de perfil | Baixa |
| 5.3 | Simulados: depois da aplicação, a versão de estudo na vitrine em digital (PDF) e impresso, cada um com o seu preço, ligada ao presencial de origem | Alta |
| 5.4 | Textos de venda da turma e programação do evento | Média |
| 5.5 | Notícias de concursos na barra do topo, editáveis pelo console e atualizadas em tempo real | Média |
| 6.3 | Armazenamento de arquivos no ambiente local (endereço do S3 configurável) | Média |
| 6.4 | Aprovados, depoimentos em vídeo e blog pela API | Baixa |
| 6.5 | Origem da venda: a campanha (primeira e última) gravada em cada compra e filtrável no painel administrativo | Alta |
| 6.6 | Compra paga enviada à Meta pelo servidor (API de Conversões), sem contar em dobro com o Pixel do site | Alta |

---

## 1. Antes do lançamento

### 1.2 Domínio oficial no CORS e nos cookies

> **04/11/2026: o site de teste já funciona.** A pré-verificação vinda de `https://teste.quadconcursos.com.br` responde 200 e o login no teste funciona. Falta **só o domínio oficial**, no lançamento: `https://quadconcursos.com.br` e `https://www.quadconcursos.com.br` ainda respondem **403** (conferido em 04/11/2026), o que é esperado enquanto o site oficial não está no ar.

**O problema.** O site só funciona com a API de produção com duas configurações:
- **`CORS_ORIGENS`:** sem a origem do site, o navegador não deixa o site ler a vitrine nem fazer login.
- **`COOKIES_DOMINIO`:** os cookies da sessão (`quad_acesso`, `quad_renovacao`, `quad_sessao`) precisam valer no domínio do site. Sem isso, o aluno entra e "cai" logo em seguida.

**O pedido (no lançamento).** Acrescentar `https://quadconcursos.com.br` e `https://www.quadconcursos.com.br` em `CORS_ORIGENS`, sem tirar o teste e sem liberar qualquer origem, e conferir que `COOKIES_DOMINIO` cobre o domínio oficial.

**Como conferir:**
```
curl -i -X OPTIONS https://api.quadconcursos.com.br/api/loja/carrinho/eu/fechamento   -H "Origin: https://quadconcursos.com.br" -H "Access-Control-Request-Method: POST"   -H "Access-Control-Request-Headers: content-type,idempotency-key,x-quad-cliente"
```
Deve responder 200, com essa origem em `Access-Control-Allow-Origin` e `idempotency-key` em `Access-Control-Allow-Headers`.

### 1.3 Autorizar o domínio do site no Pagar.me

**O problema.** O site gera o token do cartão direto do navegador (`https://api.pagar.me/core/v5/tokens?appId={chavePublica}`), para que o número do cartão nunca passe pelo nosso servidor. O Pagar.me só aceita esse pedido vindo de domínios autorizados na conta.

**O pedido.**
- **Agora:** autorizar `teste.quadconcursos.com.br` (e `localhost:3000`, para testes, se a conta permitir). Só dava para pedir com o site de teste publicado. Sem isso, o pagamento no cartão falha no teste ao gerar o token, antes de chegar à API.
- **No lançamento:** autorizar `quadconcursos.com.br` e `www.quadconcursos.com.br`.

Isso fica no painel da conta do Pagar.me, não no código. Confirmar também **qual conta** a API de produção usa: o teste está ligado à API de produção, então um pagamento no teste numa conta de produção é uma **cobrança real**.

### 1.4 Publicar a API e o site juntos

**O problema.** Desde 23/10/2026 os preços em reais vêm em **centavos** (vitrine e carrinho), e o site já foi adaptado. Se a API nova for ao ar antes do site novo, o site antigo leria `4500` como R$ 4.500 na Garrafa Quad de R$ 45. Se o site novo for antes da API nova, ele mostraria R$ 0,45.

**O pedido.** Combinar a publicação: API e site no mesmo momento.

### 1.5 Entrada pelo Google

**Entregue em 24/10/2026** (`POST /auth/google`, só para contas que já existem). **04/11/2026: funciona no site de teste**: o client ID está em `GOOGLE_CLIENT_IDS` na API de produção e em `NEXT_PUBLIC_GOOGLE_CLIENT_ID` no site, e a origem `https://teste.quadconcursos.com.br` está autorizada.

**Falta, no lançamento:** acrescentar no mesmo client ID, em "Origens JavaScript autorizadas" do Google Cloud, `https://quadconcursos.com.br` e `https://www.quadconcursos.com.br`. Sem isso, o botão no site oficial mostra o erro `origin_mismatch`.

### 1.6 Endereço do site nos e-mails

**O problema.** Os links dos e-mails da API levam às páginas do site: confirmar o e-mail (`/confirmar-email?token=…`) e redefinir a senha (`/redefinir-senha?token=…`). A API monta esses links com duas variáveis de produção (`application-prod.properties`): `SITE_URL` (`api.site.url`) e `URL_DE_REDEFINICAO_DE_SENHA` (`api.recuperacao.url-do-site`). Até o teste ser publicado, não havia um endereço público para pôr nelas.

**O pedido.** Na API de produção:
- `SITE_URL=https://teste.quadconcursos.com.br`
- `URL_DE_REDEFINICAO_DE_SENHA=https://teste.quadconcursos.com.br/redefinir-senha`

No lançamento, trocar as duas para `https://quadconcursos.com.br`.

**Como conferir:** pedir "Esqueci a senha" no site de teste com uma conta de teste. O link do e-mail deve abrir `https://teste.quadconcursos.com.br/redefinir-senha?token=…`, e o do cadastro, `https://teste.quadconcursos.com.br/confirmar-email?token=…`. As duas páginas já estão no ar, com as telas de link inválido ou vencido.

---

## 2. Vitrine pública

A vitrine (`/api/loja/vitrine/atividades` e `/api/loja/vitrine`) é a única fonte do site para turmas, eventos, simulados e produtos, porque o visitante não tem login. Em 23/10/2026 ela ficou completa ("vitrine completa", PR #119), e o site já usa: modalidade, edição e ano, concurso (`rotulo` "SD/PMBA"), sala, horários e dias da turma, espécie, resumo e professores do evento, e janelas do simulado. As atividades antigas, sem edição ou concurso, ainda completam pelo nome. Desde 27/10/2026 a vitrine também lista as atividades gratuitas (`gratuita: true`, sem preço, vagas e lote), e o site inscreve direto: evento e simulado por `POST /api/inscricoes/eu`, turma por `POST /api/matriculas/eu`.

### 2.7 Imagens: medida mínima, proporção e formato no envio pelo console

**O problema (conferido em 29/10/2026).** O console salva as imagens das turmas **cortadas em quadrado de 560 × 560 e em JPG**. Isso causa duas falhas no site:
- **Corte:** a capa da página da turma é vertical (4:5) e preenche o quadro, então o brasão quadrado aparece ampliado e cortado nas laterais e embaixo.
- **Transparência:** o JPG não guarda transparência, então um PNG de fundo transparente feito pela designer chega ao site com fundo branco.

Além disso, nada impede o envio de uma imagem pequena ou fora de proporção, que fica borrada ou mal cortada.

> **31/10/2026: a capa da turma fica quadrada.** Decisão do Quad: o site passou a mostrar a capa da turma num quadro quadrado, então o corte em 560 × 560 do console **serve para a turma**. Para ela, o pedido fica só no formato (manter PNG/WebP com transparência) e na medida mínima de 560 × 560. As outras imagens da tabela continuam valendo.

**O pedido.**
1. **Validar no envio** (no console e na API, que é quem grava) a medida mínima e a proporção de cada tipo de imagem, conforme a tabela abaixo. Imagem fora da regra é recusada com uma mensagem que diga a medida enviada e a esperada. Por exemplo: "A imagem tem 560 × 560 px. A capa da turma precisa ter pelo menos 800 × 1000 px, na proporção 4:5 (vertical)."
2. **Não cortar em quadrado.** O corte, quando houver, respeita a proporção de cada tipo. Imagem acima do lado máximo é **reduzida** para o tamanho recomendado em vez de recusada.
3. **Manter PNG ou WebP quando o arquivo tiver transparência.** Só converter para JPG (ou WebP) quando não tiver.

**Medidas por tipo de imagem.** O mínimo é cerca de 1,5 vez o maior tamanho em que a imagem aparece na tela, para não borrar em telas de alta densidade. O recomendado é o dobro.

| Imagem | Onde aparece no site | Proporção | Recomendado | Mínimo (recusar abaixo) | Proporção aceita (largura ÷ altura) |
|---|---|---|---|---|---|
| Capa da turma (`imagemUrl` da atividade) | Página da turma (até 520 × 520) | 1:1 | 1080 × 1080 | 560 × 560 | 0,95 a 1,05 |
| Produto da loja (`imagemUrl` do item) | Página do produto (até 640 × 640) e cartão (320) | 1:1 | 1200 × 1200 | 800 × 800 | 0,95 a 1,05 |
| Foto do professor (`fotoUrl`, item 3) | Cartão (320 × 400) e topo da página do professor | 4:5 vertical | 1080 × 1350 | 800 × 1000 | 0,75 a 0,85 |
| Arte do evento e do simulado (quando houver) | Cartão e página do evento | 1:1 | 1080 × 1080 | 800 × 800 | 0,95 a 1,05 |
| Foto do aprovado (item 6.4) | Cartão de aprovados (240) | 1:1 | 600 × 600 | 480 × 480 | 0,95 a 1,05 |
| Capa do artigo do blog (item 6.4) | Lista e destaque do blog (até 440) | 3:2 deitada | 1200 × 800 | 900 × 600 | 1,45 a 1,55 |

**Regras que valem para todas:**
- formatos JPG, PNG ou WebP;
- até 5 MB por arquivo;
- lado máximo de 4000 px (acima disso, reduzir).

**Enquadramento (vale mostrar como dica no console, ao lado do campo de envio):**
- **Capa da turma:** aparece inteira, num quadro quadrado; o brasão ou o texto centralizado.
- **Foto do professor:** no topo da página, a foto é cortada mantendo a parte de cima, então o rosto precisa ficar no **terço superior**.

**Imagens atuais:** as capas de turma já cadastradas (560 × 560) passam na regra. A validação vale só para envios novos.

---

## 3. Professores

`GET /api/professores/vitrine`, `/{id}` e `/slug/{slug}` já são públicos (o slug desde 23/10/2026, e o endereço do site é `/professores/danilo-moura`), e o site usa (home, página do professor, sitemap e autor do blog). A **minibio** é a coluna `graduacao` (decisão de 23/10/2026): o texto cadastrado ali aparece abaixo do nome do professor e no cartão da home, então o campo deve ser preenchido como uma apresentação curta (2 ou 3 linhas, até os 200 caracteres que a coluna aceita), não só o nome do curso. Faltam:

- **Fotos:** nenhum professor tem `fotoUrl` no banco local. O site usa a foto que já tinha do Danilo enquanto isso.
- **Foto do professor chega pequena (3.1, 03/11/2026, alta):** o arquivo original tem 1080 × 1350, mas o que fica no S3 tem **512 × 512** (ex.: a do Airton Brito, `imagens/professores/6bc4f14d-….png`). A API não redimensiona; quem corta em quadrado e reduz é o console, antes de enviar. No site, a foto aparece grande (no carrossel da home, o painel aberto tem cerca de 600 px de largura) e fica borrada.
  - **Atendido na API (PR #139, 04/11/2026):** a foto do professor é aceita em qualquer proporção (saiu a exigência de foto quadrada). O site já está pronto para a original 4:5: o carrossel da home a mostra inteira, e a página do professor mostra a parte de cima, com o rosto.
  - **Falta:**
    1. o console enviar a foto **original, sem cortar nem reduzir** (1080 × 1350); se o app precisar do círculo, ele recorta na hora de mostrar;
    2. publicar a API com o PR #139 (em 04/11/2026, as fotos em produção ainda eram as de 512 × 512);
    3. reenviar as fotos já cadastradas (Airton Brito e Roberto Fabian), que hoje estão em 512 × 512, e cadastrar as dos outros 24 professores, que estão sem foto em produção.
- **Só os professores do site:** "Danilo Mourão ribeiro" e "Davi" aparecem na vitrine local e parecem cadastros de teste. Em produção, a vitrine deve listar só os professores ativos que devem aparecer no site.

---

## 4. Conta do aluno

### 4.6 Conferir o CPF na Receita no cadastro (cpfcnpj.com.br)

**Por que o site precisa.** Hoje o site e a API só conferem os dígitos verificadores do CPF. Um CPF que não existe, de pessoa falecida ou de outra pessoa passa no cadastro. O Quad quer usar o serviço **cpfcnpj.com.br** (documentação: `https://www.cpfcnpj.com.br/dev/`) para conferir na Receita.

**Por que tem de ser na API, e não no site.** A consulta é `GET https://api.cpfcnpj.com.br/{token}/{pacote}/{cpf}`, com o **token no endereço**, e o token só funciona a partir do **IP de origem cadastrado** no painel deles. Fora desse IP, a resposta é o erro `1000`. A API na AWS sai por um IP fixo; o site, numa hospedagem como a Vercel, não tem IP fixo. Além disso, o token no navegador deixaria qualquer pessoa gastar os créditos do Quad.

**O pedido.**
- No `POST` do cadastro de aluno (e, se fizer sentido, na rota de disponibilidade), depois de conferir os dígitos, consultar o CPF **uma vez** e recusar:
  - `CPF_NAO_ENCONTRADO`: o serviço respondeu `102` (CPF válido, mas não existe na Receita; não consome crédito);
  - `CPF_NAO_CONFERE`: o nome da Receita não bate com o nome digitado. Comparar sem acento, sem maiúsculas e sem espaços duplicados, e aceitar quando o primeiro e o último nome batem, para não barrar quem abreviou o nome do meio;
  - `CPF_IRREGULAR`: situação cadastral diferente de regular (falecido, cancelado, suspenso), só se o pacote escolhido trouxer a situação.
- **Se o serviço falhar** (erros `1005`, `1006`, `1007`, `1008`, tempo esgotado ou sem créditos, `1001`): **deixar o cadastro seguir** e registrar no log, para um problema do fornecedor não impedir matrículas. Marcar a conta como "CPF não conferido" para conferir depois.
- **Guardar só o resultado** (conferido em, pacote e `consultaID`), nunca o nome da mãe, o endereço ou o PDF do comprovante. O CPF já é guardado hoje.
- Entrar nos limites por minuto da API (`GruposPorRota`), junto com o cadastro.

**Pacotes (preço por consulta, out/2026).** O cadastro do site não pede data de nascimento, então a conferência é pelo nome:

| Pacote | Devolve | Preço | Serve para |
|---|---|---|---|
| `1` CPF A | Nome completo | R$ 0,17 | CPF existe e é da pessoa (sugerido) |
| `26` CPF D Simplificado | Nome, nascimento e situação cadastral | R$ 0,37 | O mesmo, mais barrar CPF de falecido ou cancelado |
| `8` CPF D | Nome, nascimento, situação, óbito e comprovante | R$ 0,41 | Quando precisar do comprovante da Receita |

**Regras do fornecedor que afetam a integração:**
- tempo limite de **60 segundos** (a média é de 2 s), porque com tempo menor o crédito pode ser cobrado sem a resposta chegar;
- sem plano, **2 consultas por segundo** a partir de 31/10/2026 (erro `1007`); o plano Start dá 10 por segundo;
- o mesmo CPF consultado 3 vezes em menos de 1 minuto fica bloqueado por 1 minuto (erro `1003`);
- TLS 1.3, e o firewall precisa liberar os IPs da Cloudflare.

**Para testar:** o token de testes público da documentação (`5ae973d7a997af13f0aaf2bf60e65803`) devolve só dados fictícios e não precisa de IP. O token de produção é criado pelo Quad no painel deles (API → Tokens), já com o IP da API, e fica numa variável de ambiente.

**LGPD.** Mandar o CPF para o fornecedor é compartilhamento de dado pessoal: a política de privacidade do site passa a citar a conferência na Receita por um prestador, com a finalidade de evitar fraude (o site atualiza o texto quando a conferência entrar).

### 4.7 Depois de confirmar o e-mail, mostrar a página do site (prioridade alta)

**Como está hoje (conferido no código, 07/11/2026).** O link do e-mail de confirmação aponta para a **própria API** (`LinkDeConfirmacao` monta `<api>/auth/email/confirmacao?token=…` com a `UrlDaApi`). No clique, o `GET` dessa rota (`ConfirmacaoDoEmailController`) **confirma na hora** e responde uma **página HTML feita pela API**, sempre com 200: confirmado, já confirmado ou link inválido.

**O que fica igual:** a confirmação automática no clique. O Quad quer manter assim: o aluno clica no link e o e-mail já está confirmado, sem passo a mais. O link do e-mail também continua o mesmo.

**O que muda:** só a página que o aluno vê depois. Hoje ele fica numa página simples da API, fora do visual do Quad e sem caminho de volta para o site. O site já tem essa página no visual novo, com uma tela para cada resultado e o botão "Ir para o meu perfil".

**O pedido.** No `GET /auth/email/confirmacao`, depois de confirmar (`ConfirmarEmail`, sem nenhuma mudança na regra), **redirecionar para a página do site** em vez de responder o HTML:

```
303 See Other
Location: <SITE_URL>/confirmar-email?resultado=CONFIRMADO
```

- `resultado` é o valor que `ResultadoDaConfirmacao` já devolve: `CONFIRMADO`, `JA_CONFIRMADO` ou `INVALIDO` (link que não existe, já usado ou vencido depois das 24 horas).
- O endereço vem da `UrlDoSite` (a mesma `SITE_URL` dos outros e-mails): no teste, `https://teste.quadconcursos.com.br`; no lançamento, `https://quadconcursos.com.br`.
- O token **não** vai para o site: só o resultado. A página do site não chama a API nem confirma nada; ela só mostra a tela do resultado.
- O HTML que a API monta hoje pode sair (ou ficar só como reserva, se a `SITE_URL` não estiver configurada).

**Do lado do site: pronto (07/11/2026).** A página `/confirmar-email?resultado=…` mostra "E-mail confirmado", "Seu e-mail já estava confirmado" ou "Link inválido ou vencido" (também quando abre sem resultado), todas com o botão para o perfil.

**Como conferir:** criar uma conta no site de teste (ou pedir "Reenviar e-mail de confirmação" no Perfil) e clicar no link do e-mail. O navegador passa pela API e para em `https://teste.quadconcursos.com.br/confirmar-email?resultado=CONFIRMADO`, com a tela "E-mail confirmado"; o aviso de e-mail não confirmado some do Perfil. Abrir o mesmo link de novo deve parar em `?resultado=JA_CONFIRMADO`.

### 4.4 `GET /api/usuarios/eu` para conta sem cadastro de aluno (prioridade baixa)

**Por que o site precisa.** Com o login em cookie, o site não lê mais o token. Ele pega o id e os dados da conta em `GET /api/alunos/eu`, que responde **409** para professor e administrador. Nesse caso, o site mostra só "Minha conta", sem nome nem e-mail.

**O pedido.** `GET /api/usuarios/eu` para qualquer conta logada, com `{ id, nome, email, telefone, papeis }`. Só afeta quem da equipe entrar no site com a própria conta.

### 4.5 Foto de perfil (prioridade baixa)

**O pedido.** `POST /api/usuarios/eu/foto` (multipart), só JPG e PNG, até 2 MB, guardada no S3. A URL passa a vir em `GET /api/alunos/eu` (`fotoUrl`).

---

## 5. Produtos que a API ainda não cobre

### 5.3 Simulados: formatos de estudo

> **04/11/2026: os combos estão atendidos** (PR #129 e #136); o site mostra os combos só de simulados na aba "Combos" da Central e todos em `/combos`.

> **13/11/2026: reescrito.** O console já cria a **versão em PDF** de um simulado (botão "Versão PDF"): um simulado à parte, na modalidade "Em PDF", com preço próprio, os PDFs anexados e o vínculo com o presencial de origem. Exemplo: **SIMULADO 78 SD PMBA**, presencial na Sala 1 em 25/10 e versão em PDF de 26/10 a R$ 5,00, com 2 PDFs. Falta só a vitrine pública.

**A regra do Quad.** Cada simulado nasce **presencial e impresso**. Logo depois da aplicação, ele desce para **"Edições anteriores"** na Central de Simulados e passa a ser vendido **para estudo em dois formatos, à escolha do aluno: digital (PDF) e impresso, cada um com o seu preço** (o impresso tem um preço, o digital tem outro). O site já tem essa seção pronta, com o selo "Já realizado" e a escolha do formato; hoje ela aparece vazia.

**O problema (conferido em 13/11/2026).** `GET /api/loja/vitrine/atividades?tipo=SIMULADO` só devolve simulados com **data futura**. As versões em PDF também têm data (a do 78 é 26/10) e caem no mesmo filtro. Por isso nenhuma das duas versões do 78 aparece, nem pela lista nem pelo slug, e o mesmo vale para o 77, o 76 e o CFO 2. O console mostra "12 no site", mas a vitrine entrega só os 4 simulados de 15/11.

**O pedido.**

1. **Vitrine: a versão em PDF ativa aparece sempre**, sem o filtro de data, enquanto estiver ativa e com preço. O presencial continua saindo da vitrine depois da aplicação, como hoje.
2. **Na resposta da versão em PDF:**
   - `detalhe.modalidade` com um valor próprio (por exemplo, `PDF`), para o site separar do presencial e do online;
   - `detalhe.origemId` preenchido com o id do presencial de origem. É assim que o site sabe o número da edição e a carreira, e põe a versão em PDF no lugar dela em "Edições anteriores";
   - `detalhe.concurso`, o preço e o lote, como nos outros simulados;
   - a **quantidade** de PDFs, e não os arquivos: o link de download só vai para quem comprou.
3. **Entrega para quem comprou:** confirmar como o aluno baixa os PDFs depois de pagar. O site sugere o mesmo caminho dos materiais digitais (a área do aluno lista e baixa os arquivos da compra). Se a rota for outra, informar qual.
4. **Impresso depois da aplicação, com preço próprio.** Depois da aplicação, o simulado também é vendido **impresso**, e o **aluno escolhe** entre digital e impresso na compra. **Cada formato tem o seu preço**, definido no console: o do impresso é diferente do digital. Hoje o console só cria a versão em PDF; falta a oferta impressa da versão de estudo:
   - com **preço próprio** e **estoque** (as cópias disponíveis), como o impresso dos materiais;
   - na vitrine, junto da versão em PDF do mesmo simulado, ligada ao mesmo presencial de origem (`origemId`), para o site mostrar os dois formatos na mesma edição;
   - se servir, o mesmo modelo do material (PR #137): **um cadastro com as duas ofertas** (digital e impresso), cada uma com preço, e o formato escolhido na compra. Assim a versão de estudo do 78 seria um só item, com "PDF — R$ X" e "Impresso — R$ Y".
   - Confirmar como o aluno recebe o impresso comprado depois da aplicação (retirada no Quad, como os materiais impressos, ou outro jeito).

**Do lado do site:** com a vitrine devolvendo a versão de estudo, o site passa a mostrá-la em "Edições anteriores" e na aba "Individuais", com o número e a carreira do presencial de origem, os dois formatos e o preço de cada um, e vende pelo carrinho como os outros itens. É uma mudança pequena, feita no mesmo dia.

**Como conferir:** `curl "https://api.quadconcursos.com.br/api/loja/vitrine/atividades?tipo=SIMULADO&tamanho=100"` deve trazer a versão de estudo do **SIMULADO 78 SD PMBA**, com o `origemId` do 78 da Sala 1, o digital a R$ 5,00 e o impresso com o preço dele.

### 5.4 Textos de venda da turma e programação do evento

**O problema.** A vitrine traz a descrição da turma e, desde 23/10/2026, o resumo e os professores de cada evento (o site já mostra "Quem conduz", com link para a página do professor). Ainda faltam o que está incluso na turma e a programação do evento (horário, título e descrição de cada parte). As páginas escondem essas seções.

**O pedido.** Os campos descritos em [contrato-api-conteudo.md](contrato-api-conteudo.md). A grade de professores **da turma** não é necessária: a decisão de 21/10/2026 foi não mostrar.

### 5.5 Notícias de concursos na barra do topo, editáveis pelo console

**O problema.** A barra azul do topo do site mostra hoje só as turmas abertas, montadas pelo site a partir da vitrine. O retorno do Quad (29/10/2026): a barra deve **informar notícias de concursos** (edital publicado, inscrições abertas, data de prova, resultado), com **atualização em tempo real**. Isso precisa de um cadastro no console, porque as notícias são escritas pela coordenação.

**O pedido.**
- **Cadastro no console** (perfil de coordenação ou marketing), com estes campos por aviso:
  - `rotulo`: a etiqueta curta antes do texto, como "Edital", "Inscrições", "Prova", "Resultado" ou "Turmas";
  - `texto`: até 120 caracteres;
  - `link`: opcional, para a notícia ou o edital (interno do site ou externo);
  - `inicioEm` e `fimEm`: período em que aparece, para o aviso sair sozinho depois da data;
  - `ordem` e `ativo`.
- **Rota pública** `GET /api/avisos/vitrine`: só os avisos ativos e dentro do período, já ordenados. Ela segue o padrão das outras rotas da vitrine (sem login, sem dados de aluno).

**O que o site faz com isso.**
- Mostra as notícias na barra, cada uma clicável quando tiver link.
- Sem nenhuma notícia cadastrada, continua mostrando as turmas abertas, como hoje.
- **Tempo real:** o site consulta a rota de novo a cada 1 minuto, também com a página já aberta. Uma notícia salva no console aparece para todos em até 1 minuto, sem precisar publicar o site. Para isso, a rota precisa estar nos limites por minuto da API (`GruposPorRota`) com folga para essa consulta.

---

## 6. Respostas do Quad e o que elas pedem (26/10/2026)

As sete perguntas foram respondidas. Três não pedem nada ao backend:
- **Carrinho sem login:** o visitante monta o carrinho sem conta e só precisa entrar para finalizar. É como o site já funciona.
- **Variações:** podem existir em qualquer item, não só na camisa. O site já aceita variação em qualquer produto da loja (chama de "Tamanho" na roupa e "Opção" nos demais).
- **Situações do pagamento:** paga, aguardando, recusada, expirada, cancelada e estornada, que são as da API (`SituacaoDaCompra`). O site trata todas.

As outras quatro viram pedidos:

### 6.3 Armazenamento de arquivos no ambiente local

**Situação:** no ambiente local, o download de materiais responde 503 "nenhum bucket foi configurado". Desde 28/10/2026 isso vale também para o **material digital da loja** (o PDF fica no mesmo bucket, sob `loja/itens/`): localmente não dá para enviar o PDF nem baixar o comprado, e o PDF sem arquivo não entra na vitrine. Para testar a venda, o site precisou marcar um arquivo fictício direto no banco local. A API só fala com o S3 da AWS: o endereço do serviço não é configurável (`ConfiguracaoDoArmazemDeMateriais` cria o cliente só com a região), então um armazenamento de teste local (MinIO, compatível com o S3) não funciona sem mudança no código.

**O pedido.** Uma propriedade opcional com o endereço do S3 (por exemplo `api.materiais.endpoint`, vazia em produção) e o modo de caminho (`forcePathStyle`) ligado quando ela existir. Com isso, o ambiente local usa um MinIO em Docker e produção continua na AWS sem mudar nada. A alternativa é um bucket de teste na própria AWS, com credenciais de teste.

### 6.4 Aprovados, depoimentos em vídeo e blog

**Resposta:** vão vir da API. **O pedido**, quando o Quad quiser publicar:
- **Aprovados:** nome, foto, concurso, colocação, turma e ano, e um depoimento curto, numa rota pública.
- **Depoimentos em vídeo:** título e link do vídeo (YouTube ou arquivo).
- **Blog:** título, slug, resumo, texto, autor (professor), categoria, imagem de capa e data de publicação. O blog está fora do ar no site desde 23/10/2026 e volta quando a API tiver os artigos.

### 6.5 Origem da venda: a campanha em cada compra (prioridade alta)

**Por que o Quad precisa.** O Quad vai anunciar no Google Ads e na Meta e quer saber, por campanha, **quem** comprou **o quê** e **quando**: "na campanha de julho, 45 pessoas compraram a RONDESP; quem são elas". O Google Analytics (que o site vai ligar) mostra os **totais** por campanha, mas nunca o nome de quem comprou: as regras do Google proíbem enviar dado pessoal. O nome só existe no sistema do Quad, então a campanha precisa ficar **gravada dentro da compra**.

**Como está hoje (conferido no código, 07/11/2026).** A compra não guarda nenhuma origem: não há campo de campanha nem de UTM em `compras`, e os fechamentos não aceitam esse dado.

**Como o site sabe a campanha.** Todo anúncio leva a campanha no link (as UTMs: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`; no Google Ads, também o `gclid`). O site guarda no navegador a **primeira** e a **última** campanha pelas quais o aluno chegou, por **90 dias**, e manda as duas no momento da compra.

**O pedido.**

1. **Aceitar a origem nos fechamentos**, num campo opcional `origem`, em `POST /api/loja/carrinho/eu/fechamento`, no fechamento do combo e na inscrição e matrícula gratuitas:

   ```json
   "origem": {
     "primeira": { "fonte": "meta", "midia": "pago", "campanha": "2026-07-rondesp", "conteudo": "video-depoimento", "termo": null, "gclid": null, "em": "2026-07-03T14:20:00Z" },
     "ultima":   { "fonte": "google", "midia": "cpc", "campanha": "2026-09-rondesp", "conteudo": null, "termo": "curso pmba", "gclid": "EAIaIQ…", "em": "2026-09-10T18:05:00Z" }
   }
   ```

   - Tudo opcional: quem chegou direto (sem campanha) manda `origem` sem `primeira`/`ultima`, ou não manda nada. A ausência **nunca** recusa a compra.
   - É informação de marketing, e não de pagamento: a API só guarda, sem validar contra uma lista de campanhas. Limitar o tamanho (por exemplo, 150 caracteres por campo) e aceitar só texto simples.
   - `em` é quando o aluno chegou por aquela campanha.

2. **Gravar a origem em cada compra** do fechamento (todas as compras de um carrinho recebem a mesma origem). Ela é congelada como o resto da compra: não muda depois.

3. **Mostrar e filtrar no painel administrativo:** a coluna "Campanha" (a última; a primeira ao abrir a compra) na lista de compras, com filtro por campanha, fonte e período, e a exportação em planilha com nome do aluno, item, valor, data da compra e as duas campanhas. Isso também pode ir na rota de leitura das compras usada pelo painel.

**LGPD.** A origem é dado de marketing ligado a uma pessoa. A proposta é tratá-la como **interesse legítimo** (é só a origem da venda feita no próprio site, sem seguir o aluno por outros sites) e citar isso na política de privacidade; a confirmação fica com quem fez a revisão jurídica. O site só manda a origem no fechamento, e o aluno pode pedir a exclusão como qualquer outro dado (o canal já existe).

**Do lado do site:** quando a API aceitar o campo, o site passa a guardar a primeira e a última campanha e a mandá-las nos fechamentos. É uma mudança pequena. Enquanto isso, o Google Analytics já mostra os totais por campanha.

**Como conferir:** abrir o site de teste com `?utm_source=teste&utm_medium=pago&utm_campaign=teste-origem`, comprar algo e ver a compra no painel administrativo com a campanha `teste-origem`.

### 6.6 Compra paga enviada à Meta pelo servidor (API de Conversões) (prioridade alta)

**Por que o Quad precisa.** O Quad vai anunciar na Meta (Instagram e Facebook), e a Meta só entrega bem os anúncios quando fica sabendo de cada venda. O site vai ligar o **Pixel da Meta** no navegador (para quem aceitar os cookies de marketing), mas o navegador perde muitas compras:
- bloqueadores de anúncio e o iPhone barram o Pixel;
- o **PIX é pago depois**: o aluno fecha a aba, paga no app do banco e nunca volta à página de confirmação, então o navegador não fica sabendo da compra.

Quem sabe com certeza que a compra foi paga é a API (pelo aviso do Pagar.me). Por isso a Meta recomenda mandar a compra também **pelo servidor**, na **API de Conversões** (Conversions API).

**O pedido.**

1. **Receber do site, no fechamento, os dados de marketing**, num campo opcional `marketing`, nas mesmas rotas do pedido 6.5 (`POST /api/loja/carrinho/eu/fechamento`, o fechamento do combo e a inscrição e matrícula gratuitas):

   ```json
   "marketing": {
     "consentimento": true,
     "fbp": "fb.1.1731400000000.1234567890",
     "fbc": "fb.1.1731400000000.IwAR…",
     "url": "https://www.quadconcursos.com.br/checkout"
   }
   ```

   - O site só manda `marketing` quando o aluno **aceitou os cookies de marketing** no aviso de cookies. Sem o campo (ou com `consentimento: false`), a API **não envia nada à Meta** para essa compra.
   - `fbp` e `fbc` são os cookies `_fbp` e `_fbc` que o Pixel cria no navegador; podem vir vazios. `url` é a página onde a compra foi fechada.
   - Tudo opcional e só guardado: a ausência **nunca** recusa a compra. Limitar o tamanho (por exemplo, 500 caracteres por campo).

2. **Quando a compra ficar paga** (o mesmo momento em que a API manda o e-mail de compra confirmada), enviar **um** evento `Purchase` por fechamento:

   `POST https://graph.facebook.com/{versão atual}/{ID_DO_PIXEL}/events?access_token={TOKEN}`

   ```json
   {
     "data": [{
       "event_name": "Purchase",
       "event_time": 1731400000,
       "event_id": "<id do fechamento>",
       "action_source": "website",
       "event_source_url": "<marketing.url>",
       "user_data": {
         "em": ["<sha256 do e-mail>"],
         "ph": ["<sha256 do celular>"],
         "external_id": ["<sha256 do id do aluno>"],
         "client_ip_address": "<IP do aluno no fechamento>",
         "client_user_agent": "<User-Agent do aluno no fechamento>",
         "fbp": "<marketing.fbp>",
         "fbc": "<marketing.fbc>"
       },
       "custom_data": {
         "currency": "BRL",
         "value": 277.00,
         "order_id": "<id do fechamento>",
         "content_type": "product",
         "content_ids": ["<id do item na API>"],
         "content_name": "TURMA CFO – BOPE [M]",
         "content_category": "PMBA",
         "contents": [{ "id": "<id do item na API>", "quantity": 1, "item_price": 277.00 }]
       }
     }]
   }
   ```

   - **`event_id` = id do fechamento.** O Pixel do site manda a mesma compra com esse mesmo id; com isso a Meta conta a venda **uma vez só**, mesmo chegando pelos dois caminhos. É o ponto mais importante do pedido.
   - **E-mail, celular e id vão só em SHA-256**, nunca em texto, e normalizados antes: e-mail em minúsculas e sem espaços; celular só com dígitos e com o 55 (ex.: `5571999999999`). IP e User-Agent vão sem hash (regra da Meta); guardar os do momento do fechamento.
   - `value` é o **total do fechamento** em reais (o `totalEmCentavos` dividido por 100), o mesmo valor que o site manda ao Google Analytics.
   - **Total zero não é venda e não vai como `Purchase`:** inscrição e matrícula gratuitas e compras com **cupom de 100%** (cortesia, bolsa, parceria; ex.: `QUAD30`, `SIMULADOSIQ`). O zero está certo e **nunca** deve ser trocado pela soma dos itens. Se quiserem medir as cortesias, mandar como evento personalizado `inscricao_cortesia` (mesmo `event_id`, `value: 0`, `contents` e o cupom em `custom_data.coupon`), o mesmo nome que o site usa no GA4 desde 12/11/2026. No GA4, 13 das 51 "compras" do último mês eram cortesias.
   - **O id de cada item é o id do item na API** (o mesmo de `compras[].item.id`, ver o item 3), fixo, e não o slug nem o id da compra: o slug muda quando o nome muda, e o id da compra muda a cada pedido. É o mesmo id que o Pixel do site manda no `ViewContent`, no `AddToCart` e no `Purchase`, para a Meta ligar quem viu o produto a quem comprou (públicos e catálogo). Vale em `content_ids` e em `contents[].id`.
   - **`content_name` e `content_category`:** com um item, o nome dele; com vários, os nomes separados por " + ". `content_category` é o concurso do item (ex.: `PMBA`, `PMPE`, `CFO PMBA`), o mesmo que a vitrine mostra; com itens de concursos diferentes, os concursos separados por " + "; sem concurso (ex.: produto da loja), omitir.
   - **`item_price` com o desconto:** o valor pago por unidade de cada item (o total da linha, já com o cupom, dividido pela quantidade), para a soma dos itens bater com `value`.
   - **Nunca atrasar nem quebrar a compra:** o envio é em segundo plano, com algumas novas tentativas se a Meta falhar, e a falha só vai para o log.
   - **Devolução:** não precisa avisar a Meta.

3. **Preço pago e id do item em cada compra do fechamento** (`GET /api/loja/fechamentos/{id}`): hoje `compras[]` traz só item (nome), variação e quantidade. Acrescentar `totalEmCentavos` e `descontoEmCentavos` de cada compra e o **`item.id`** (o id fixo do item, o mesmo do item 2), para o `Purchase` do navegador mandar os mesmos ids do servidor quando o aluno volta para a confirmação do PIX. Sem isso, quando o aluno paga o PIX em outro aparelho ou outra sessão, o site não sabe o preço de cada item de um pedido com vários itens e o GA4 registra o item com preço 0 (aconteceu com a TURMA CFO – BOPE [M] e o SIMULADO 80 SD PMBA 15/11).

4. **Configuração por variáveis de ambiente**, nunca no código: `META_PIXEL_ID` (o Pixel do site, criado em 13/11/2026: **1182737094707896**, "Quad Concursos — Site") e `META_CAPI_TOKEN`. O token é gerado por quem administra a conta de anúncios do Quad no **Gerenciador de Eventos** da Meta (Pixel → Configurações → API de Conversões → Gerar token de acesso) e entregue à equipe do backend por um canal seguro; fica só no servidor (no cofre de segredos da API), nunca no navegador nem no git. Sem as variáveis, a API simplesmente não envia.
   - **`META_TEST_EVENT_CODE`**, só no ambiente de teste: o código `TEST…` da aba **Testar eventos** do Gerenciador de Eventos, mandado no campo `test_event_code` de cada envio. Assim as compras do site de teste (pagas no sandbox do Pagar.me) aparecem só em "Testar eventos" e não contam nos anúncios. Em produção fica **vazio**, e aí o campo não vai.

**LGPD.** O envio usa dados pessoais (e-mail e celular, em hash) para medir anúncios: por isso fica **preso ao consentimento de marketing**, o mesmo que liga o Pixel no navegador. A política de privacidade precisa citar a Meta como destinatária desses dados; a confirmação fica com quem fez a revisão jurídica.

**Do lado do site:** o site já liga o Pixel (desde 13/11/2026), manda o `Purchase` do navegador com `eventID` igual ao id do fechamento e passa a mandar o campo `marketing` nos fechamentos quando a API aceitar. O site também passa a usar o **id do item na API** em todos os eventos (hoje usa o slug na página do produto e o id da compra na confirmação do PIX) e manda `content_category` quando a vitrine trouxer o concurso de cada item. O `fbclid` do link do anúncio não precisa vir à parte: o Pixel o transforma no cookie `_fbc`, que já vai em `marketing.fbc`. A origem da venda (UTMs, primeira e última) segue no pedido 6.5.

**Como conferir:** no Gerenciador de Eventos, aba **Testar eventos**, copiar o código de teste (`TEST…`) e mandá-lo no campo `test_event_code` do envio (só no ambiente de teste). Fazer uma compra pelo site de teste com os cookies de marketing aceitos: o `Purchase` deve aparecer **duas vezes, uma do navegador e uma do servidor, marcado como "desduplicado"**, com o valor certo.

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
- Professores reais (24/10/2026): os 27 da vitrine de produção (nome, graduação e matérias), com os turnos da planilha da coordenação, copiados para o banco local com contas fictícias (`prof.<nome>@exemplo.com`, senha `Quad@2026`, CPF gerado). Foram criadas as matérias que faltavam. Os professores de teste Ana Souza, Danilo Moura e Danilo Mourão ribeiro foram desativados (o "Evento de teste (Claude)" passou para o Danilo Ribeiro Moura). ⚠️ **Possível erro na API:** desativar a conta do professor de teste "Davi" (`DELETE /api/usuarios/{id}`) responde 409 `CPF_JA_CADASTRADO`, porque outra conta de professor, já inativa, tem o mesmo CPF e a desativação regrava a conta inteira, esbarrando na regra de CPF único. Como a API não troca CPF, a conta foi desativada direto no banco local (`status = INATIVO`). Vale o backend fazer a desativação não depender do CPF
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
