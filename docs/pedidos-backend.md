# Pedidos para o backend — Site do Quad Concursos

**De:** time do site (Next.js) · **Atualizado em:** 19/11/2026
**Base:** o **site oficial no ar** em `https://quadconcursos.com.br` (na AWS desde 18/11/2026; o endereço com www redireciona para ele), ligado à API de produção `https://api.quadconcursos.com.br`, já com vendas; leituras públicas da API de produção e testes na API local (`localhost:8080`).

Este documento lista **só o que ainda falta**. Os pedidos já atendidos saíram daqui e ficam no histórico do git (por exemplo: material digital em PDF à venda, acréscimo do parcelamento pago pelo aluno, atividades gratuitas na vitrine e matrícula gratuita em turma, limite de tentativas por rota, lista de lotes e preço cheio na vitrine, CORS do `Idempotency-Key`, falhas de segurança, cadastro e perfil do aluno, esqueci a senha, aceite dos termos, login em cookie, carrinho no servidor, cupons, slug e nível da turma na vitrine, preços em centavos e lotes, vitrine de professores, chaves de sandbox do Pagar.me, combos, impresso e digital no mesmo material, verificação do celular e e-mails da compra; e, no recado da API de 19/11/2026, a origem da venda em cada compra (6.5), a compra paga enviada à Meta pelo servidor (6.6), o fim das inscrições do presencial pela API, o número do pedido, o prazo de venda, o combo e a variação na compra, a descrição como foi digitada e as vagas ilimitadas).

> **13/11/2026: o site oficial está no ar e vendendo**, e por isso saíram da lista os pedidos do lançamento (conferidos hoje na API de produção):
> - **1.2 CORS e cookies no domínio oficial:** a pré-verificação vinda de `https://www.quadconcursos.com.br` responde 200, com a origem liberada. Desde 19/11/2026 o site atende em `https://quadconcursos.com.br` (sem www), e a API também libera essa origem (conferido pelo backend na pré-verificação do carrinho e da troca do e-mail).
> - **1.3 Domínio no Pagar.me** e **1.4 API e site publicados juntos:** as vendas do site estão acontecendo.
> - **1.6 Endereço do site nos e-mails:** a `SITE_URL` aponta para `https://quadconcursos.com.br`.
> - **4.7 Página do site depois de confirmar o e-mail:** `GET /auth/email/confirmacao` responde `303` para `https://quadconcursos.com.br/confirmar-email?resultado=…`, que abre a tela do site.
> - **3.1 Foto do professor na medida original:** as fotos novas chegam em 1080 × 1350 (4:5), e 21 dos 25 professores da vitrine já têm foto. Os cadastros de teste ("Danilo Mourão ribeiro" e "Davi") não aparecem mais.
>
> **O site de teste** (`teste.quadconcursos.com.br`) não é mais liberado no CORS da API de produção (responde 403). Os testes agora são feitos no site oficial ou no ambiente local.

> **Banco compartilhado:** a API e o banco também atendem o **app Viver o Quad**. Toda mudança pedida aqui precisa considerar o impacto no app; os itens em que isso pesa estão marcados com ⚠️.

**Padrões que valem para tudo:**
- Manter o formato de erro atual (`status`, `title`, `detail`, `codigo`, `erros[]`). O site já lê esse formato.
- Rotas "do próprio usuário" pegam o id **da sessão**, nunca de um parâmetro enviado pelo cliente.
- Rotas públicas (sem login) só levam dados que qualquer pessoa pode ver, nunca dados de alunos.

## Resumo

| # | Pedido | Prioridade |
|---|---|---|
| 1.5 | Entrada pelo Google: conferir a origem do domínio sem www | Alta |
| 2.7 | Imagens: medida mínima, proporção e formato no envio pelo console | Média |
| 3 | Professores: foto dos 4 que faltam | Média |
| 4.6 | Conferir o CPF na Receita no cadastro (cpfcnpj.com.br) | Média |
| 5.4 | Textos de venda da turma e programação do evento | Média |
| 5.5 | Notícias de concursos na barra do topo, editáveis pelo console e atualizadas em tempo real | Média |
| 6.3 | Armazenamento de arquivos no ambiente local (endereço do S3 configurável) | Média |
| 4.4 | `GET /api/usuarios/eu` para conta sem cadastro de aluno | Baixa |
| 4.5 | Foto de perfil | Baixa |
| 5.3 | Simulados depois da aplicação: a categoria de duas versões impressas | Baixa |
| 6.4 | Aprovados, depoimentos em vídeo e blog pela API | Baixa |

---

## 1. Entrada pelo Google no domínio oficial

### 1.5 Origens autorizadas no Google Cloud

**Entregue em 24/10/2026** (`POST /auth/google`, só para contas que já existem). O client ID está em `GOOGLE_CLIENT_IDS` na API de produção e em `NEXT_PUBLIC_GOOGLE_CLIENT_ID` no site.

**Conferir:** no mesmo client ID, em "Origens JavaScript autorizadas" do Google Cloud, precisa estar **`https://quadconcursos.com.br` (sem www)**, que é o endereço do site desde 19/11/2026 (o com www redireciona para ele); manter também `https://www.quadconcursos.com.br`. Sem isso, o botão "Entrar com o Google" mostra o erro `origin_mismatch`. O site não consegue conferir isso de fora: basta entrar com o Google em `https://quadconcursos.com.br/entrar` com uma conta que já existe.

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

`GET /api/professores/vitrine`, `/{id}` e `/slug/{slug}` são públicos, e o site usa (home, página do professor, sitemap e autor do blog). A **minibio** é a coluna `graduacao` (decisão de 23/10/2026): deve ser preenchida como uma apresentação curta (2 ou 3 linhas, até 200 caracteres), não só o nome do curso.

**Falta (conferido em 19/11/2026):** a foto de **Danilo Reis, Omar Junior, Paulo Junior e Rodrigo Gomes**, os 4 professores da vitrine ainda sem `fotoUrl`. As outras 21 já chegam na medida original (1080 × 1350, 4:5), como pedido.

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

### 4.4 `GET /api/usuarios/eu` para conta sem cadastro de aluno (prioridade baixa)

**Por que o site precisa.** Com o login em cookie, o site não lê mais o token. Ele pega o id e os dados da conta em `GET /api/alunos/eu`, que responde **409** para professor e administrador. Nesse caso, o site mostra só "Minha conta", sem nome nem e-mail.

**O pedido.** `GET /api/usuarios/eu` para qualquer conta logada, com `{ id, nome, email, telefone, papeis }`. Só afeta quem da equipe entrar no site com a própria conta.

### 4.5 Foto de perfil (prioridade baixa)

**O pedido.** `POST /api/usuarios/eu/foto` (multipart), só JPG e PNG, até 2 MB, guardada no S3. A URL passa a vir em `GET /api/alunos/eu` (`fotoUrl`).

---

## 5. Produtos que a API ainda não cobre

### 5.3 Simulados depois da aplicação: acertos no cadastro

**Atendido (13/11/2026).** O backend entregou a versão em PDF e a impressa, conforme o guia [simulados-no-site-guia-da-api.txt](simulados-no-site-guia-da-api.txt), e o site já usa tudo e está no ar:
- "Edições anteriores" e "Individuais" na Central de Simulados, com o PDF e o impresso juntos na mesma edição;
- a compra pelo carrinho (`atividade` SIMULADO na versão em PDF; `itemId` com `IMPRESSO` na impressa);
- os PDFs na área do aluno (`/api/alunos/eu/simulados-em-pdf` e o download marcado) e a retirada do impresso em Compras (`entrega`).

Preços sempre em centavos, em todas as versões (confirmado em 13/11/2026). O site mostra "Aplicado em" como a véspera da abertura da venda (regra do guia: a versão abre no dia seguinte ao último dia do presencial); se PDF e impresso abrirem em dias diferentes, vale a abertura mais antiga.

**Resolvido (19/11/2026):** o PDF do 78 IPC/PCBA veio com `origemId`, e o PDF do 78 SD PMBA voltou à vitrine.

**Falta (conferido em 19/11/2026):** a **categoria** de "SIMULADO 77 IPC/PCBA (impresso)" e "SIMULADO 80 IPCBA (impresso)", que continuam em **"Simulado Digital"**, sendo impressas. Para o site é só cosmético.

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

As outras quatro viraram pedidos. A 6.5 (origem da venda) e a 6.6 (compra paga enviada à Meta pelo servidor) foram atendidas, e o site manda os dois campos desde 16/11/2026; continuam as duas abaixo:

### 6.3 Armazenamento de arquivos no ambiente local

**Situação:** no ambiente local, o download de materiais responde 503 "nenhum bucket foi configurado". Desde 28/10/2026 isso vale também para o **material digital da loja** (o PDF fica no mesmo bucket, sob `loja/itens/`): localmente não dá para enviar o PDF nem baixar o comprado, e o PDF sem arquivo não entra na vitrine. Para testar a venda, o site precisou marcar um arquivo fictício direto no banco local. A API só fala com o S3 da AWS: o endereço do serviço não é configurável (`ConfiguracaoDoArmazemDeMateriais` cria o cliente só com a região), então um armazenamento de teste local (MinIO, compatível com o S3) não funciona sem mudança no código.

**O pedido.** Uma propriedade opcional com o endereço do S3 (por exemplo `api.materiais.endpoint`, vazia em produção) e o modo de caminho (`forcePathStyle`) ligado quando ela existir. Com isso, o ambiente local usa um MinIO em Docker e produção continua na AWS sem mudar nada. A alternativa é um bucket de teste na própria AWS, com credenciais de teste.

### 6.4 Aprovados, depoimentos em vídeo e blog

**Resposta:** vão vir da API. **O pedido**, quando o Quad quiser publicar:
- **Aprovados:** nome, foto, concurso, colocação, turma e ano, e um depoimento curto, numa rota pública.
- **Depoimentos em vídeo:** título e link do vídeo (YouTube ou arquivo).
- **Blog:** título, slug, resumo, texto, autor (professor), categoria, imagem de capa e data de publicação. O blog está fora do ar no site desde 23/10/2026 e volta quando a API tiver os artigos.

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
