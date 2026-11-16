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

// Modo de consentimento avançado do Google (16/11/2026): o gtag carrega sem escolha nenhuma, começando negado, e não
// grava cookies do Google até o "sim". O Pixel da Meta continua só com o marketing.
const COOKIES_DO_GOOGLE = /^(_ga|_gid|_gcl|_gac|__gads|__gpi|IDE|test_cookie)/;

type Comando = unknown[];
const comandosDoGtag = (page: import("@playwright/test").Page) =>
  page.evaluate(() => (window.dataLayer ?? []).map((a) => Array.from(a as ArrayLike<unknown>)) as unknown[][]);

test("sem escolha, o gtag carrega negado e não grava cookies do Google; o aceite libera", async ({ page, context }) => {
  await page.goto("/");
  await expect(page.locator('script[src="https://www.googletagmanager.com/gtag/js?id=G-DHYL9131J8"]')).toHaveCount(1);
  // O script do Google carregou e já leu a fila.
  await page.waitForFunction(() => "google_tag_manager" in window);

  const antes = (await comandosDoGtag(page)) as Comando[];
  const posDefault = antes.findIndex((c) => c[0] === "consent" && c[1] === "default");
  const posConfig = antes.findIndex((c) => c[0] === "config");
  expect(posDefault).toBeGreaterThanOrEqual(0);
  expect(posDefault).toBeLessThan(posConfig);
  expect(antes[posDefault][2]).toEqual({
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });
  expect(antes.some((c) => c[0] === "consent" && c[1] === "update")).toBe(false);
  // Sem cookie, o gclid segue pelo endereço (url_passthrough), antes do config.
  const posPassthrough = antes.findIndex((c) => c[0] === "set" && c[1] === "url_passthrough" && c[2] === true);
  expect(posPassthrough).toBeGreaterThan(posDefault);
  expect(posPassthrough).toBeLessThan(posConfig);
  expect(antes.filter((c) => c[0] === "config").map((c) => c[1])).toEqual(["G-DHYL9131J8", "AW-18571482116"]);
  await page.waitForTimeout(1500);
  expect((await context.cookies()).map((c) => c.name).filter((n) => COOKIES_DO_GOOGLE.test(n))).toEqual([]);
  expect(await page.evaluate(() => "fbq" in window)).toBe(false);

  await page.getByRole("region", { name: "Aviso de cookies" }).getByRole("button", { name: "Aceitar todos" }).click();
  const depois = (await comandosDoGtag(page)) as Comando[];
  expect(depois.filter((c) => c[0] === "consent" && c[1] === "update").at(-1)?.[2]).toEqual({
    analytics_storage: "granted",
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
  });
  // O site insere um gtag.js só, mesmo depois do aceite (o próprio Google carrega à parte o do Google Ads).
  await expect(page.locator('script[src="https://www.googletagmanager.com/gtag/js?id=G-DHYL9131J8"]')).toHaveCount(1);
  await expect.poll(async () => (await context.cookies()).some((c) => c.name.startsWith("_ga"))).toBe(true);
  expect(await page.evaluate(() => "fbq" in window)).toBe(true);
});

test("só os essenciais: o gtag segue carregado, negado e sem cookies do Google", async ({ page, context }) => {
  await page.goto("/");
  await page.getByRole("region", { name: "Aviso de cookies" }).getByRole("button", { name: "Só os essenciais" }).click();
  await page.goto("/turmas");
  await page.waitForFunction(() => "google_tag_manager" in window);
  const comandos = (await comandosDoGtag(page)) as Comando[];
  expect(comandos.some((c) => c[0] === "consent" && c[1] === "update")).toBe(false);
  await page.waitForTimeout(1500);
  expect((await context.cookies()).map((c) => c.name).filter((n) => COOKIES_DO_GOOGLE.test(n))).toEqual([]);
  expect(await page.evaluate(() => "fbq" in window)).toBe(false);
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
