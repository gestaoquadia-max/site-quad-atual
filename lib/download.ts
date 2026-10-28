// Salva no computador do aluno um arquivo baixado da API (o PDF chega com o login no cookie, por fetch, e não por link).
export function salvarArquivo(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
