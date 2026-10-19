import { expect, type Page } from "@playwright/test";

// Contas e dados de teste do banco LOCAL (listados em docs/pedidos-backend.md).
// Podem ser trocados por variáveis de ambiente sem mudar os testes.
const SENHA = process.env.E2E_SENHA ?? "senha12345";

// Conta A: matriculada na turma "Regular Tarde", com compras em reais (cartão paga e PIX pendente).
export const CONTA_A = {
  email: process.env.E2E_EMAIL_A ?? "teste.claude.1790858155@exemplo.com",
  senha: SENHA,
  nome: "Teste Claude",
  cpfFormatado: "529.982.247-25",
};

// Conta B: matriculada na "C.O.R.E." e inscrita no "Evento de teste (Claude)".
export const CONTA_B = {
  email: process.env.E2E_EMAIL_B ?? "teste.claude.b.1790949238109@exemplo.com",
  senha: SENHA,
};

// Conta C: usada só para conferir o aviso de dados já cadastrados (nunca cria conta).
export const CONTA_C = {
  email: process.env.E2E_EMAIL_C ?? "teste.claude.c.1790962937953@exemplo.com",
  cpf: "39053344705",
  celular: "75988887777",
};

export async function entrar(page: Page, conta: { email: string; senha: string }, destino = "/entrar") {
  await page.goto(destino);
  await page.getByPlaceholder("seu@email.com").fill(conta.email);
  await page.getByPlaceholder("••••••••").fill(conta.senha);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/entrar/);
}
