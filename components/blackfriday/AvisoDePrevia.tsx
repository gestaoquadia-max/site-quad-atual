import { emPrevia } from "@/lib/black/liberada";
import { dentroDaBlack } from "@/lib/black/periodo";

// Selo fixo no canto da tela para quem abriu o link secreto da prévia (app/api/previa): lembra que o que aparece ainda
// não está no ar para o público e oferece a saída. <a> e não <Link>: o Link pré-carregaria a rota e desligaria a prévia.
export default async function AvisoDePrevia() {
  if (!(await emPrevia())) return null;
  return (
    <div className="fixed bottom-[calc(16px+env(safe-area-inset-bottom,0px))] left-4 z-[85] flex items-center gap-3 rounded-full border border-white/15 bg-[#17120F]/95 py-2 pl-4 pr-2 text-[13px] text-white shadow-[0_12px_30px_-10px_rgba(0,0,0,0.8)]">
      <span className="flex items-center gap-2 font-display font-extrabold">
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-laranja" />
        {dentroDaBlack() ? "Modo prévia" : "Prévia da Black · só você vê"}
      </span>
      <a href="/api/previa?sair=1" className="rounded-full border border-white/20 px-3 py-1.5 font-semibold text-white hover:border-white/50 hover:text-white">
        Sair
      </a>
    </div>
  );
}
