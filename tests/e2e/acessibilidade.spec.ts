import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Endereço do primeiro "Detalhes" da lista, ou null quando a lista está vazia.
async function primeiroDetalhe(page: Page, lista: string) {
  await page.goto(lista);
  const link = page.locator("main").getByRole("link", { name: "Detalhes" }).first();
  return (await link.count()) ? link.getAttribute("href") : null;
}

// Regras WCAG 2.1 níveis A e AA (contraste, rótulos, teclado). As páginas da área do aluno exigem login e a API,
// por isso ficam fora desta lista; foram conferidas à parte com dados de exemplo.
// "turma:" e "evento:" = a primeira turma e o primeiro evento da vitrine da API (o endereço leva o id de cada um).
const PAGINAS = ["/", "/turmas", "turma:", "/produtos/direito-constitucional", "/eventos", "evento:", "/aprovados", "/blog", "/sobre", "/contato", "/entrar", "/cadastro", "/checkout"];

for (const caminho of PAGINAS) {
  test(`sem problemas de acessibilidade WCAG A/AA em ${caminho}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    if (caminho.endsWith(":")) {
      const detalhe = await primeiroDetalhe(page, caminho === "turma:" ? "/turmas" : "/eventos");
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
  const turmas = page.locator("nav").getByRole("link", { name: "Turmas", exact: true });
  await turmas.focus();
  await expect(turmas).toHaveAttribute("aria-expanded", "true");
  // O primeiro item do menu suspenso é alcançável com Tab.
  await page.keyboard.press("Tab");
  const focado = await page.evaluate(() => document.activeElement?.closest("li")?.querySelector("a")?.textContent?.trim());
  expect(focado).toBe("Turmas");
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
