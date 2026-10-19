import { expect, test } from "@playwright/test";

// Recuperação de senha. Nenhum destes testes envia e-mail: o pedido usa um endereço sem conta (a API responde
// 202 igual, sem revelar se o e-mail existe) e o link é falso.

test("pedir o link mostra a validade e trava o reenvio por alguns segundos", async ({ page }) => {
  await page.goto("/esqueci-senha");
  await page.getByPlaceholder("seu@email.com").fill(`sem.conta.${Date.now()}@invalido.test`);
  await page.getByRole("button", { name: "Enviar link" }).click();
  await expect(page.getByText(/O link vale por \d+ minutos/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Você pode pedir de novo em \d+ s/ })).toBeDisabled();
});

test("link de redefinição inválido já avisa ao abrir, sem mostrar o formulário", async ({ page }) => {
  await page.goto("/redefinir-senha?token=link-falso-para-teste");
  await expect(page.getByText("Este link não é válido ou já venceu.")).toBeVisible();
  await expect(page.locator("#nova-senha")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Pedir um novo link" })).toHaveAttribute("href", "/esqueci-senha");
});
