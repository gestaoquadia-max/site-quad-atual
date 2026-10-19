# Prompt 2 — Backend: validação, cálculo e uso do cupom na compra

> Rodar no repositório da **API do Quad (Java)**, depois do prompt 1. Anexe junto o arquivo `00-regras-de-negocio.md`.

---

## Contexto

O cadastro de cupons (`Cupom`, `CupomUso` e rotas `/api/admin/cupons`) já existe. Agora o aluno precisa aplicar cupons no carrinho do servidor e pagar com o desconto. O site **nunca** calcula preço ou desconto: manda os itens e os códigos, e a API devolve os valores (docs/seguranca.md do site, S8).

Fluxo de compra que já existe na API:
- `GET`/`DELETE /api/loja/carrinho/eu`, `PUT /api/loja/carrinho/eu/linhas`, `DELETE .../linhas/{linhaId}`;
- `POST /api/loja/carrinho/eu/fechamento` (uma cobrança só, com `Idempotency-Key`);
- `GET /api/loja/fechamentos/{id}`, `.../conciliacao`, `.../cancelamento`;
- aviso do Pagar.me (webhook) que confirma o pagamento.

As regras estão nas seções 2 a 7 de `00-regras-de-negocio.md`. Siga o documento; se encontrar contradição, aponte.

## Antes de começar

1. Leia o código do carrinho, do fechamento, do webhook do Pagar.me e da liberação de acesso.
2. Confira a unidade dos valores. O carrinho hoje usa `precoUnitarioEmReais`/`totalEmReais` (reais inteiros) e o fechamento usa centavos. **O cálculo do cupom é em centavos.** Se o carrinho ainda estiver em reais inteiros, converta na entrada do cálculo e registre no resumo final que o carrinho precisa passar a centavos (pedido 5.3 em `docs/pedidos-backend.md` do site).

## Tarefa

### 1. Calculadora (núcleo puro, sem banco)

Crie um componente isolado — por exemplo `CalculadoraDeCupons` — que recebe:
- as linhas do carrinho (itemId, tipo, categorias, preço unitário em centavos, quantidade, se está em oferta);
- os cupons na ordem de aplicação;
- o e-mail do aluno e a contagem de usos (total e do aluno) de cada cupom;
- a data/hora atual (injetada, para testar expiração).

E devolve:
- para cada cupom: válido ou não, motivo, desconto total em centavos;
- para cada linha: desconto por cupom, valor final;
- subtotal, desconto total, total.

Implemente exatamente as seções 2, 3 e 4 do documento: elegibilidade, validação na ordem da tabela, cálculo por tipo, vários cupons em sequência, uso individual, arredondamento em centavos e divisão do `FIXO_CARRINHO` com os centavos restantes.

### 2. Rotas do aluno

| Método | Rota | O que faz |
|---|---|---|
| `POST` | `/api/loja/carrinho/eu/cupons` | Corpo `{ "codigo": "..." }`. Valida e aplica. `200` com o carrinho recalculado; `422` com `{ motivo, mensagem }` se recusado |
| `DELETE` | `/api/loja/carrinho/eu/cupons/{codigo}` | Remove o cupom do carrinho. `200` com o carrinho recalculado |

O `CarrinhoResponse` passa a trazer:

```json
{
  "linhas": [
    { "linhaId": "...", "itemId": "...", "nome": "Material B", "quantidade": 2,
      "precoUnitarioEmCentavos": 4990, "subtotalEmCentavos": 9980,
      "descontoEmCentavos": 998, "totalEmCentavos": 8982 }
  ],
  "cupons": [
    { "codigo": "QUAD10", "tipo": "PERCENTUAL", "descontoEmCentavos": 10968 }
  ],
  "avisos": [
    { "codigo": "BEMVINDO", "motivo": "CUPOM_GASTO_MINIMO", "mensagem": "O valor mínimo para usar este cupom é R$ 200,00." }
  ],
  "subtotalEmCentavos": 109680,
  "descontoEmCentavos": 10968,
  "totalEmCentavos": 98712
}
```

`avisos` lista cupons que foram **retirados** do carrinho na última mudança (seção 4.4) ou removidos por uso individual (seção 4.3), para o site avisar o aluno.

Mantenha os campos atuais do carrinho para não quebrar o site; os campos novos são acréscimos.

### 3. Recalcular quando o carrinho muda

Toda rota que altera o carrinho (incluir, alterar e remover linha, esvaziar) revalida e recalcula os cupons aplicados. Cupom que deixou de valer sai do carrinho e entra em `avisos`.

### 4. Fechamento

No `POST /api/loja/carrinho/eu/fechamento`:

1. Revalide todos os cupons **dentro da mesma transação** que cria o fechamento.
2. Se algum cupom deixou de valer: **não** cobre. Responda `409` com o carrinho recalculado e os `avisos`, para o aluno conferir o novo total.
3. Reserve os usos (`CupomUso` = `RESERVADO`) de forma à prova de concorrência (bloqueio da linha do cupom, contador com condição, ou o que o projeto já usar). Teste com duas requisições simultâneas disputando o último uso.
4. Grave no fechamento o desconto por cupom e por linha. O valor cobrado no Pagar.me é o `totalEmCentavos` calculado aqui.
5. **Total zero** (ex.: cupom de 100%): não chame o Pagar.me. Marque o fechamento como pago, confirme os usos e libere o acesso na hora, pelo mesmo caminho que o webhook usa.
6. A `Idempotency-Key` repetida não pode reservar o uso duas vezes.

### 5. Ciclo do uso

| Evento | Uso |
|---|---|
| Pagamento confirmado (webhook) | `RESERVADO` → `CONFIRMADO`; incrementa o contador do cupom |
| Fechamento cancelado ou expirado | `RESERVADO` → `LIBERADO` |
| Estorno | Continua `CONFIRMADO` |

Webhook repetido não pode confirmar duas vezes.

### 6. Limite de tentativas

Na rota `POST /api/loja/carrinho/eu/cupons`, no máximo 10 tentativas por minuto por aluno. Acima disso, `429`. Use o mecanismo de limite que o projeto já tiver (pedido 6.3).

### 7. Testes

- **Calculadora:** um teste para cada caso da seção 7 do documento de regras (18 casos), com os valores exatos em centavos. Mais: arredondamento (percentual que gera meio centavo), `FIXO_CARRINHO` em que a soma das linhas fecha exatamente com o total, item gratuito nunca recebe desconto, "limitar X itens" pega as unidades de maior preço.
- **Integração:** aplicar, remover, recalcular ao mudar quantidade, recusar com cada motivo, fechamento com cupom que expirou entre aplicar e fechar (`409`), corrida pelo último uso, total zero sem chamada ao Pagar.me, webhook repetido, cancelamento liberando o uso.

## Fora do escopo

- Telas do site e do painel.
- Recalcular parcelas: o cálculo de parcelas usa o `totalEmCentavos` que sai daqui.

## Critérios de aceite

- [ ] Os 18 casos de referência passam com os valores exatos.
- [ ] Nenhuma rota aceita valor de desconto ou preço vindo do cliente.
- [ ] Corrida pelo último uso: só uma requisição consegue.
- [ ] Total zero libera acesso sem cobrança.
- [ ] Swagger atualizado com as rotas novas, os campos novos do carrinho e todos os `motivo` possíveis.
- [ ] Os testes existentes continuam passando.

## Entrega

Ao terminar, responda com:
1. arquivos criados e alterados;
2. o contrato final das rotas novas e do `CarrinhoResponse`, com exemplos de sucesso, de recusa (`422`) e de cupom retirado no fechamento (`409`);
3. a lista final de `motivo` e mensagens;
4. o que ficou pendente (ex.: carrinho ainda em reais inteiros, catálogo sem preço promocional).
