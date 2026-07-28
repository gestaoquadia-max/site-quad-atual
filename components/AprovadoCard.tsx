import type { Aprovado } from "@/lib/data";
import { getIniciais } from "@/lib/format";

export default function AprovadoCard({ aprovado }: { aprovado: Aprovado }) {
  const [principal, destaque] = aprovado.concurso.split(" — ");

  return (
    <div className="flex h-full min-h-[260px] overflow-hidden bg-white">
      <div className="relative w-2/5 flex-shrink-0 overflow-hidden bg-gradient-to-br from-navy to-navy-mid">
        {aprovado.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={aprovado.fotoUrl} alt={aprovado.nome} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-6xl font-bold text-white/10">{getIniciais(aprovado.nome)}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center bg-offwhite p-8">
        <span className="mb-3 inline-block w-fit rounded-full bg-blue px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-navy-deep">
          Quad Aprovado
        </span>
        <p className="font-display text-2xl font-bold uppercase leading-tight text-navy">
          {principal} {destaque && <span className="text-blue">{destaque}</span>}
        </p>
        <p className="mt-3 text-sm text-steel">
          {aprovado.nome} · {aprovado.turma}
        </p>
      </div>
    </div>
  );
}
