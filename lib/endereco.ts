export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export function formatarCep(valor: string) {
  const digitos = valor.replace(/\D/g, "").slice(0, 8);
  return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
}

// Consulta o ViaCEP. Devolve null quando o CEP não existe; lança erro se não conseguir consultar.
export async function buscarEnderecoPorCep(
  cep: string,
): Promise<{ rua: string; bairro: string; cidade: string; estado: string } | null> {
  const res = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, "")}/json/`);
  const data = await res.json();
  if (data.erro) return null;
  return {
    rua: data.logradouro || "",
    bairro: data.bairro || "",
    cidade: data.localidade || "",
    estado: UFS.includes(data.uf) ? data.uf : "",
  };
}
