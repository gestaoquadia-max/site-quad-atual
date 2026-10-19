import { expect, test } from "@playwright/test";
import { CONTA_A, entrar } from "./contas";

test("senha errada mostra a mensagem da API", async ({ page }) => {
  await page.goto("/entrar");
  await page.getByPlaceholder("seu@email.com").fill(CONTA_A.email);
  await page.getByPlaceholder("••••••••").fill("senha-errada-123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("E-mail ou senha inválidos.")).toBeVisible();
  await expect(page).toHaveURL(/\/entrar/);
});

test("área do aluno sem login manda para o login e, depois, volta para onde a pessoa estava", async ({ page }) => {
  await page.goto("/aluno/perfil");
  await expect(page).toHaveURL(/\/entrar\?redirect=%2Faluno%2Fperfil/);

  await page.getByPlaceholder("seu@email.com").fill(CONTA_A.email);
  await page.getByPlaceholder("••••••••").fill(CONTA_A.senha);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/aluno\/perfil$/);
});

test("destino externo depois do login é ignorado", async ({ page }) => {
  await page.goto("/entrar?redirect=%2F%2Fexemplo.com");
  await page.getByPlaceholder("seu@email.com").fill(CONTA_A.email);
  await page.getByPlaceholder("••••••••").fill(CONTA_A.senha);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/aluno$/);
});

test("sair encerra a sessão", async ({ page }) => {
  await entrar(page, CONTA_A);
  await page.goto("/aluno");
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/entrar/);
  await page.goto("/aluno");
  await expect(page).toHaveURL(/\/entrar/);
});
