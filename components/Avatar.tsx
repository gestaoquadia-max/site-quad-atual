import Image from "next/image";
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
      className={`hexagon relative flex items-center justify-center overflow-hidden font-display font-bold ${size} ${bg} ${text}`}
    >
      {fotoUrl ? <Image src={fotoUrl} alt={nome} fill sizes="48px" className="object-cover" /> : getIniciais(nome)}
    </div>
  );
}
