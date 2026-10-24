import { expect, test } from "@playwright/test";

// Sem escolha feita: o aviso aparece no primeiro acesso.
test.use({ storageState: { cookies: [], origins: [] } });

test("o aviso de cookies aparece no primeiro acesso e some depois da escolha", async ({ page }) => {
  await page.goto("/");
  const aviso = page.getByRole("region", { name: "Aviso de cookies" });
  await expect(aviso).toBeVisible();
  await aviso.getByRole("button", { name: "Só os essenciais" }).click();
  await expect(aviso).toHaveCount(0);
  const escolha = await page.evaluate(() => JSON.parse(localStorage.getItem("quad-consentimento-cookies") ?? "null"));
  expect(escolha).toMatchObject({ analise: false, marketing: false });
  // A escolha vale nas próximas páginas.
  await page.goto("/turmas");
  await expect(page.getByRole("region", { name: "Aviso de cookies" })).toHaveCount(0);
});

test("as preferências de cookies podem ser mudadas pelo rodapé", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("region", { name: "Aviso de cookies" }).getByRole("button", { name: "Aceitar todos" }).click();
  await page.getByRole("contentinfo").getByRole("button", { name: "Preferências de cookies" }).click();
  const painel = page.getByRole("dialog", { name: "Preferências de cookies" });
  await expect(painel).toBeVisible();
  // A escolha anterior vem marcada; desligar o marketing e salvar.
  await expect(painel.getByRole("switch", { name: "Marketing" })).toHaveAttribute("aria-checked", "true");
  await painel.getByRole("switch", { name: "Marketing" }).click();
  await painel.getByRole("button", { name: "Salvar escolha" }).click();
  await expect(painel).toHaveCount(0);
  const escolha = await page.evaluate(() => JSON.parse(localStorage.getItem("quad-consentimento-cookies") ?? "null"));
  expect(escolha).toMatchObject({ analise: true, marketing: false });
});

test("o aviso e o painel de cookies não têm problemas de acessibilidade WCAG A/AA", async ({ page }) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  const analisar = async () =>
    (await new AxeBuilder({ page }).include("main ~ *").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations.map(
      (v) => `${v.id}: ${v.nodes.map((n) => n.html.slice(0, 80)).join(" | ")}`,
    );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("region", { name: "Aviso de cookies" }).waitFor();
  expect(await analisar()).toEqual([]);
  await page.getByRole("button", { name: "Personalizar" }).click();
  await page.getByRole("dialog").waitFor();
  expect(await analisar()).toEqual([]);
});
