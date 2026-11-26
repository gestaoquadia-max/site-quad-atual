import { notFound, redirect } from "next/navigation";
import { blackLiberada } from "@/lib/black/liberada";
import { MENTORIAS_DA_BLACK, mentoriaDaBlack } from "@/lib/black/mentorias";
import { metadadosDaPagina } from "@/lib/seo";
import MentoriaEscolhida from "@/components/blackfriday/mentorias/MentoriaEscolhida";

// A Mentoria de um concurso na Black (27 a 30/11, e na prévia): segue para o checkout da Tutory dele
// (lib/black/mentorias.ts). Fora da Black, volta para /mentorias.

export function generateStaticParams() {
  return MENTORIAS_DA_BLACK.map((m) => ({ concurso: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ concurso: string }> }) {
  const m = mentoriaDaBlack((await params).concurso);
  if (!m) return {};
  return metadadosDaPagina({
    titulo: `Mentoria ${m.nome} · Black Friday`,
    descricao: `Mentoria ${m.nome} com 12 meses de acompanhamento, plano de estudos pelo seu edital e suporte da equipe Quad.`,
    caminho: `/mentorias/${m.id}`,
  });
}

export default async function MentoriaDoConcursoPage({ params }: { params: Promise<{ concurso: string }> }) {
  const m = mentoriaDaBlack((await params).concurso);
  if (!m) notFound();
  if (!(await blackLiberada())) redirect("/mentorias");
  return <MentoriaEscolhida mentoria={m} />;
}
