import { expect, test } from "@playwright/test";

// O pagamento ainda é simulado (sem Pagar.me); estes testes cobrem carrinho, resumo e telas de resultado.

test("checkout com o carrinho vazio orienta a escolher algo", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page.getByText("Seu carrinho está vazio")).toBeVisible();
});

test("comprar um material com PIX leva a 'aguardando pagamento' e esvazia o carrinho", async ({ page }) => {
  // Os materiais vêm da vitrine da API: usa o primeiro do catálogo.
  await page.goto("/produtos");
  const detalhes = page.locator("main").getByRole("link", { name: "Detalhes" }).first();
  test.skip((await detalhes.count()) === 0, "A vitrine da API não tem material à venda agora.");
  await page.goto((await detalhes.getAttribute("href"))!);
  const nome = (await page.getByRole("heading", { level: 1 }).textContent())!.trim();
  await page.locator("main").getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await expect(page.getByRole("status")).toContainText("adicionado ao carrinho");
  await page.goto("/checkout");
  // Escopo em <main>: o menu do topo (escondido) também tem esses textos.
  await expect(page.locator("main").getByText(nome).first()).toBeVisible();

  await page.getByRole("button", { name: "PIX" }).click();
  await page.getByRole("button", { name: "Confirmar pagamento" }).click();
  await expect(page.getByRole("heading", { name: "Aguardando pagamento" })).toBeVisible();

  await page.goto("/checkout");
  await expect(page.getByText("Seu carrinho está vazio")).toBeVisible();
});

test("evento gratuito pula a parte de pagamento", async ({ page }) => {
  // Os eventos vêm da vitrine da API: procura, entre os da agenda, o primeiro gratuito com inscrições abertas.
  await page.goto("/eventos");
  // O "Detalhes" de cada cartão fica dentro do painel "Informações".
  for (const botao of await page.locator("main").getByRole("button", { name: "Informações" }).all()) await botao.click();
  const enderecos =[...new Set(await page.locator('main a[href^="/eventos/"]').evaluateAll((as) => as.map((a) => a.getAttribute("href"))))];
  let achou = false;
  for (const endereco of enderecos) {
    await page.goto(endereco!);
    // Espera a página carregar e conta, sem aguardar um botão que pode não existir (evento pago).
    await page.getByRole("heading", { level: 1 }).waitFor();
    const botao = page.getByRole("button", { name: "Fazer inscrição gratuita" });
    if ((await botao.count()) > 0 && (await botao.isEnabled())) {
      achou = true;
      break;
    }
  }
  test.skip(!achou, "A vitrine da API não tem evento gratuito aberto agora.");
  await page.getByRole("button", { name: "Fazer inscrição gratuita" }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole("heading", { name: "Inscrição gratuita" })).toBeVisible();
  await page.getByRole("button", { name: "Confirmar inscrição" }).click();
  await expect(page.getByRole("heading", { name: "Inscrição confirmada" })).toBeVisible();
});
