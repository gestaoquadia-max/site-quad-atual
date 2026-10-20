// Título e subtítulo de cada página da área do aluno.
export default function CabecalhoDoAluno({ titulo, subtitulo }: { titulo: string; subtitulo: string }) {
  return (
    <header className="mb-7">
      <h1 className="mb-1.5 font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">{titulo}</h1>
      <p className="max-w-[600px] text-[15.5px] leading-[1.55] text-ardosia">{subtitulo}</p>
    </header>
  );
}

// Cartão branco padrão da área do aluno.
export const CLASSE_DO_CARTAO = "rounded-[18px] border border-linha bg-white shadow-[0_1px_2px_rgba(16,27,45,0.05),0_12px_28px_-22px_rgba(7,20,38,0.25)]";

// Selo de tipo (PDF, Slides, Vídeo...) à esquerda das linhas.
export const CLASSE_DO_SELO =
  "inline-grid h-11 min-w-11 flex-none place-items-center rounded-[10px] bg-azul-palido px-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-azul-forte";

// Botão pequeno de contorno das linhas (Baixar, Ver boleto...).
export const CLASSE_DO_BOTAO_PEQUENO =
  "inline-flex h-10 flex-none items-center justify-center rounded-[9px] border border-linha-forte bg-white px-4 font-display text-[13.5px] font-bold text-tinta transition-colors hover:border-azul hover:text-azul disabled:opacity-60";

// Etiqueta de situação (Ativa, Inscrito, Pago...).
export function Etiqueta({ tom, children }: { tom: "verde" | "amarelo" | "vermelho" | "cinza" | "azul"; children: React.ReactNode }) {
  const cores = {
    verde: "bg-[#E4F4EA] text-[#1D6B3A]",
    amarelo: "bg-[#FFF4D6] text-[#7A5A00]",
    vermelho: "bg-[#FDECEC] text-[#9B1C1C]",
    cinza: "bg-[#EEF2F7] text-ardosia-escura",
    azul: "bg-azul-palido text-azul-forte",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${cores[tom]}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
