// Itens da Agenda Quad (/eventos, entrega da designer de 11/11/2026): o card "Próximos na agenda" do topo e o
// calendário. Tudo sai dos mesmos cadastros dos cartões (vitrine da API, lib/vitrine.ts): as edições datadas dos
// simulados, os eventos (aulões) e as excursões. Item sem data não entra no calendário.
import type { Evento } from "./data";
import { paraCartao } from "./eventos";
import { paraCartaoDeExcursao, type ViagemDeExcursao } from "./excursoes";
import { situacaoDa, type Carreira } from "./simulados";

export type TipoNaAgenda = "simulado" | "excursao" | "aulao" | "evento";

// A API não separa aulão de outro evento (11/11/2026): é aulão o evento com "aulão" no nome; o resto (o Treinão do Quad,
// palestras, encontros) entra como evento.
export const ehAulao = (e: Pick<Evento, "nome">) => /aul[ãa]o/i.test(e.nome);

export type ItemDaAgenda = {
  id: string;
  tipo: TipoNaAgenda;
  // "AAAA-MM-DD"
  data: string;
  titulo: string;
  descricao: string;
  href: string;
  // Texto do botão: "Garantir minha vaga" só quando dá para se inscrever.
  acao: string;
};

export const ROTULO_DO_TIPO: Record<TipoNaAgenda, string> = { simulado: "Simulado", excursao: "Excursão", aulao: "Aulão", evento: "Evento" };

export const MESES_CURTOS = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

function doSimulado(carreiras: Carreira[]): ItemDaAgenda[] {
  return carreiras.flatMap((c) =>
    c.edicoes
      // Só o presencial: a edição só para estudo (PDF ou impresso, depois da aplicação) não é um dia na agenda.
      .filter((e) => e.publicado && !e.exemplo && e.data && e.presencial)
      .map((e) => {
        const s = situacaoDa(e);
        const onde = [e.horario, e.local].filter(Boolean).join(" · ");
        return {
          id: `simulado:${c.id}:${e.numero}`,
          tipo: "simulado" as const,
          data: e.data!,
          titulo: `Simulado ${e.numero} · ${c.curto}`,
          descricao: onde ? `Presencial. ${onde}.` : "Simulado presencial do Quad.",
          href: `/simulados?c=${c.id}`,
          acao: s.vendePresencial ? "Garantir minha vaga" : "Ver simulado",
        };
      }),
  );
}

function doEvento(eventos: Evento[]): ItemDaAgenda[] {
  return eventos
    .filter((e) => e.detalhe?.inicio)
    .map((e) => {
      const cartao = paraCartao(e);
      return {
        id: `evento:${e.slug}`,
        tipo: ehAulao(e) ? ("aulao" as const) : ("evento" as const),
        data: e.detalhe!.inicio!.slice(0, 10),
        titulo: e.nome,
        descricao: e.desc,
        href: cartao.href,
        acao: e.status === "encerrada" ? "Ver detalhes" : "Garantir minha vaga",
      };
    });
}

function daExcursao(viagens: ViagemDeExcursao[]): ItemDaAgenda[] {
  return viagens
    .filter((v) => v.data)
    .map((v) => {
      const cartao = paraCartaoDeExcursao(v);
      return {
        id: cartao.id,
        tipo: "excursao" as const,
        data: v.data!,
        titulo: v.titulo,
        descricao: "Viagem para o dia da prova, com embarque na sede do Quad, em Feira de Santana.",
        href: cartao.href,
        acao: cartao.selo.tom === "esgotado" ? "Ver detalhes" : "Garantir minha vaga",
      };
    });
}

export function itensDaAgenda({
  carreiras,
  eventos,
  viagens,
}: {
  carreiras: Carreira[] | null;
  eventos: Evento[] | null;
  viagens: ViagemDeExcursao[] | null;
}): ItemDaAgenda[] {
  return [...doSimulado(carreiras ?? []), ...doEvento(eventos ?? []), ...daExcursao(viagens ?? [])].sort(
    (a, b) => a.data.localeCompare(b.data) || a.titulo.localeCompare(b.titulo),
  );
}

// "Hoje" no fuso da Bahia, "AAAA-MM-DD".
export function hojeNaBahia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bahia" }).format(new Date());
}
