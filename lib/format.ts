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

// 1197 → "R$ 1.197"; 29.9 → "R$ 29,90". Formato dos preços nas vitrines do site.
export function precoSemCentavosZerados(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: Number.isInteger(valor) ? 0 : 2,
  });
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

// Máscara do nome (16/11/2026): cada palavra com a primeira letra maiúscula e o resto minúsculo, venha o nome todo em
// minúsculas ou todo em maiúsculas ("JOÃO DA SILVA" e "joão da silva" viram "João da Silva"). As ligações (da, de, do,
// das, dos, e) ficam minúsculas, menos no começo; depois do hífen e do apóstrofo também vai maiúscula ("Ana-Clara",
// "D'Ávila"). Os espaços ficam como digitados, para não atrapalhar quem está escrevendo; o corte das pontas é no envio.
const LIGACOES_DO_NOME = new Set(["da", "de", "do", "das", "dos", "e"]);

// `continuacao`: o campo do sobrenome, que vem depois do nome; ali a ligação do começo também fica minúscula ("da Silva").
export function formatarNome(valor: string, continuacao = false) {
  let palavra = 0;
  return valor.replace(/\S+/g, (p) => {
    const minuscula = p.toLocaleLowerCase("pt-BR");
    const primeira = palavra++ === 0 && !continuacao;
    if (!primeira && LIGACOES_DO_NOME.has(minuscula)) return minuscula;
    return minuscula.replace(/(^|[-'’])(\p{L})/gu, (_, antes: string, letra: string) => antes + letra.toLocaleUpperCase("pt-BR"));
  });
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

// O prazo de venda da API (ISO-8601 UTC) no horário de Brasília: "2026-11-21T14:50:00Z" -> "sáb., 21/11, às 11h50";
// "2026-11-20T00:00:00Z" -> "qui., 19/11, às 21h". null se a data não for válida.
export function prazoEmTexto(iso: string) {
  const instante = new Date(iso);
  if (Number.isNaN(instante.getTime())) return null;
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(instante)
      .map((x) => [x.type, x.value]),
  );
  const semana = p.weekday.replace(/\.$/, "");
  return `${semana}., ${p.day}/${p.month}, às ${formatarHora(`${p.hour}:${p.minute}`)}`;
}

// "14:00:00" -> "14h", "15:30:00" -> "15h30"
export function formatarHora(hora: string | null) {
  if (!hora) return "";
  const [h, m] = hora.split(":");
  return m && m !== "00" ? `${Number(h)}h${m}` : `${Number(h)}h`;
}
