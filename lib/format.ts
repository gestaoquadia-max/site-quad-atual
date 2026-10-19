export function getIniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

// "R$ 1.197,00" → 1197; "Gratuito" → 0; "Consulte" ou "—" → null.
export function parsePreco(preco: string): number | null {
  const normalizado = preco.trim().toLowerCase();
  if (normalizado === "gratuito") return 0;
  if (normalizado === "consulte" || normalizado === "—") return null;
  const numerico = preco.replace(/[^\d,]/g, "").replace(",", ".");
  const valor = parseFloat(numerico);
  return isNaN(valor) ? null : valor;
}

export function formatarValor(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatarCpf(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function formatarTelefone(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// "2026-11-20" ou "2026-11-20T18:15:05Z" -> "20/11/2026"
export function formatarData(iso: string) {
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

// "14:00:00" -> "14h", "15:30:00" -> "15h30"
export function formatarHora(hora: string | null) {
  if (!hora) return "";
  const [h, m] = hora.split(":");
  return m && m !== "00" ? `${Number(h)}h${m}` : `${Number(h)}h`;
}
