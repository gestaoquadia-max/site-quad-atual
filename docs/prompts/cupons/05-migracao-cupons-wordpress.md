# Prompt 5 — Migração dos cupons do WordPress

> Rodar no repositório da **API do Quad (Java)**, depois do prompt 1 e **antes do lançamento**. Anexe junto o arquivo `00-regras-de-negocio.md`.

---

## Contexto

Os cupons ativos hoje estão no WooCommerce de quadconcursos.com.br. Quando o site novo entrar no ar, eles precisam continuar funcionando com os mesmos códigos e regras, e com os usos já feitos contando para os limites.

A forma recomendada de ler os cupons é a API REST do WooCommerce (`GET /wp-json/wc/v3/coupons`, paginada), com uma chave **somente leitura** criada em WooCommerce → Configurações → Avançado → API REST. A chave fica em variável de ambiente, nunca no código.

## Tarefa

### 1. Comando de importação

Crie um comando (ou rota de administrador, no padrão do projeto) que:

1. lê todos os cupons do WooCommerce (todas as páginas);
2. converte cada um para `Cupom` (tabela abaixo);
3. tem modo **simulação** (padrão), que só gera o relatório, e modo **gravar**;
4. pode rodar mais de uma vez sem duplicar: cupom com o mesmo código já importado é atualizado, não recriado.

### 2. Conversão

| WooCommerce | Cupom |
|---|---|
| `code` | `codigo` |
| `description` | `descricao` |
| `discount_type`: `percent` / `fixed_cart` / `fixed_product` | `PERCENTUAL` / `FIXO_CARRINHO` / `FIXO_PRODUTO` |
| `amount` (texto decimal) | `valorPercentual` ou `valorEmCentavos` |
| `date_expires` | `dataExpiracao` = **data do WooCommerce menos 1 dia** (no WooCommerce o cupom expira às 00:00 do dia informado; no Quad vale até 23:59 do dia informado) |
| `minimum_amount` / `maximum_amount` | `gastoMinimoEmCentavos` / `gastoMaximoEmCentavos` (`""` ou `0` = vazio) |
| `individual_use` | `usoIndividual` |
| `exclude_sale_items` | `excluirItensEmOferta` |
| `product_ids` / `excluded_product_ids` | itens permitidos / excluídos, pela **tabela de-para** (seção 3) |
| `product_categories` / `excluded_product_categories` | categorias, pela tabela de-para |
| `email_restrictions` | e-mails permitidos |
| `usage_limit` / `usage_limit_per_user` / `limit_usage_to_x_items` | `limiteDeUso` / `limiteDeUsoPorCliente` / `limiteDeItens` (`null` = vazio) |
| `usage_count` | usos já feitos, contando para o limite de uso (ex.: `CupomUso` `CONFIRMADO` marcado como importado, sem fechamento, ou um contador inicial no cupom; escolha o que encaixar melhor no modelo do prompt 1) |
| `used_by` (ids ou e-mails) | usos por cliente: ligar ao aluno pelo e-mail, quando existir; se não, guardar o e-mail para contar no limite por cliente |
| `status`: `publish` / `draft` / `trash` | `PUBLICADO` / `RASCUNHO` / não importar |
| `free_shipping` | ignorar (o Quad não cobra frete no site) |
| Marcas | ignorar |

### 3. Tabela de-para dos produtos

Os ids de produto do WooCommerce não existem na API. Use uma tabela de-para (arquivo CSV ou tabela no banco) `idWooCommerce → itemId da API`, com o mesmo para categorias.

- O comando lista **todos os ids do WooCommerce usados em cupons que não estão na tabela**, com o nome do produto, para a equipe preencher.
- Cupom com produto sem correspondência **não é gravado como publicado**: entra como `RASCUNHO`, e o relatório explica por quê. Assim, nenhum cupom passa a valer para mais itens do que valia antes.

### 4. O que importar

- Importar: publicados que não estão expirados nem esgotados.
- Não importar: lixeira, expirados e esgotados (aparecem no relatório como "ignorados", com o motivo).

### 5. Relatório

Ao final de cada execução: total lido, importados, atualizados, em rascunho por falta de de-para, ignorados (com motivo), e a lista de produtos sem correspondência. Formato CSV ou tabela no terminal.

### 6. Testes

- Conversão de cada tipo, com valores decimais (`"49.90"` → `4990`).
- Data de expiração ajustada em um dia.
- Produto sem de-para leva o cupom a `RASCUNHO`.
- Executar duas vezes não duplica.
- O cupom real `materialrondesp` (100%, material Rondesp [N] (19/10), `atendimentoquad@gmail.com`, uso individual, expira em 15/01/2027 no WooCommerce) vira: `PERCENTUAL` 100, item correspondente, e-mail permitido, uso individual, `dataExpiracao` = 14/01/2027.

## Critérios de aceite

- [ ] Simulação roda contra o WordPress de produção sem gravar nada.
- [ ] Nenhum cupom importado como publicado vale para mais itens ou mais pessoas do que no WooCommerce.
- [ ] Usos anteriores contam para os limites.
- [ ] Chave do WooCommerce só em variável de ambiente.

## Entrega

Ao terminar, responda com os arquivos criados, como rodar (simulação e gravação) e o relatório de uma simulação, se tiver acesso à chave.
