import Link from "next/link";
import { turmas } from "@/lib/data";
import Kicker from "@/components/Kicker";

export const metadata = { title: "Minhas turmas — Área do Aluno" };

const matriculas = [
  { slug: "cfp-2025-2", aulasConcluidas: 18, aulasTotal: 40 },
];

export default function MinhasTurmasPage() {
  return (
    <>
      <h2 className="font-display text-[28px] font-bold uppercase">Minhas turmas</h2>
      <p className="mb-8 text-sm text-steel">Acompanhe seu progresso nas turmas em que está matriculado.</p>

      {matriculas.map((mat) => {
        const t = turmas.find((x) => x.slug === mat.slug)!;
        const pct = Math.round((mat.aulasConcluidas / mat.aulasTotal) * 100);
        return (
          <div key={t.slug} className="border border-light bg-white p-6">
            <Kicker>{t.tag}</Kicker>
            <h3 className="font-display mt-1.5 mb-1.5 text-xl font-bold uppercase">{t.nome}</h3>
            <p className="mb-5 text-sm text-[#5A6472]">{t.desc}</p>

            <div className="mb-1.5 flex items-center justify-between text-xs text-steel">
              <span>Progresso do curso</span>
              <span className="font-semibold text-navy">
                {mat.aulasConcluidas} de {mat.aulasTotal} aulas
              </span>
            </div>
            <div className="mb-5 h-1.5 w-full bg-[#E2DFD6]">
              <div className="h-full bg-blue" style={{ width: `${pct}%` }} />
            </div>

            <Link href={`/turmas/${t.slug}`} className="btn btn-outline-dark px-5 py-2.5 text-xs">
              Ver detalhes da turma
            </Link>
          </div>
        );
      })}
    </>
  );
}
