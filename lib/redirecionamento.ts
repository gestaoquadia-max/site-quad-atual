// Para onde mandar a pessoa depois de entrar ou criar a conta (?redirect=/rota).
// Lido no momento do clique, direto da URL, para valer também em navegação interna.

const PADRAO = "/aluno";

// Só aceita caminhos internos; evita mandar a pessoa para outro site (ex.: ?redirect=//site.com).
function destinoSeguro(valor: string | null) {
  return valor && valor.startsWith("/") && !valor.startsWith("//") ? valor : null;
}

export function lerDestinoAposLogin(): string | null {
  return destinoSeguro(new URLSearchParams(window.location.search).get("redirect"));
}

export function destinoAposLogin() {
  return lerDestinoAposLogin() ?? PADRAO;
}

export function rotaComDestino(rota: string, destino: string | null) {
  return destino ? `${rota}?redirect=${encodeURIComponent(destino)}` : rota;
}
