import type { HistoriaVideo } from "@/lib/data";
import { getIniciais } from "@/lib/format";

export default function HistoriaVideoCard({ historia }: { historia: HistoriaVideo }) {
  return (
    <div className="group relative aspect-video cursor-pointer overflow-hidden bg-gradient-to-br from-navy to-navy-mid">
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-5xl font-bold text-white/10">{getIniciais(historia.nome)}</span>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-navy-deep transition-transform duration-200 group-hover:scale-110">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M4 2.5v13l12-6.5-12-6.5z" />
          </svg>
        </span>
      </div>

      <span className="absolute bottom-3 right-3 bg-navy-deep/80 px-2 py-0.5 text-xs font-semibold text-offwhite">
        {historia.duracao}
      </span>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-deep/95 to-transparent px-4 pb-3 pt-10">
        <div className="font-display text-sm font-bold text-offwhite">{historia.nome}</div>
        <div className="text-xs text-steel-light">{historia.concurso}</div>
      </div>
    </div>
  );
}
