import { expect, test } from "@playwright/test";

// Cada turma tem um turno e o seu próprio número (RONDESP 1 Manhã, RONDESP 2 Noite): o seletor de turno da página
// leva à turma do outro turno. Usa a primeira turma da lista que tenha outro turno disponível.
// Desde 09/11/2026 o título é a modalidade com o dia de início ("RONDESP 19/11"): dois turnos que começam no mesmo
// dia têm o mesmo título, então a troca de turma é conferida pelo endereço.
test("o seletor de turno leva à turma do outro turno", async ({ page }) => {
  let achou = false;
  for (const lista of ["/turmas?m=rondesp", "/turmas?m=patamo", "/turmas?m=bope"]) {
    await page.goto(lista);
    const link = page.locator("main").getByRole("link", { name: "Conhecer e matricular" }).first();
    await link.waitFor({ timeout: 5000 }).catch(() => {});
    if (!(await link.count())) continue;
    await page.goto((await link.getAttribute("href"))!);
    const seletor = page.getByRole("navigation", { name: /Turno/ });
    const outro = seletor.getByRole("link").first();
    if (!(await outro.count())) continue;
    const endereco = page.url();
    // O botão mostra o turno e, embaixo, a turma de destino ("Noite" / "RONDESP 19/11").
    const [turno, destino] = (await outro.innerText()).split("\n").map((t) => t.trim());
    await outro.click();
    await expect(page).not.toHaveURL(endereco);
    if (destino) await expect(page.getByRole("heading", { level: 1 })).toHaveText(destino);
    await expect(page.getByRole("navigation", { name: /Turno/ }).locator('[aria-current="page"]')).toHaveText(turno);
    achou = true;
    break;
  }
  test.skip(!achou, "A vitrine da API não tem turma com dois turnos agora.");
});
