# Modelos dos e-mails da compra (pedido 6.2)

**Para:** backend (API Java) · **De:** time do site · **Criado em:** 27/10/2026

Os textos abaixo são para a API mandar quando a compra muda de situação. Eles seguem o padrão dos e-mails que já existem (`MensagemDeConfirmacao`, `MensagemDeRedefinicao`):

- assunto, texto simples e um HTML mínimo, montados no código e enviados pelo `EnviadorDeLinkNoSes` (mesmo remetente, mesmo envelope);
- **sem o nome do aluno e sem imagem**, e nenhum link no assunto;
- os links levam ao **site**, que mostra o detalhe com o aluno logado. O e-mail diz o essencial (o que foi comprado, o valor, o prazo), mas nunca CPF, endereço ou dados do cartão;
- a última frase convida a responder, porque o remetente é a caixa do suporte.

## Variáveis

| Variável | O que é | Exemplo |
|---|---|---|
| `{site}` | Endereço do site, numa propriedade nova (ex.: `SITE_URL`). Local: `http://localhost:3000` | `https://quadconcursos.com.br` |
| `{id}` | Id do fechamento (o mesmo de `GET /api/loja/fechamentos/{id}`) | `8f3c…` |
| `{total}` | Total pago, em reais | `R$ 997,00` |
| `{itens}` | Uma linha por item: nome, variação ou tamanho, quantidade quando for maior que 1, e valor | `RONDESP 3 (Tarde), R$ 997,00` |
| `{forma}` | Forma de pagamento por extenso | `PIX` · `Cartão de crédito em 3x` · `Dois cartões` |
| `{prazo}` | Validade do PIX, no horário de Brasília | `27/10/2026 às 14h30` |
| `{atividade}` | Nome da turma, evento ou simulado (só nos gratuitos) | `Aulão de Véspera` |

As datas saem no fuso `America/Sao_Paulo`, no formato `dd/MM/yyyy 'às' HH'h'mm`. Os valores saem com vírgula e ponto (`R$ 1.197,00`).

## Quando cada e-mail sai

| # | E-mail | Quando |
|---|---|---|
| 1 | PIX aguardando pagamento | O fechamento por PIX é criado (`AGUARDANDO_PAGAMENTO`) |
| 2 | Compra confirmada | A compra vira `PAGA` (cartão na hora, ou PIX quando o aviso do Pagar.me chega) |
| 3 | Prazo do PIX vencido | `AGUARDANDO_PAGAMENTO` → `EXPIRADA` |
| 4 | Valor devolvido | `ESTORNADA` |
| 5 | Inscrição gratuita confirmada | `POST /api/inscricoes/eu` dá certo (evento ou simulado) |
| 6 | Matrícula gratuita confirmada | `POST /api/matriculas/eu` dá certo |

O pedido 6.2 falava em dois e-mails, "compra confirmada" e "acesso liberado". Como a API libera o acesso no mesmo instante em que a compra vira `PAGA`, eles viraram um só (o 2). Não precisa de e-mail para o cartão recusado (`RECUSADA`), porque o site mostra a recusa na hora, nem para o boleto, que saiu do site.

Cada e-mail sai **uma vez por mudança de situação**. Se o aviso do Pagar.me chegar repetido, não pode sair um segundo "Compra confirmada".

---

## 1. PIX aguardando pagamento

**Assunto:** `Seu PIX está aguardando pagamento - Quad Concursos`

**Texto:**

```
Recebemos o seu pedido. Para concluir a compra, pague o PIX de {total} até {prazo}.

O QR Code e o código copia e cola estão no endereço abaixo:

{site}/checkout/pagamento/{id}

O que você pediu:
{itens}

Depois desse prazo, o PIX deixa de valer e as vagas reservadas são liberadas. Assim que o pagamento for confirmado, você recebe outro e-mail e o acesso fica disponível na sua área do aluno.

Se você não fez este pedido, ignore este e-mail.

Precisa de ajuda? Responda este e-mail.
```

**HTML:**

```html
<p>Recebemos o seu pedido. Para concluir a compra, pague o PIX de <strong>{total}</strong> até <strong>{prazo}</strong>.</p>
<p><a href="{site}/checkout/pagamento/{id}">Ver o QR Code e o código do PIX</a></p>
<p>O que você pediu:<br>{itens, um por linha, separados por <br>}</p>
<p>Depois desse prazo, o PIX deixa de valer e as vagas reservadas são liberadas. Assim que o pagamento for confirmado, você recebe outro e-mail e o acesso fica disponível na sua área do aluno.</p>
<p>Se o botão não abrir, copie este endereço no navegador:<br>{site}/checkout/pagamento/{id}</p>
<p>Se você não fez este pedido, ignore este e-mail.</p>
<p>Precisa de ajuda? Responda este e-mail.</p>
```

## 2. Compra confirmada

**Assunto:** `Compra confirmada - Quad Concursos`

**Texto:**

```
Seu pagamento foi confirmado e a compra está concluída.

O que você comprou:
{itens}

Total: {total}
Forma de pagamento: {forma}

O acesso já está liberado na sua área do aluno:

{site}/aluno

Turmas ficam em "Minhas turmas", eventos e simulados em "Meus eventos", e materiais em "Meus materiais". Os produtos da loja são retirados no Quad: Rua Leolinda Bacelar, 245, Kalilândia, Feira de Santana (BA), de segunda a sexta, das 8h às 21h, e no sábado, das 8h às 12h.

Você pode desistir da compra em até 7 dias, como garante o Código de Defesa do Consumidor. Basta responder este e-mail.

Precisa de ajuda? Responda este e-mail.
```

**HTML:**

```html
<p>Seu pagamento foi confirmado e a compra está concluída.</p>
<p>O que você comprou:<br>{itens, um por linha, separados por <br>}</p>
<p>Total: <strong>{total}</strong><br>Forma de pagamento: {forma}</p>
<p><a href="{site}/aluno">Ir para a área do aluno</a></p>
<p>Turmas ficam em "Minhas turmas", eventos e simulados em "Meus eventos", e materiais em "Meus materiais". Os produtos da loja são retirados no Quad: Rua Leolinda Bacelar, 245, Kalilândia, Feira de Santana (BA), de segunda a sexta, das 8h às 21h, e no sábado, das 8h às 12h.</p>
<p>Você pode desistir da compra em até 7 dias, como garante o Código de Defesa do Consumidor. Basta responder este e-mail.</p>
<p>Se o botão não abrir, copie este endereço no navegador:<br>{site}/aluno</p>
<p>Precisa de ajuda? Responda este e-mail.</p>
```

O parágrafo da retirada só entra quando a compra tem produto da loja.

## 3. Prazo do PIX vencido

**Assunto:** `O prazo do seu PIX venceu - Quad Concursos`

**Texto:**

```
O prazo para pagar o PIX de {total} venceu e o pedido foi cancelado. Nada foi cobrado, e as vagas reservadas foram liberadas.

O que estava no pedido:
{itens}

Se ainda quiser esses itens, faça o pedido de novo pelo site:

{site}

Precisa de ajuda? Responda este e-mail.
```

**HTML:**

```html
<p>O prazo para pagar o PIX de <strong>{total}</strong> venceu e o pedido foi cancelado. Nada foi cobrado, e as vagas reservadas foram liberadas.</p>
<p>O que estava no pedido:<br>{itens, um por linha, separados por <br>}</p>
<p>Se ainda quiser esses itens, <a href="{site}">faça o pedido de novo pelo site</a>.</p>
<p>Precisa de ajuda? Responda este e-mail.</p>
```

## 4. Valor devolvido

**Assunto:** `Devolução do seu pagamento - Quad Concursos`

**Texto:**

```
O pagamento de {total} foi estornado, e o acesso aos itens abaixo foi encerrado:
{itens}

No cartão de crédito, a devolução aparece na fatura conforme o prazo do seu banco, normalmente em uma ou duas faturas. No PIX, o valor volta para a conta de onde saiu o pagamento.

Os detalhes ficam em "Minhas compras":

{site}/aluno/compras

Precisa de ajuda? Responda este e-mail.
```

**HTML:**

```html
<p>O pagamento de <strong>{total}</strong> foi estornado, e o acesso aos itens abaixo foi encerrado:<br>{itens, um por linha, separados por <br>}</p>
<p>No cartão de crédito, a devolução aparece na fatura conforme o prazo do seu banco, normalmente em uma ou duas faturas. No PIX, o valor volta para a conta de onde saiu o pagamento.</p>
<p><a href="{site}/aluno/compras">Ver minhas compras</a></p>
<p>Precisa de ajuda? Responda este e-mail.</p>
```

Num estorno parcial (só um item), `{total}` é o valor devolvido e `{itens}` só o item estornado.

## 5. Inscrição gratuita confirmada

**Assunto:** `Inscrição confirmada - Quad Concursos`

**Texto:**

```
Sua inscrição em {atividade} está confirmada.

Data, horário e local ficam em "Meus eventos", na sua área do aluno:

{site}/aluno/eventos

Se não puder ir, avise respondendo este e-mail, para que a vaga fique com outra pessoa.

Precisa de ajuda? Responda este e-mail.
```

**HTML:**

```html
<p>Sua inscrição em <strong>{atividade}</strong> está confirmada.</p>
<p>Data, horário e local ficam em "Meus eventos", na sua área do aluno.</p>
<p><a href="{site}/aluno/eventos">Ver meus eventos</a></p>
<p>Se não puder ir, avise respondendo este e-mail, para que a vaga fique com outra pessoa.</p>
<p>Precisa de ajuda? Responda este e-mail.</p>
```

## 6. Matrícula gratuita confirmada

**Assunto:** `Matrícula confirmada - Quad Concursos`

**Texto:**

```
Sua matrícula na turma {atividade} está confirmada.

Horários, materiais e avisos da turma ficam em "Minhas turmas", na sua área do aluno:

{site}/aluno/turmas

Precisa de ajuda? Responda este e-mail.
```

**HTML:**

```html
<p>Sua matrícula na turma <strong>{atividade}</strong> está confirmada.</p>
<p>Horários, materiais e avisos da turma ficam em "Minhas turmas", na sua área do aluno.</p>
<p><a href="{site}/aluno/turmas">Ver minhas turmas</a></p>
<p>Precisa de ajuda? Responda este e-mail.</p>
```

---

## Pontos a decidir

- **Marca no assunto:** os e-mails da conta saem como "- Viver o Quad". Nestes, que nascem da compra no site, usei "- Quad Concursos". Se o Quad preferir uma marca só, basta trocar o sufixo.
- **Código do PIX no e-mail:** o modelo 1 manda só o link. O código copia e cola também pode ir no corpo, para quem quer pagar sem abrir o site. Ele não é dado pessoal, mas é longo e vence junto com o prazo.
- **Endereço da retirada:** está escrito no texto. Se a API já tiver esse dado em algum cadastro, é melhor ler de lá.

## O que muda no site quando os e-mails existirem

Hoje as telas de confirmação não falam em e-mail e mandam o aluno para a área do aluno, porque o e-mail ainda não existe. Quando os e-mails estiverem no ar, elas passam a dizer:
- na compra aprovada: "Enviamos os detalhes para o seu e-mail";
- no PIX aguardando pagamento: "O código do PIX também foi para o seu e-mail";
- na inscrição e na matrícula gratuitas: "Enviamos a confirmação para o seu e-mail".

Avisem quando os e-mails estiverem no ar.
