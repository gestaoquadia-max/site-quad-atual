# Cupons de desconto — Regras de negócio

Documento de referência para todos os prompts desta pasta. Reproduz o comportamento dos cupons do WooCommerce usado hoje em quadconcursos.com.br, com as decisões do [README](README.md).

## 1. Campos do cupom

O cadastro tem três abas, como no WordPress.

### Geral

| Campo | Tipo | Regra |
|---|---|---|
| Código | texto | Obrigatório. Único entre os cupons que não estão na lixeira. Comparação **sem diferenciar maiúsculas e minúsculas** e sem espaços nas pontas (`materialrondesp` = `MATERIALRONDESP`). Letras, números, `-` e `_`, até 50 caracteres. Botão "Gerar código" sugere um código aleatório de 8 caracteres |
| Descrição | texto longo | Opcional. Uso interno, nunca aparece para o aluno. Ex.: "Cupom criado para os alunos da turma Rondesp [N] (19/10) adquirirem o material didático - Amanda" |
| Tipo de desconto | `PERCENTUAL` · `FIXO_CARRINHO` · `FIXO_PRODUTO` | Obrigatório |
| Valor do cupom | número | Obrigatório. `PERCENTUAL`: de 0,01 a 100. `FIXO_*`: valor em reais maior que zero, guardado em **centavos** |
| Data de expiração | data | Opcional. Vazio = não expira. O cupom vale até 23:59:59 desse dia no fuso `America/Bahia` |

### Restrição de uso

| Campo | Regra |
|---|---|
| Gasto mínimo | Opcional, em centavos. Comparado com o **subtotal do carrinho antes de qualquer desconto** |
| Gasto máximo | Opcional, em centavos. Mesmo subtotal. Se os dois existirem, mínimo ≤ máximo |
| Uso individual apenas | Se marcado, o cupom não pode ser usado junto com outros cupons (ver 4.3) |
| Excluir itens em oferta | Se marcado, cupons por item não descontam itens em oferta, e cupons `FIXO_CARRINHO` ficam inválidos se houver qualquer item em oferta no carrinho |
| Produtos | Lista de itens da loja (turmas, materiais, eventos) aos quais o cupom se aplica |
| Excluir produtos | Lista de itens aos quais o cupom **não** se aplica |
| Categorias de produto | Lista de categorias às quais o cupom se aplica (tipo do item e, se existir, categoria do catálogo) |
| Excluir categorias | Lista de categorias às quais o cupom não se aplica |
| E-mails permitidos | Lista de e-mails. Vazio = qualquer aluno. Aceita curinga `*` (ex.: `*@quadconcursos.com.br`). Comparação sem diferenciar maiúsculas e minúsculas, com o e-mail da conta do aluno logado |

### Limites de uso

| Campo | Regra |
|---|---|
| Limite de uso por cupom | Opcional, inteiro ≥ 1. Quantas vezes o cupom pode ser usado no total, somando todos os alunos. Vazio = ilimitado |
| Limitar o uso para X itens | Opcional, inteiro ≥ 1. Só para `PERCENTUAL` e `FIXO_PRODUTO`. Quantas unidades de itens elegíveis recebem desconto, a partir das de **maior preço**. Vazio = todas |
| Limite de uso por cliente | Opcional, inteiro ≥ 1. Quantas vezes o mesmo aluno pode usar o cupom. Vazio = ilimitado |

### Controle

- **Situação:** `PUBLICADO`, `RASCUNHO` ou `LIXEIRA`. Só `PUBLICADO` funciona no checkout. Lixeira pode ser restaurada.
- **Contador de usos**, quem criou, quem alterou por último, datas de criação e alteração.

## 2. Item elegível

Um item do carrinho é elegível para um cupom quando **todas** as condições abaixo são verdadeiras:

1. "Produtos" e "Categorias" estão vazios, **ou** o item está em "Produtos", **ou** alguma categoria do item está em "Categorias" (é um **OU** entre as duas listas);
2. o item não está em "Excluir produtos";
3. nenhuma categoria do item está em "Excluir categorias";
4. se "Excluir itens em oferta" estiver marcado, o item não está em oferta.

Itens gratuitos (preço zero) nunca recebem desconto.

## 3. Validação do cupom

Feita na ordem abaixo. A primeira que falhar recusa o cupom com o código de motivo e a mensagem ao aluno.

| # | Condição | Motivo | Mensagem ao aluno |
|---|---|---|---|
| 1 | Existe e está `PUBLICADO` | `CUPOM_INEXISTENTE` | Cupom não encontrado. Confira o código. |
| 2 | Não está expirado | `CUPOM_EXPIRADO` | Este cupom expirou. |
| 3 | Usos confirmados + reservados < limite de uso | `CUPOM_ESGOTADO` | Este cupom atingiu o limite de usos. |
| 4 | E-mail do aluno está em "E-mails permitidos" | `CUPOM_EMAIL_NAO_PERMITIDO` | Este cupom não está disponível para a sua conta. |
| 5 | Usos do aluno < limite por cliente | `CUPOM_LIMITE_CLIENTE` | Você já usou este cupom o número máximo de vezes. |
| 6 | Subtotal ≥ gasto mínimo | `CUPOM_GASTO_MINIMO` | O valor mínimo para usar este cupom é R$ X. |
| 7 | Subtotal ≤ gasto máximo | `CUPOM_GASTO_MAXIMO` | O valor máximo para usar este cupom é R$ X. |
| 8 | `FIXO_CARRINHO` com "Excluir itens em oferta": nenhum item em oferta no carrinho | `CUPOM_ITEM_EM_OFERTA` | Este cupom não vale para carrinhos com itens em oferta. |
| 9 | `FIXO_CARRINHO`: nenhum item do carrinho está em "Excluir produtos" ou "Excluir categorias" | `CUPOM_ITEM_EXCLUIDO` | Este cupom não vale para um dos itens do carrinho. |
| 10 | Há pelo menos um item elegível | `CUPOM_SEM_ITEM_ELEGIVEL` | Este cupom não vale para os itens do seu carrinho. |
| 11 | Regras de uso individual (4.3) | `CUPOM_USO_INDIVIDUAL` | O cupom X não pode ser usado junto com outros cupons. |
| 12 | O código ainda não foi aplicado neste carrinho | `CUPOM_JA_APLICADO` | Este cupom já foi aplicado. |

Cupom em rascunho ou na lixeira responde `CUPOM_INEXISTENTE`, para não revelar que existe.

## 4. Cálculo do desconto

Todo o cálculo é em **centavos inteiros**. Arredondamento de meio para cima (`HALF_UP`) por unidade. O desconto de uma linha nunca passa do valor que ainda resta nela; o total do pedido nunca fica negativo.

### 4.1 Por tipo

- **`PERCENTUAL`:** para cada unidade elegível (respeitando "Limitar o uso para X itens"), desconto = `arredondar(valorRestanteDaUnidade × percentual / 100)`.
- **`FIXO_PRODUTO`:** para cada unidade elegível (respeitando "Limitar o uso para X itens"), desconto = `min(valor, valorRestanteDaUnidade)`.
- **`FIXO_CARRINHO`:** desconto total = `min(valor, soma do valor restante das linhas elegíveis)`. Esse total é dividido entre as linhas elegíveis na proporção do valor restante de cada uma; os centavos que sobrarem do arredondamento vão, um a um, para as linhas de maior valor, de modo que a soma das linhas seja exatamente o desconto total. "Limitar o uso para X itens" não se aplica.

### 4.2 Vários cupons

Os cupons são aplicados **na ordem em que o aluno os adicionou**. Cada um calcula sobre o valor que restou depois dos anteriores.

### 4.3 Uso individual

- Ao aplicar um cupom com "Uso individual", os outros cupons do carrinho são **removidos**, e o aluno é avisado.
- Se o carrinho já tem um cupom com "Uso individual", um novo cupom é recusado com `CUPOM_USO_INDIVIDUAL`.

### 4.4 Recalcular sempre

Os cupons são revalidados e o desconto é recalculado sempre que o carrinho muda (item, quantidade, login) e, de novo, **no fechamento**. Um cupom que deixa de valer é retirado do carrinho, e a resposta informa qual e por quê.

## 5. Contagem de usos

| Momento | Efeito |
|---|---|
| Fechamento criado | Uso `RESERVADO` para o cupom e o aluno. Conta para os limites |
| Pagamento confirmado (aviso do Pagar.me) | Uso passa a `CONFIRMADO` |
| Fechamento cancelado ou expirado | Uso `LIBERADO`; deixa de contar |
| Pedido estornado | Uso continua `CONFIRMADO` |

A reserva precisa ser à prova de concorrência: dois alunos fechando ao mesmo tempo com o último uso disponível não podem ambos conseguir.

## 6. Segurança

- O site nunca envia valor de desconto nem preço final. Envia só os itens e os códigos; o backend calcula (docs/seguranca.md, S8).
- Limite de tentativas na validação de cupom (ex.: 10 por minuto por aluno) para impedir a descoberta de códigos por tentativa e erro.
- Rotas de cadastro de cupom só para administradores.
- Toda criação, alteração e exclusão de cupom fica registrada (quem, quando, o que mudou).

## 7. Casos de referência

Carrinho usado nos exemplos:

| Item | Tipo | Preço | Qtd |
|---|---|---|---|
| Turma A | turma | R$ 997,00 | 1 |
| Material B | material | R$ 49,90 | 2 |
| Evento C | evento | Gratuito | 1 |

Subtotal: **R$ 1.096,80**.

| # | Cupom | Resultado esperado |
|---|---|---|
| 1 | `PERCENTUAL` 10%, sem restrições | Desconto R$ 109,68 (99,70 + 4,99 × 2). Total R$ 987,12 |
| 2 | `FIXO_CARRINHO` R$ 50,00 | Desconto R$ 50,00, dividido entre A e B; soma das linhas = R$ 50,00 exatos |
| 3 | `FIXO_PRODUTO` R$ 10,00, Produtos = [Material B] | Desconto R$ 20,00 |
| 4 | `FIXO_PRODUTO` R$ 60,00, Produtos = [Material B] | Desconto R$ 99,80 (limitado ao preço) |
| 5 | `PERCENTUAL` 100%, Produtos = [Material B] | Desconto R$ 99,80. Total R$ 997,00 |
| 6 | `FIXO_PRODUTO` R$ 10,00, Produtos = [Material B], limitar a 1 item | Desconto R$ 10,00 |
| 7 | Qualquer tipo, gasto mínimo R$ 1.200,00 | Recusado: `CUPOM_GASTO_MINIMO` |
| 8 | `FIXO_CARRINHO` R$ 2.000,00 | Desconto R$ 1.096,80. Total R$ 0,00 (sem cobrança) |
| 9 | Caso 1 e depois caso 2 | 10% → R$ 987,12; menos R$ 50,00 → total R$ 937,12 |
| 10 | Caso 1 aplicado; depois um cupom com "Uso individual" | O caso 1 é removido; vale só o novo |
| 11 | Cupom com "Uso individual" aplicado; depois o caso 1 | Recusado: `CUPOM_USO_INDIVIDUAL` |
| 12 | Expiração = ontem | Recusado: `CUPOM_EXPIRADO`. Expiração = hoje: aceito |
| 13 | E-mails = [`atendimentoquad@gmail.com`], aluno `outro@gmail.com` | Recusado: `CUPOM_EMAIL_NAO_PERMITIDO` |
| 14 | E-mails = [`*@quadconcursos.com.br`], aluno `Fulano@QuadConcursos.com.br` | Aceito |
| 15 | `FIXO_CARRINHO` R$ 50,00, Excluir produtos = [Turma A] | Recusado: `CUPOM_ITEM_EXCLUIDO` |
| 16 | `PERCENTUAL` 10%, Excluir produtos = [Turma A] | Aceito; desconto só em B: R$ 9,98 |
| 17 | Limite de uso = 1, com 1 uso reservado em outro fechamento | Recusado: `CUPOM_ESGOTADO` |
| 18 | Código digitado como ` materialRondesp ` | Encontra o cupom `materialrondesp` |
