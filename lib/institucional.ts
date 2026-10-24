// Dados oficiais da empresa usados em Contato, Termos de uso e Política de privacidade.
// Preencher com os dados reais. Campo vazio ("") não aparece no site publicado; em desenvolvimento,
// aparece marcado como pendente para não ser esquecido.
export const institucional = {
  nomeFantasia: "Quad Concursos",
  razaoSocial: "PROJETO QUADRIVIUM LTDA",
  cnpj: "27.298.324/0001-04",
  cidade: "Feira de Santana — BA",
  // Endereço da sede: rua e bairro, e CEP (separados para os dados estruturados do Google); o completo é montado abaixo.
  logradouro: "Rua Leolinda Bacelar, 245 — Kalilândia",
  cep: "44001-240",
  endereco: "Rua Leolinda Bacelar, 245 — Kalilândia, Feira de Santana — BA, 44001-240",
  // Só dígitos com DDD, ex.: "75999990000". Número do atendimento informado na entrega do novo visual (out/2026).
  whatsapp: "75991884598",
  telefone: "75981442124",
  emailAtendimento: "suporte@quadconcursos.com.br",
  // Encarregado de dados (LGPD, art. 41): o nome tem de ser público, com o contato.
  encarregado: "Amanda Jennifer",
  // E-mail do encarregado de dados (LGPD), para pedidos de acesso, correção ou exclusão de dados
  emailPrivacidade: "suporte@quadconcursos.com.br",
  // Usuário sem @, ex.: "quadconcursos"
  instagram: "quadconcursos",
  horarioAtendimento: "Segunda a sexta, das 8h às 21h · Sábado, das 8h às 12h",
  // Termos de uso, item 5: o que vale para cancelar depois dos 7 dias do arrependimento (decisão do Quad). Texto
  // corrido, ex.: "turmas podem ser canceladas até o início das aulas, com devolução de 80% do valor pago."
  politicaDeCancelamento: "",
  // Foro escolhido pela assessoria jurídica para os Termos de uso
  foro: "Feira de Santana — BA",
};

export function linkDoWhatsApp(numero: string) {
  return `https://wa.me/55${numero.replace(/\D/g, "")}`;
}

export function formatarTelefoneFixoOuCelular(numero: string) {
  const d = numero.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return numero;
}
