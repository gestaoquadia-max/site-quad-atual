// Dados oficiais da empresa usados em Contato, Termos de uso e Política de privacidade.
// Preencher com os dados reais. Campo vazio ("") não aparece no site publicado; em desenvolvimento,
// aparece marcado como pendente para não ser esquecido.
export const institucional = {
  nomeFantasia: "Quad Concursos",
  razaoSocial: "",
  cnpj: "",
  cidade: "Feira de Santana — BA",
  // Endereço completo da sede, ex.: "Rua X, 123 — Centro, Feira de Santana — BA, 44000-000"
  endereco: "",
  // Só dígitos com DDD, ex.: "75999990000". Número do atendimento informado na entrega do novo visual (out/2026).
  whatsapp: "75991884598",
  telefone: "",
  emailAtendimento: "",
  // Encarregado de dados (LGPD, art. 41): o nome tem de ser público, com o contato.
  encarregado: "",
  // E-mail do encarregado de dados (LGPD), para pedidos de acesso, correção ou exclusão de dados
  emailPrivacidade: "",
  // Usuário sem @, ex.: "quadconcursos"
  instagram: "",
  horarioAtendimento: "",
  // Foro escolhido pela assessoria jurídica para os Termos de uso
  foro: "",
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
