import { expect, test } from "@playwright/test";

// O pagamento ainda é simulado (sem Pagar.me); estes testes cobrem carrinho, resumo e telas de resultado.

test("checkout com o carrinho vazio orienta a escolher algo", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page.getByText("Seu carrinho está vazio")).toBeVisible();
});

test("comprar um material com PIX leva a 'aguardando pagamento' e esvazia o carrinho", async ({ page }) => {
  await page.goto("/produtos/direito-constitucional");
  await page.getByRole("button", { name: "Comprar agora" }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  // Escopo em <main>: o menu do topo (escondido) também tem esses textos.
  const conteudo = page.locator("main");
  await expect(conteudo.getByText("Direito Constitucional").first()).toBeVisible();
  // exact: a lista de parcelas também contém "R$ 49,90" ("1x de R$ 49,90 sem juros").
  await expect(conteudo.getByText("R$ 49,90", { exact: true }).first()).toBeVisible();

  await page.getByRole("button", { name: "PIX" }).click();
  await page.getByRole("button", { name: "Confirmar pagamento" }).click();
  await expect(page.getByRole("heading", { name: "Aguardando pagamento" })).toBeVisible();

  await page.goto("/checkout");
  await expect(page.getByText("Seu carrinho está vazio")).toBeVisible();
});

test("evento gratuito pula a parte de pagamento", async ({ page }) => {
  // Os eventos vêm da vitrine da API: usa o primeiro gratuito que estiver aberto.
  await page.goto("/eventos");
  const cartao = page.locator("main div.group").filter({ hasText: "Gratuito" }).first();
  test.skip((await cartao.count()) === 0, "A vitrine da API não tem evento gratuito aberto agora.");
  await page.goto((await cartao.getByRole("link", { name: "Detalhes" }).getAttribute("href"))!);
  await page.getByRole("button", { name: "Fazer inscrição gratuita" }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole("heading", { name: "Inscrição gratuita" })).toBeVisible();
  await page.getByRole("button", { name: "Confirmar inscrição" }).click();
  await expect(page.getByRole("heading", { name: "Inscrição confirmada" })).toBeVisible();
});
