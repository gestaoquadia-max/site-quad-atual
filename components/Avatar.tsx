import { getIniciais } from "@/lib/format";

export default function Avatar({
  nome,
  fotoUrl,
  size = "h-12 w-12 text-lg",
  bg = "bg-blue",
  text = "text-navy-deep",
}: {
  nome: string;
  fotoUrl?: string;
  size?: string;
  bg?: string;
  text?: string;
}) {
  return (
    <div
      className={`hexagon flex items-center justify-center overflow-hidden font-display font-bold ${size} ${bg} ${text}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {fotoUrl ? <img src={fotoUrl} alt={nome} className="h-full w-full object-cover" /> : getIniciais(nome)}
    </div>
  );
}
