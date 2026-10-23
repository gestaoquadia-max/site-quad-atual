import { expect, test, type Page } from "@playwright/test";
import { CONTA_A, entrar } from "./contas";

// Checkout com o carrinho do servidor (API local). O pagamento em reais depende das chaves do Pagar.me na API:
// sem elas (API local hoje), o checkout avisa que o pagamento está indisponível e não deixa pagar.

test("checkout com o carrinho vazio orienta a escolher algo", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page.getByText("Seu carrinho está vazio")).toBeVisible();
});

// Põe o primeiro material da vitrine no carrinho e devolve o nome dele (ou pula o teste se não houver).
async function adicionarUmMaterial(page: Page) {
  await page.goto("/produtos");
  const detalhes = page.locator("main").getByRole("link", { name: "Detalhes" }).first();
  test.skip((await detalhes.count()) === 0, "A vitrine da API não tem material à venda agora.");
  await page.goto((await detalhes.getAttribute("href"))!);
  const nome = (await page.getByRole("heading", { level: 1 }).textContent())!.trim();
  await page.locator("main").getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await expect(page.getByRole("status")).toContainText("adicionado ao carrinho");
  return nome;
}

test("sem login, o checkout pede para entrar e mantém o carrinho", async ({ page }) => {
  const nome = await adicionarUmMaterial(page);
  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: "Entre para finalizar a compra" })).toBeVisible();
  await expect(page.locator("main").getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/entrar?redirect=%2Fcheckout");
  await page.goto("/carrinho");
  await expect(page.locator("main").getByText(nome).first()).toBeVisible();
});

test("logado, o checkout reserva os itens no servidor, mostra o total da API e confere o cupom", async ({ page }) => {
  await entrar(page, CONTA_A);
  const nome = await adicionarUmMaterial(page);
  await page.goto("/checkout");
  const resumo = page.getByRole("complementary");
  await expect(resumo.getByText(nome).first()).toBeVisible();
  await expect(resumo.getByText(/Itens reservados para você até \d{2}:\d{2}/)).toBeVisible();
  await expect(resumo.getByText(/R\$\s?\d/).first()).toBeVisible();

  await resumo.getByPlaceholder("Cupom de desconto").fill("CUPOMQUENAOEXISTE");
  await resumo.getByRole("button", { name: "Aplicar" }).click();
  await expect(resumo.getByRole("alert")).toContainText("cupom");

  // Com o Pagar.me desligado na API, avisa e não deixa pagar; com ele ligado, o botão fica disponível.
  const pagar = page.getByRole("button", { name: "Pagar com cartão" });
  const indisponivel = page.getByText("O pagamento online está indisponível no momento.", { exact: false });
  await expect(indisponivel.or(pagar.and(page.locator(":enabled")))).toBeVisible();
  if (await indisponivel.isVisible()) await expect(pagar).toBeDisabled();

  // Solta as reservas (elas seguram o estoque por 30 minutos).
  // A sessão está nos cookies (o navegador manda sozinho); escrita por cookie exige o cabeçalho do site.
  const status = await page.evaluate(async (api) => {
    const res = await fetch(`${api}/api/loja/carrinho/eu`, { method: "DELETE", credentials: "include", headers: { "X-Quad-Cliente": "site" } });
    return res.status;
  }, process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080");
  expect(status).toBe(204);
});

// Turma, evento e simulado vão ao servidor sem quantidade (a API recusa o campo neles).
test("logado, a turma do carrinho é reservada no servidor", async ({ page }) => {
  await entrar(page, CONTA_A);
  let endereco: string | null = null;
  for (const lista of ["/turmas?m=rondesp", "/turmas?m=patamo", "/turmas?m=bope", "/turmas?cargo=ipc-pcba"]) {
    await page.goto(lista);
    const link = page.locator("main").getByRole("link", { name: "Conhecer e matricular" }).first();
    // A lista aparece depois da hidratação: espera um pouco antes de concluir que não há turma.
    await link.waitFor({ timeout: 5000 }).catch(() => {});
    if (await link.count()) {
      endereco = await link.getAttribute("href");
      break;
    }
  }
  test.skip(!endereco, "A vitrine da API não tem turma aberta agora.");
  await page.goto(endereco!);
  const nome = (await page.getByRole("heading", { level: 1 }).textContent())!.trim();
  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await page.goto("/checkout");
  const pedido = page.locator("main");
  await expect(pedido.getByText(nome).first()).toBeVisible();
  await expect(pedido.getByText(/Itens reservados para você até \d{2}:\d{2}/)).toBeVisible();

  const status = await page.evaluate(async (api) => {
    const res = await fetch(`${api}/api/loja/carrinho/eu`, { method: "DELETE", credentials: "include", headers: { "X-Quad-Cliente": "site" } });
    return res.status;
  }, process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080");
  expect(status).toBe(204);
});

test("evento gratuito inscreve direto, pedindo login antes", async ({ page }) => {
  // Os eventos vêm da vitrine da API: procura, entre os da agenda, o primeiro gratuito com inscrições abertas.
  await page.goto("/eventos");
  // O "Detalhes" de cada cartão fica dentro do painel "Informações".
  for (const botao of await page.locator("main").getByRole("button", { name: "Informações" }).all()) await botao.click();
  const enderecos = [...new Set(await page.locator('main a[href^="/eventos/"]').evaluateAll((as) => as.map((a) => a.getAttribute("href"))))];
  let achou: string | null = null;
  for (const endereco of enderecos) {
    await page.goto(endereco!);
    // Espera a página carregar e conta, sem aguardar um botão que pode não existir (evento pago).
    await page.getByRole("heading", { level: 1 }).waitFor();
    const botao = page.getByRole("button", { name: "Fazer inscrição gratuita" });
    if ((await botao.count()) > 0 && (await botao.isEnabled())) {
      achou = endereco;
      break;
    }
  }
  test.skip(!achou, "A vitrine da API não tem evento gratuito aberto agora.");
  // Sem login: vai para o login e volta para o evento depois. Não inscreve de verdade (o teste rodaria uma vez só).
  await page.getByRole("button", { name: "Fazer inscrição gratuita" }).click();
  await expect(page).toHaveURL(`/entrar?redirect=${encodeURIComponent(achou!)}`);
});

test("produto da loja vai para o carrinho com o tamanho, a quantidade e a retirada no Quad", async ({ page }) => {
  await page.goto("/loja");
  const produto = page.locator('main a[href^="/loja/"]').filter({ hasText: "Tamanho" }).first();
  test.skip((await produto.count()) === 0, "A vitrine da API não tem produto da loja com tamanho agora.");
  await produto.click();
  await expect(page).toHaveURL(/\/loja\/.+/);
  const nome = (await page.getByRole("heading", { level: 1 }).textContent())!.trim();
  const tamanhos = page.getByRole("radiogroup", { name: "Tamanho" });
  const escolhido = tamanhos.locator("[role=radio]:not([disabled])").last();
  const tamanho = (await escolhido.textContent())!.trim();
  await escolhido.click();
  await page.getByRole("button", { name: "Aumentar" }).click();
  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await expect(page.getByRole("status")).toContainText("adicionado ao carrinho");
  await page.goto("/carrinho");
  const item = page.locator("main li").filter({ hasText: nome });
  await expect(item).toContainText(`Tamanho ${tamanho}`);
  await expect(item).toContainText("2");
  await expect(page.getByRole("heading", { name: "Entrega dos produtos físicos" })).toBeVisible();
  await expect(page.getByRole("radio", { name: /Retirar no Quad/ })).toHaveAttribute("aria-checked", "true");
});
