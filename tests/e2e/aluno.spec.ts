import { expect, test } from "@playwright/test";
import { CONTA_A, CONTA_B, entrar } from "./contas";

test.describe("área do aluno (conta A)", () => {
  test.beforeEach(async ({ page }) => {
    await entrar(page, CONTA_A);
  });

  test("perfil mostra os dados reais, com CPF e e-mail só para leitura", async ({ page }) => {
    await page.goto("/aluno/perfil");
    await expect(page.locator("#perfil-nome")).toHaveValue(CONTA_A.nome);
    await expect(page.locator("#perfil-email")).toHaveValue(CONTA_A.email);
    await expect(page.locator("#perfil-cpf")).toHaveValue(CONTA_A.cpfFormatado);
    await expect(page.locator("#perfil-cpf")).toBeDisabled();
    await expect(page.locator("#perfil-email")).toBeDisabled();
  });

  test("aluno troca o próprio nome e o nome novo continua depois de recarregar", async ({ page }) => {
    await page.goto("/aluno/perfil");
    const nome = page.locator("#perfil-nome");
    const salvar = page.getByRole("button", { name: "Salvar alterações" });
    try {
      await nome.fill(`${CONTA_A.nome} Editado`);
      await salvar.click();
      await expect(page.getByText("Dados atualizados.")).toBeVisible();
      await page.reload();
      await expect(nome).toHaveValue(`${CONTA_A.nome} Editado`);
    } finally {
      // Volta o nome original para não afetar os outros testes.
      await nome.fill(CONTA_A.nome);
      await salvar.click();
      await expect(page.getByText("Dados atualizados.")).toBeVisible();
    }
  });

  test("minhas turmas mostra só a turma do aluno", async ({ page }) => {
    await page.goto("/aluno/turmas");
    await expect(page.getByText("Regular Tarde")).toBeVisible();
    await expect(page.getByText("C.O.R.E.")).toHaveCount(0);
  });

  test("compras mostram só as feitas em reais, com valor e situação", async ({ page }) => {
    await page.goto("/aluno/compras");
    // A conta A acumula compras dos testes de pagamento no sandbox: confere que cada situação aparece, não quantas.
    await expect(page.getByText("R$ 997,00").first()).toBeVisible();
    await expect(page.getByText("Pago", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Aguardando pagamento").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Copiar código PIX" }).first()).toBeVisible();
  });
});

test("meus eventos mostra a inscrição do aluno (conta B)", async ({ page }) => {
  await entrar(page, CONTA_B);
  await page.goto("/aluno/eventos");
  await expect(page.getByText("Evento de teste (Claude)")).toBeVisible();
  await expect(page.getByText("Inscrito")).toBeVisible();
});

test("aluno pede a exclusão da conta com a senha e desiste em seguida (conta B)", async ({ page }) => {
  await entrar(page, CONTA_B);
  await page.goto("/aluno/perfil");
  const cancelar = page.getByRole("button", { name: "Cancelar a exclusão" });
  await page.getByRole("button", { name: "Pedir a exclusão da conta" }).click();
  await expect(page.getByText("Com a exclusão, você perde:")).toBeVisible();
  await page.getByLabel("Digite a sua senha para confirmar").fill(CONTA_B.senha);
  try {
    await page.getByRole("button", { name: "Excluir minha conta" }).click();
    await expect(page.getByText(/Sua conta será excluída em \d{2}\/\d{2}\/\d{4}/)).toBeVisible();
  } finally {
    // Desiste sempre, para a conta de teste não ser excluída.
    await cancelar.click();
    await expect(page.getByText("Pedido cancelado. Sua conta continua normalmente.")).toBeVisible();
  }
  await page.reload();
  await expect(page.getByRole("button", { name: "Pedir a exclusão da conta" })).toBeVisible();
});
