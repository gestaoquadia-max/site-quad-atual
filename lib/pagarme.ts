// Tokenização do cartão direto no Pagar.me, com a chave PÚBLICA que a API publica (GET /api/loja/pagamentos/configuracao).
// O número do cartão vai do navegador ao Pagar.me e nunca passa pela API nem pelo site; a API recebe só o token.
// Na conta do Pagar.me, o domínio do site precisa estar autorizado para usar a chave pública.

export type DadosDoCartao = { numero: string; nome: string; validade: string; cvv: string };

export class ErroDoCartao extends Error {}

const URL_DOS_TOKENS = "https://api.pagar.me/core/v5/tokens";

export function soDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

// "0000 0000 0000 0000"
export function formatarNumeroDoCartao(valor: string) {
  return soDigitos(valor).slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");
}

// "MM/AA"
export function formatarValidade(valor: string) {
  const d = soDigitos(valor).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

// Conferência básica antes de ir ao Pagar.me; a validação de verdade é dele e do banco.
export function problemaNoCartao(c: DadosDoCartao): string | null {
  const numero = soDigitos(c.numero);
  if (numero.length < 13) return "Confira o número do cartão.";
  if (c.nome.trim().length < 3) return "Informe o nome como está impresso no cartão.";
  const [mes, ano] = c.validade.split("/").map(Number);
  if (!mes || mes > 12 || !ano) return "Confira a validade do cartão (MM/AA).";
  const hoje = new Date();
  const anoCompleto = 2000 + ano;
  if (anoCompleto < hoje.getFullYear() || (anoCompleto === hoje.getFullYear() && mes < hoje.getMonth() + 1)) return "Este cartão está vencido.";
  if (soDigitos(c.cvv).length < 3) return "Confira o código de segurança (CVV).";
  return null;
}

export async function tokenizarCartao(chavePublica: string, c: DadosDoCartao): Promise<string> {
  const [mes, ano] = c.validade.split("/").map(Number);
  let res: Response;
  try {
    res = await fetch(`${URL_DOS_TOKENS}?appId=${encodeURIComponent(chavePublica)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "card",
        card: { number: soDigitos(c.numero), holder_name: c.nome.trim(), exp_month: mes, exp_year: 2000 + ano, cvv: soDigitos(c.cvv) },
      }),
    });
  } catch {
    throw new ErroDoCartao("Não foi possível falar com o processador do cartão. Verifique sua internet e tente novamente.");
  }
  if (!res.ok) throw new ErroDoCartao("Os dados do cartão foram recusados. Confira o número, a validade e o CVV.");
  const corpo = (await res.json()) as { id?: string };
  if (!corpo.id) throw new ErroDoCartao("Não foi possível validar o cartão. Tente novamente.");
  return corpo.id;
}
