# Prompt 4 — Site: cupons no checkout

> Rodar **neste repositório (quad-site)**, depois do prompt 2. Anexe junto o arquivo `00-regras-de-negocio.md`.

---

## Contexto

O checkout (`app/checkout/page.tsx`) tem hoje um objeto `cuponsValidos` com `QUAD10` e `BEMVINDO` fixos no código, só porcentagem, calculados no navegador. Isso precisa sair antes do lançamento (docs/seguranca.md, S8, medidas 1 e 2).

A API agora valida e calcula os cupons no carrinho do servidor:
- `POST /api/loja/carrinho/eu/cupons` com `{ "codigo": "..." }` → `200` com o carrinho recalculado, ou `422` com `{ motivo, mensagem }`;
- `DELETE /api/loja/carrinho/eu/cupons/{codigo}` → `200` com o carrinho recalculado;
- o `CarrinhoResponse` traz `cupons`, `avisos`, desconto por linha, `subtotalEmCentavos`, `descontoEmCentavos` e `totalEmCentavos`;
- o fechamento responde `409` com o carrinho recalculado se algum cupom deixou de valer.

Confira o contrato atual no Swagger da API antes de escrever o código: os nomes acima podem ter mudado no prompt 2.

## Antes de começar

1. Leia `AGENTS.md`: esta versão do Next.js tem mudanças. Consulte `node_modules/next/dist/docs/` antes de usar qualquer API do Next.
2. Leia `app/checkout/page.tsx`, `app/carrinho/page.tsx`, `lib/cart.tsx`, `lib/api.ts`, `lib/http.ts` (`ErroDaApi`, `lerErro`), `lib/auth.ts` (`fetchAutenticado`) e `lib/format.ts` (`formatarValor`).
3. Confira se o site já usa o carrinho do servidor (`/api/loja/carrinho/eu`). Os cupons **dependem** dele, e ele depende de os itens terem o `itemId` da API (Backlog, Etapa 5) e de o aluno estar logado (Etapa 8, Bloco 1: "Exigir login antes de pagar").
   - **Se o carrinho do servidor ainda não estiver ligado:** pare e responda o que falta. Não recrie o cálculo no navegador como solução provisória.

## Tarefa

### 1. Camada da API

Em `lib/api.ts` (ou `lib/cupons.ts`, se `api.ts` estiver grande), no padrão das funções que já existem (`fetchAutenticado`, `lerErro`, tipos exportados):

- `aplicarCupom(codigo)` e `removerCupom(codigo)`, devolvendo o carrinho recalculado;
- tipos `CupomAplicado`, `AvisoDeCupom` e os campos novos do carrinho;
- `422` vira `ErroDaApi` com `codigo` = `motivo` e a mensagem da API.

Valores chegam em centavos: converta só na exibição (`formatarValor(centavos / 100)`).

### 2. Checkout

Em `app/checkout/page.tsx`:

- **Remova** `cuponsValidos` e todo cálculo de desconto no navegador. Subtotal, desconto e total vêm da API.
- Campo "Cupom de desconto" + botão "Aplicar" (mantenha o visual atual). Enter aplica. Botão desabilitado e com "Aplicando…" durante a chamada.
- Recusa: mostre a **mensagem da API** abaixo do campo (hoje é só "Cupom inválido."), ligada ao campo por `aria-describedby` e anunciada (`role="alert"` ou `aria-live`).
- Vários cupons: cada cupom aplicado vira uma linha no resumo ("Cupom `CODIGO` − R$ X", com o botão ✕ para remover). O campo continua visível para adicionar outro.
- `avisos` da API (cupom retirado por uso individual ou porque deixou de valer): mostre um aviso no resumo, ex.: "O cupom BEMVINDO foi removido: o valor mínimo para usar este cupom é R$ 200,00."
- Desconto por linha: se a linha tiver desconto, mostre o valor original riscado e o valor com desconto.
- Total zero (cupom de 100%): o botão vira "Confirmar pedido", sem escolher forma de pagamento, e a tela de confirmação mostra acesso liberado. Não confundir com item gratuito sem cupom (fluxo de inscrição, que já existe).
- **Parcelas:** calculadas sobre o total com desconto vindo da API.
- Fechamento com `409`: atualize o resumo com o carrinho recebido, mostre os avisos e **não** siga para o pagamento. O aluno confere o novo total e confirma de novo.
- Cupom não é guardado no `localStorage`: ele vive no carrinho do servidor.

### 3. Carrinho

Em `app/carrinho/page.tsx`, se o carrinho tiver cupons aplicados, mostre a linha de desconto e o total com desconto no resumo. O campo de cupom fica só no checkout.

### 4. Documentação

- `docs/seguranca.md`, S8: marque as medidas 1 e 2 como feitas, se estiverem.
- `docs/BACKLOG.md` e `BACKLOG.csv`: "Validar cupons no backend (hoje estão no código)" → FEITO.
- `docs/pedidos-backend.md`, item 5.2: registre que foi atendido e o contrato final.

### 5. Testes

Em `tests/e2e/checkout.spec.ts`, no padrão dos testes existentes (contas de `tests/e2e/contas.ts`, API local ligada). Peça ao backend, ou crie pelo painel na base de teste, os cupons usados abaixo e registre-os em `tests/e2e/contas.ts`:

- aplicar um cupom percentual e conferir subtotal, desconto e total;
- cupom inexistente mostra a mensagem da API;
- cupom com gasto mínimo acima do carrinho é recusado com a mensagem do valor mínimo;
- remover o cupom volta o total original;
- aplicar um cupom de uso individual com outro já aplicado mostra o aviso de remoção;
- cupom de 100% leva a "Confirmar pedido" sem forma de pagamento.

Rode também `tests/e2e/acessibilidade.spec.ts`: a mensagem de erro e os avisos precisam passar no axe.

## Fora do escopo

- Qualquer cálculo de desconto no navegador.
- Telas do painel administrativo.

## Critérios de aceite

- [ ] Nenhum código de cupom nem regra de desconto no código do site (`grep -ri "QUAD10\|BEMVINDO\|cuponsValidos"` sem resultado).
- [ ] O site só envia o código do cupom; nunca valor de desconto ou total.
- [ ] Mensagens de recusa e avisos vêm da API, em português.
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run build` e `npm run test:e2e` passam.

## Entrega

Ao terminar, responda com os arquivos alterados, capturas do resumo do checkout com um cupom aplicado, com uma recusa e com um aviso de remoção, e o que ficou pendente.
