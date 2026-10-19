import { defineConfig } from "@playwright/test";

// Testes de ponta a ponta: abrem o site num navegador de verdade e fazem o que o aluno faria.
// Precisam da API local (NEXT_PUBLIC_API_URL) ligada e com os dados de teste (ver tests/e2e/contas.ts).
export default defineConfig({
  testDir: "tests/e2e",
  // Os testes usam os mesmos dados de teste da API: um de cada vez evita um interferir no outro.
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    // Usa o Chrome já instalado no computador, sem baixar navegadores extras.
    channel: "chrome",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  // Sobe o site se ele não estiver rodando; se o `npm run dev` já estiver ligado, usa o que está.
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
