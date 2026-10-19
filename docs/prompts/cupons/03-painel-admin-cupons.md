# Prompt 3 — Painel administrativo: gestão de cupons

> Rodar no projeto do **painel administrativo**, depois do prompt 1. Anexe junto o arquivo `00-regras-de-negocio.md`.
>
> A ferramenta do painel ainda não foi escolhida (Backlog, Etapa 6, Bloco 1: painel próprio, painel do backend ou CMS). Este prompt descreve as telas e o comportamento sem depender da ferramenta. Antes de rodar, troque o trecho "Antes de começar" pelo projeto escolhido.

---

## Contexto

Hoje a equipe do Quad (atendimento, comercial, pedagógico) cria cupons no WordPress, em **Marketing → Cupons**. Exemplo real em uso: o cupom `materialrondesp`, 100% de desconto, só para o material "MATERIAIS DIÁRIOS – RONDESP [N] (19/10)", só para o e-mail `atendimentoquad@gmail.com`, uso individual, expira em 15/01/2027, criado pela Amanda para os alunos da turma.

Quem usa o painel não é técnico. A tela precisa ser tão simples quanto a do WordPress, e mais clara.

A API já expõe `/api/admin/cupons` (lista, detalhe, criar, alterar, lixeira, restaurar, código sugerido, usos). As regras estão em `00-regras-de-negocio.md`.

## Antes de começar

1. Leia a estrutura do painel: navegação, layout, componentes de formulário, tabela, busca de itens, autenticação e chamadas à API. **Reaproveite o que existe.**
2. Leia o contrato das rotas `/api/admin/cupons` no Swagger da API.

## Tarefa

### 1. Menu

Item **Marketing → Cupons** (ou o equivalente na navegação do painel).

### 2. Lista de cupons

Colunas: Código · Tipo · Valor · Descrição · Itens (resumo das restrições) · Uso/Limite (ex.: `3 / 10` ou `3 / ∞`) · Data de expiração · Situação.

- Busca por código ou descrição; filtros por situação e tipo.
- Abas ou filtro: Todos · Publicados · Rascunhos · Lixeira.
- Cupom expirado ou esgotado aparece com um selo ("Expirado", "Esgotado").
- Ações por linha: Editar · Duplicar · Mover para a lixeira (ou Restaurar, na lixeira) · Copiar código.
- Botão **Adicionar cupom**.

### 3. Formulário de cupom

Topo: **Código** (campo grande) + botão **Gerar código** (usa `codigo-sugerido`) e **Descrição** (texto livre, uso interno, com dica: "Para que serve e quem pediu").

Lateral: **Publicar** (situação, Salvar rascunho, Publicar/Atualizar, Mover para a lixeira), criado por/em, alterado por/em.

Bloco **Dados do cupom** com três abas, na mesma ordem do WordPress:

**Geral**
- Tipo de desconto: Desconto em porcentagem · Desconto fixo no carrinho · Desconto fixo por produto. Abaixo do seletor, uma frase explicando o tipo escolhido.
- Valor do cupom: com `%` ou `R$` conforme o tipo, máscara de dinheiro em reais.
- Data de expiração: seletor de data, com o texto "Vale até 23:59 deste dia. Deixe vazio para não expirar."

**Restrição de uso**
- Gasto mínimo / Gasto máximo (R$).
- Uso individual apenas (caixa de seleção).
- Excluir itens em oferta (caixa de seleção). Se o catálogo ainda não tiver preço promocional, mostrar a dica "Ainda sem efeito: o catálogo não tem preço promocional".
- Produtos / Excluir produtos: busca com autocompletar no catálogo (turmas, materiais, eventos), mostrando nome, tipo e identificador; itens escolhidos como etiquetas removíveis.
- Categorias / Excluir categorias: mesma interação.
- E-mails permitidos: lista de e-mails separados por vírgula ou Enter, aceitando `*@dominio.com.br`.
- **Não** incluir "Marcas de produtos".

**Limites de uso**
- Limite de uso por cupom (vazio = "Uso ilimitado").
- Limitar o uso para X itens (vazio = "Aplicar a todos os itens elegíveis"). **Esconder** quando o tipo for "Desconto fixo no carrinho".
- Limite de uso por cliente (vazio = "Uso ilimitado").

Cada campo tem o ícone de ajuda `?` com a explicação em linguagem simples (use os textos da seção 1 do documento de regras).

### 4. Comportamento do formulário

- Validação no navegador igual à da API (seção 3 do prompt 1) e exibição dos erros da API no campo certo.
- Aviso ao sair com alterações não salvas.
- Antes de publicar, um **resumo em linguagem simples** do que o cupom faz, para conferência. Ex.: "100% de desconto em MATERIAIS DIÁRIOS – RONDESP [N] (19/10). Só para atendimentoquad@gmail.com. Não pode ser usado junto com outros cupons. Vale até 15/01/2027."
- **Duplicar** abre o formulário preenchido, sem código e como rascunho.

### 5. Usos do cupom

No formulário de um cupom já salvo, uma seção **Usos** com a lista de `/api/admin/cupons/{id}/usos`: aluno, e-mail, pedido (com link, se o painel tiver tela de pedido), desconto, situação (reservado, confirmado, liberado), data.

### 6. Acesso

Só administradores veem o menu e as telas. Se a API responder `403`, mostrar "Você não tem permissão para gerenciar cupons."

### 7. Testes

- Criar cada um dos três tipos e conferir o que foi gravado na API.
- Recriar o exemplo `materialrondesp` do Contexto pelo formulário.
- Campo "Limitar o uso para X itens" some ao escolher "Desconto fixo no carrinho".
- Erro de código duplicado aparece no campo Código.
- Lixeira e restauração.
- Acessibilidade: todos os campos com rótulo, navegação por teclado nas abas e na busca de itens.

## Critérios de aceite

- [ ] Alguém da equipe, sem treinamento, consegue recriar o cupom `materialrondesp` em menos de 2 minutos.
- [ ] Todos os campos da seção 1 do documento de regras estão no formulário (menos "Marcas").
- [ ] A lista mostra usos/limite e o selo de expirado/esgotado.
- [ ] Os erros da API aparecem no campo certo, em português.

## Entrega

Ao terminar, responda com os arquivos criados e alterados, capturas de tela da lista e das três abas, e o que ficou pendente.
