import { expect, test, type Page } from "@playwright/test";
import { CONTA_C } from "./contas";

// Nenhum destes testes cria conta: todos param no passo 1 ou no começo do passo 2.

async function preencherPasso1(page: Page, dados: { email: string; cpf: string; celular: string }) {
  await page.goto("/cadastro");
  await page.getByPlaceholder("Seu nome").fill("Teste");
  await page.getByPlaceholder("Seu sobrenome").fill("Automatizado");
  await page.getByPlaceholder("000.000.000-00").fill(dados.cpf);
  await page.getByPlaceholder("(75) 99999-0000").fill(dados.celular);
  await page.getByPlaceholder("seu@email.com").fill(dados.email);
  const senhas = page.locator('input[type="password"]');
  await senhas.nth(0).fill("senha12345");
  await senhas.nth(1).fill("senha12345");
  await page.getByRole("button", { name: "Continuar" }).click();
}

test("CPF inválido é recusado no passo 1", async ({ page }) => {
  await preencherPasso1(page, { email: "novo@exemplo.com", cpf: "11111111111", celular: "75912345678" });
  await expect(page.getByText("CPF inválido. Confira os números digitados.")).toBeVisible();
  await expect(page.getByText("Passo 1 de 3")).toBeVisible();
});

test("dados já cadastrados são avisados antes do endereço, com atalhos para entrar", async ({ page }) => {
  await preencherPasso1(page, { email: CONTA_C.email, cpf: CONTA_C.cpf, celular: CONTA_C.celular });
  // Escopo em <main>: o Next também tem um "alert" invisível de acessibilidade.
  const aviso = page.locator("main").getByRole("alert");
  await expect(aviso).toContainText("Já existe uma conta com este e-mail e este CPF");
  await expect(aviso.getByRole("link", { name: "Entrar" })).toBeVisible();
  await expect(aviso.getByRole("link", { name: "Esqueci minha senha" })).toBeVisible();
  await expect(page.getByText("Passo 1 de 3")).toBeVisible();
});

test("dados novos seguem para o endereço", async ({ page }) => {
  const final = String(Date.now()).slice(-4);
  await preencherPasso1(page, {
    email: `e2e.${Date.now()}@exemplo.com`,
    cpf: "71460238001",
    celular: `759123${final}`,
  });
  await expect(page.getByText("Passo 2 de 3")).toBeVisible();
});
