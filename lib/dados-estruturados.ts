// Dados estruturados (schema.org, JSON-LD) que o Google lê para mostrar a empresa, as turmas e os eventos.
// Validar em https://search.google.com/test/rich-results
import type { Evento, Turma } from "./data";
import { parsePreco } from "./format";
import { institucional } from "./institucional";
import { DESCRICAO_DO_SITE, NOME_DO_SITE, URL_DO_SITE } from "./seo";

const ID_DA_ORGANIZACAO = `${URL_DO_SITE}/#organizacao`;
const IMAGEM = `${URL_DO_SITE}/opengraph-image`;

function endereco() {
  return {
    "@type": "PostalAddress",
    ...(institucional.logradouro ? { streetAddress: institucional.logradouro } : {}),
    ...(institucional.cep ? { postalCode: institucional.cep } : {}),
    addressLocality: "Feira de Santana",
    addressRegion: "BA",
    addressCountry: "BR",
  };
}

// Campos ainda vazios em lib/institucional.ts ficam de fora, em vez de irem em branco.
export function dadosDaOrganizacao() {
  const telefone = institucional.whatsapp || institucional.telefone;
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": ID_DA_ORGANIZACAO,
    name: NOME_DO_SITE,
    url: URL_DO_SITE,
    logo: `${URL_DO_SITE}/apple-icon`,
    image: IMAGEM,
    description: DESCRICAO_DO_SITE,
    foundingDate: "2013",
    address: endereco(),
    ...(telefone ? { telephone: `+55${telefone.replace(/\D/g, "")}` } : {}),
    ...(institucional.emailAtendimento ? { email: institucional.emailAtendimento } : {}),
    ...(institucional.instagram ? { sameAs: [`https://www.instagram.com/${institucional.instagram}`] } : {}),
  };
}

function oferta(preco: string, url: string, esgotado: boolean) {
  const valor = parsePreco(preco);
  if (valor === null) return undefined;
  return {
    "@type": "Offer",
    price: valor.toFixed(2),
    priceCurrency: "BRL",
    url,
    availability: esgotado ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    ...(valor > 0 ? { category: "Paid" } : { category: "Free" }),
  };
}

export function dadosDoCurso(turma: Turma) {
  const url = `${URL_DO_SITE}/turmas/${turma.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: turma.nome,
    description: turma.detalhe?.lead ?? turma.desc,
    url,
    image: IMAGEM,
    inLanguage: "pt-BR",
    provider: { "@id": ID_DA_ORGANIZACAO, "@type": "EducationalOrganization", name: NOME_DO_SITE, url: URL_DO_SITE },
    offers: oferta(turma.preco, url, turma.status !== "aberta"),
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Onsite",
      location: { "@type": "Place", name: "Feira de Santana — BA", address: endereco() },
    },
  };
}

// Sem data completa (detalhe.inicio), o Google não aceita o evento: nesse caso não gera nada.
export function dadosDoEvento(e: Evento) {
  const d = e.detalhe;
  if (!d?.inicio) return null;
  const url = `${URL_DO_SITE}/eventos/${e.slug}`;
  const formato = d.specs.find((s) => s.label === "Formato")?.valor.toLowerCase() ?? "";
  const modo = formato.includes("híbrido")
    ? "MixedEventAttendanceMode"
    : formato.includes("online")
      ? "OnlineEventAttendanceMode"
      : "OfflineEventAttendanceMode";
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.nome,
    description: d.lead,
    url,
    image: IMAGEM,
    startDate: d.inicio,
    ...(d.fim ? { endDate: d.fim } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: `https://schema.org/${modo}`,
    location: { "@type": "Place", name: d.local.nome, address: endereco() },
    organizer: { "@id": ID_DA_ORGANIZACAO, "@type": "EducationalOrganization", name: NOME_DO_SITE, url: URL_DO_SITE },
    offers: oferta(e.preco, url, d.vagasTotal !== undefined && d.vagasOcupadas !== undefined && d.vagasOcupadas >= d.vagasTotal),
  };
}
