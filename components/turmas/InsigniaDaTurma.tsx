import Image from "next/image";

// Insígnia da turma (uma por MODALIDADE, ver insigniaDaTurma em lib/turmas.ts). Sem insígnia cadastrada,
// a marca do Quad ocupa o lugar, para nenhuma turma ficar sem.
export default function InsigniaDaTurma({
  insignia,
  tamanho,
  sizes,
  className = "",
  priority = false,
}: {
  insignia: string | null | undefined;
  tamanho: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  if (insignia) {
    return (
      <Image
        src={insignia}
        alt=""
        width={tamanho}
        height={tamanho}
        sizes={sizes}
        priority={priority}
        className={`object-contain [filter:drop-shadow(0_8px_16px_rgba(0,0,0,0.5))] ${className}`}
      />
    );
  }
  return (
    <span aria-hidden="true" className={`grid aspect-square place-items-center rounded-full bg-[radial-gradient(closest-side,#1B3A63,#0B1C33)] ${className}`}>
      <Image src="/images/quad-logo-branco.png" alt="" width={tamanho} height={Math.round((tamanho * 324) / 868)} sizes={sizes} className="h-auto w-[62%] opacity-80" />
    </span>
  );
}
