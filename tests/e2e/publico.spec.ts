import { expect, test } from "@playwright/test";

test("home carrega e o rodapé leva às páginas institucionais", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1").first()).toBeVisible();

  for (const [link, titulo] of [
    ["Sobre o Quad", "Sobre o Quad"],
    ["Contato", "Contato"],
    ["Termos de uso", "Termos de uso"],
    ["Privacidade", "Política de privacidade"],
  ]) {
    await page.goto("/");
    await page.locator("footer").getByRole("link", { name: link }).click();
    await expect(page.getByRole("heading", { level: 1, name: titulo })).toBeVisible();
  }
});

test("endereço inexistente mostra a página 404", async ({ page }) => {
  const resposta = await page.goto("/pagina-que-nao-existe");
  expect(resposta?.status()).toBe(404);
  await expect(page.getByText("Página não encontrada")).toBeVisible();
});
