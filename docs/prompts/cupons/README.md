# Prompts — Cupons de desconto

Prompts para levar os cupons do site atual (WordPress + WooCommerce) para o site novo, com as mesmas regras.

Hoje o checkout do site novo tem dois cupons fixos no código (`QUAD10` e `BEMVINDO`, só porcentagem), apenas para teste. Isso é um risco de segurança (docs/seguranca.md, S8) e não atende o que a equipe usa no dia a dia.

## Ordem de execução

| # | Prompt | Onde roda | Depende de |
|---|---|---|---|
| 0 | [00-regras-de-negocio.md](00-regras-de-negocio.md) | — (referência lida por todos) | — |
| 1 | [01-backend-cadastro-de-cupons.md](01-backend-cadastro-de-cupons.md) | Repositório da API (Java) | Decisões abaixo |
| 2 | [02-backend-validacao-e-calculo.md](02-backend-validacao-e-calculo.md) | Repositório da API (Java) | Prompt 1 · carrinho do servidor (`/api/loja/carrinho/eu`) |
| 3 | [03-painel-admin-cupons.md](03-painel-admin-cupons.md) | Ferramenta do painel administrativo | Prompt 1 · Etapa 6, Bloco 1 (escolha da ferramenta) |
| 4 | [04-site-checkout-cupons.md](04-site-checkout-cupons.md) | Este repositório (quad-site) | Prompt 2 · Etapa 5 (itens com `itemId` da API) · login antes de pagar |
| 5 | [05-migracao-cupons-wordpress.md](05-migracao-cupons-wordpress.md) | Repositório da API (Java) | Prompt 1 |

Cada prompt é autocontido: cole o arquivo inteiro no agente, junto com o `00-regras-de-negocio.md`.

## Decisões em aberto

Os prompts seguem a recomendação de cada linha. Se a decisão for outra, ajuste o `00-regras-de-negocio.md` antes de rodar.

| Decisão | Recomendação usada nos prompts |
|---|---|
| Data de expiração | Válido **até 23:59:59 do dia informado** (horário da Bahia). No WooCommerce o cupom expira às 00:00 do dia informado; na migração, a data é ajustada para trás em um dia para manter o mesmo efeito |
| Mais de um cupom no mesmo pedido | Permitido, como no WooCommerce. Sem isso, a opção "Uso individual" não teria efeito |
| "Marcas de produtos" | **Não implementar.** O Quad não usa marcas; o campo existe no WooCommerce por padrão |
| "Categorias de produto" | Usar o tipo do item (turma, material, evento) e, se o catálogo da API tiver categorias, as categorias. Confirmar com o backend |
| "Itens em oferta" | Depende de o catálogo ter preço promocional. Se não tiver, o campo é salvo, mas não tem efeito até existir |
| Pedido cancelado, expirado ou estornado | Cancelado e expirado devolvem o uso do cupom; estornado **não** devolve |
| Cupom de 100% (total zero) | O fechamento não gera cobrança no Pagar.me e libera o acesso na hora |
