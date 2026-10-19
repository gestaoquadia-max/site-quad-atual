# Prompt 1 — Backend: cadastro de cupons

> Rodar no repositório da **API do Quad (Java)**. Anexe junto o arquivo `00-regras-de-negocio.md`.

---

## Contexto

O Quad Concursos está trocando o site em WordPress + WooCommerce por um site próprio (Next.js) que consome esta API. Os cupons de desconto precisam existir na API com as mesmas regras do WooCommerce. Este prompt cobre **só o cadastro** (modelo, banco e rotas de administração). A validação e o cálculo no carrinho ficam para o prompt 2.

As regras completas estão em `00-regras-de-negocio.md`. Siga esse documento; se algo aqui parecer contradizê-lo, o documento vence e você deve apontar a diferença.

## Antes de começar

1. Leia a estrutura do projeto: como as entidades, repositórios, serviços, controllers, DTOs, migrations e testes estão organizados. **Siga os padrões que já existem** (nomes, pacotes, tratamento de erro, paginação, autenticação de administrador, formato das respostas).
2. Localize o catálogo da loja (itens com `itemId`, tipo e, se existir, categoria e preço promocional) e o carrinho do servidor (`/api/loja/carrinho/eu`). O cupom referencia itens do catálogo.
3. Confirme se o catálogo tem **categorias** e **preço promocional**. Se não tiver, não crie esses conceitos agora: registre isso no resumo final.

## Tarefa

### 1. Modelo e banco

Crie a entidade `Cupom` com os campos da seção 1 do documento de regras:

- `codigo` (guardado como digitado, com uma coluna normalizada em minúsculas para busca e unicidade), `descricao`, `tipo` (enum), `valorPercentual` (decimal, 2 casas) **ou** `valorEmCentavos` (inteiro), conforme o tipo, `dataExpiracao` (`LocalDate`, opcional);
- `gastoMinimoEmCentavos`, `gastoMaximoEmCentavos`, `usoIndividual`, `excluirItensEmOferta`;
- listas: itens permitidos, itens excluídos, categorias permitidas, categorias excluídas, e-mails permitidos (tabelas de relação, não texto separado por vírgula);
- `limiteDeUso`, `limiteDeItens`, `limiteDeUsoPorCliente` (opcionais);
- `situacao` (`PUBLICADO`, `RASCUNHO`, `LIXEIRA`), criado/alterado por e em.

Crie também a entidade `CupomUso` (cupom, aluno, e-mail do aluno no momento do uso, fechamento, situação `RESERVADO`/`CONFIRMADO`/`LIBERADO`, desconto aplicado em centavos, datas). Ela será preenchida no prompt 2, mas a tabela entra agora.

Unicidade do código: índice único parcial no código normalizado para cupons fora da lixeira (ou a alternativa equivalente do banco usado).

Migration nova, no padrão do projeto. Não altere migrations antigas.

### 2. Rotas de administração

Todas exigem perfil de administrador. Ajuste os nomes ao padrão do projeto, se for diferente:

| Método | Rota | O que faz |
|---|---|---|
| `GET` | `/api/admin/cupons` | Lista paginada. Filtros: `busca` (código ou descrição), `situacao`, `tipo`. Mostra código, tipo, valor, descrição, itens, usos/limite e expiração |
| `GET` | `/api/admin/cupons/{id}` | Detalhe completo |
| `POST` | `/api/admin/cupons` | Cria |
| `PUT` | `/api/admin/cupons/{id}` | Altera |
| `DELETE` | `/api/admin/cupons/{id}` | Move para a lixeira |
| `POST` | `/api/admin/cupons/{id}/restauracao` | Tira da lixeira (falha se outro cupom ativo já usa o código) |
| `GET` | `/api/admin/cupons/codigo-sugerido` | Devolve um código aleatório de 8 caracteres ainda não usado |
| `GET` | `/api/admin/cupons/{id}/usos` | Lista de usos: aluno, e-mail, pedido, desconto, situação, data |

### 3. Validações ao salvar

Responder `400` com mensagem por campo, no formato de erro do projeto:

- código obrigatório, formato permitido, único (sem diferenciar maiúsculas e minúsculas);
- `PERCENTUAL`: valor de 0,01 a 100; `FIXO_*`: valor > 0;
- gasto mínimo ≤ gasto máximo, quando os dois existirem;
- limites ≥ 1 quando informados;
- `limiteDeItens` proibido em `FIXO_CARRINHO`;
- itens referenciados precisam existir no catálogo;
- e-mails com formato válido (permitindo `*` no lugar do usuário ou de parte do domínio);
- o mesmo item não pode estar em "Produtos" e "Excluir produtos" ao mesmo tempo (idem categorias).

### 4. Registro de alterações

Grave quem criou, alterou, mandou para a lixeira ou restaurou cada cupom, com data e os campos alterados. Use o mecanismo de auditoria que o projeto já tiver; se não houver, crie uma tabela simples.

### 5. Testes

- Testes das validações (um por regra acima).
- Teste de unicidade sem diferenciar maiúsculas e minúsculas e de restauração com código em conflito.
- Teste de autorização: aluno comum recebe `403` em todas as rotas `/api/admin/cupons`.

## Fora do escopo

- Validar e aplicar cupom no carrinho e no fechamento (prompt 2).
- Tela do painel (prompt 3).
- Importar cupons do WordPress (prompt 5).
- "Marcas de produtos": não implementar.

## Critérios de aceite

- [ ] Migration aplica do zero e sobre o banco atual sem erro.
- [ ] Todas as rotas da tabela respondem, com autorização de administrador.
- [ ] Todas as validações da seção 3 têm teste e passam.
- [ ] Documentação da API (Swagger/OpenAPI) mostra as rotas e os DTOs com exemplos.
- [ ] Os testes existentes continuam passando.

## Entrega

Ao terminar, responda com:
1. arquivos criados e alterados;
2. o contrato final das rotas (exemplo de requisição e resposta de `POST /api/admin/cupons`);
3. o que ficou pendente ou diferente do documento de regras, e por quê (ex.: catálogo sem categorias ou sem preço promocional).
