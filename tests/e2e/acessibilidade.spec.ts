import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { CONTA_A, entrar } from "./contas";

// Endereço do primeiro link para a página de detalhe ("Detalhes", "Conhecer e matricular"), ou null quando a lista está vazia.
async function primeiroDetalhe(page: Page, lista: string, rotulo: string) {
  await page.goto(lista);
  const link = page.locator("main").getByRole("link", { name: rotulo }).first();
  return (await link.count()) ? link.getAttribute("href") : null;
}

// Primeiro link da agenda para a página de um evento (o "Detalhes" do cartão fica dentro de "Informações").
async function primeiroEvento(page: Page) {
  await page.goto("/eventos");
  const link = page.locator('main a[href^="/eventos/"]').first();
  return (await link.count()) ? link.getAttribute("href") : null;
}

// Primeiro produto da loja (o cartão inteiro é o link).
async function primeiroDaLoja(page: Page) {
  await page.goto("/loja");
  const link = page.locator('main a[href^="/loja/"]').first();
  return (await link.count()) ? link.getAttribute("href") : null;
}

// Regras WCAG 2.1 níveis A e AA (contraste, rótulos, teclado). A área do aluno exige login: tem um teste próprio no fim.
// "turma:", "material:", "evento:" e "loja:" = o primeiro de cada um na vitrine da API (o endereço leva o id de cada um).
const PAGINAS = ["/", "/turmas", "turma:", "/produtos", "material:", "/simulados", "/eventos", "evento:", "/loja", "loja:", "/mentorias", "/aprovados", "/esqueci-senha", "/redefinir-senha?token=x", "/blog", "/blog/taf-cfp-soldado-pm-ba-como-funciona", "/professores/danilo-moura", "/sobre", "/contato", "/entrar", "/cadastro", "/carrinho", "/checkout", "/checkout/confirmacao?status=pendente"];

for (const caminho of PAGINAS) {
  test(`sem problemas de acessibilidade WCAG A/AA em ${caminho}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    if (caminho.endsWith(":")) {
      const detalhe = await (caminho === "turma:"
        ? primeiroDetalhe(page, "/turmas", "Conhecer e matricular")
        : caminho === "material:"
          ? primeiroDetalhe(page, "/produtos", "Detalhes")
          : caminho === "loja:"
            ? primeiroDaLoja(page)
            : primeiroEvento(page));
      test.skip(!detalhe, `A vitrine da API não tem ${caminho.slice(0, -1)} aberto(a) agora.`);
      await page.goto(detalhe!);
    } else {
      await page.goto(caminho);
    }
    // Rola até o fim para as seções com animação de entrada aparecerem.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 30));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);
    const resultado = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const problemas = resultado.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html.slice(0, 80)).join(" | ")}`);
    expect(problemas).toEqual([]);
  });
}

// Área do aluno com a conta de teste A (banco local), já com os dados carregados.
test("sem problemas de acessibilidade WCAG A/AA na área do aluno", async ({ page }) => {
  await entrar(page, CONTA_A);
  for (const rota of ["/aluno", "/aluno/materiais", "/aluno/turmas", "/aluno/eventos", "/aluno/compras", "/aluno/perfil"]) {
    await page.goto(rota, { waitUntil: "networkidle" });
    await expect(page.getByRole("status", { name: "Carregando" })).toHaveCount(0);
    const resultado = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const problemas = resultado.violations.map((v) => `${rota} ${v.id}: ${v.nodes.map((n) => n.html.slice(0, 80)).join(" | ")}`);
    expect(problemas).toEqual([]);
  }
});

test("o primeiro Tab mostra o atalho para pular direto ao conteúdo", async ({ page }) => {
  await page.goto("/sobre");
  await page.keyboard.press("Tab");
  const atalho = page.getByRole("link", { name: "Pular para o conteúdo" });
  await expect(atalho).toBeFocused();
  await expect(atalho).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator("#conteudo")).toBeFocused();
});

test("o menu suspenso abre pelo teclado e fecha com Esc", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/sobre");
  const turmas = page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Turmas Presenciais", exact: true });
  await turmas.focus();
  await expect(turmas).toHaveAttribute("aria-expanded", "true");
  // O primeiro item do menu suspenso é alcançável com Tab.
  await page.keyboard.press("Tab");
  const focado = await page.evaluate(() => document.activeElement?.closest("li")?.querySelector("a")?.textContent?.trim());
  expect(focado).toBe("Turmas Presenciais");
  await page.keyboard.press("Escape");
  await expect(turmas).toBeFocused();
  await expect(turmas).toHaveAttribute("aria-expanded", "false");
});

test("a barra de avisos em movimento pode ser pausada", async ({ page }) => {
  await page.goto("/sobre");
  const botao = page.getByRole("button", { name: "Pausar os avisos" });
  await botao.click();
  await expect(page.getByRole("button", { name: "Retomar os avisos" })).toHaveAttribute("aria-pressed", "true");
});
