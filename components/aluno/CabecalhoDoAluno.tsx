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
export const CLASSE_DO_CARTAO = "rounded-[18px] border border-linha bg-superficie shadow-cartao";

// Selo de tipo (PDF, Slides, Vídeo...) à esquerda das linhas.
export const CLASSE_DO_SELO =
  "inline-grid h-11 min-w-11 flex-none place-items-center rounded-[10px] bg-azul/15 px-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-azul-ceu";

// Botão pequeno de contorno das linhas (Baixar PDF, Desistir...).
export const CLASSE_DO_BOTAO_PEQUENO =
  "inline-flex h-10 flex-none items-center justify-center rounded-[9px] border border-linha-forte bg-superficie px-4 font-display text-[13.5px] font-bold text-tinta transition-colors hover:border-azul hover:text-azul-ceu disabled:opacity-60";

// Etiqueta de situação (Ativa, Inscrito, Pago...).
export function Etiqueta({ tom, children }: { tom: "verde" | "amarelo" | "vermelho" | "cinza" | "azul"; children: React.ReactNode }) {
  const cores = {
    verde: "bg-[rgba(34,197,94,0.14)] text-[#5FD39A]",
    amarelo: "bg-[rgba(245,158,11,0.14)] text-[#F5C46A]",
    vermelho: "bg-[rgba(220,38,38,0.14)] text-[#FF9C9C]",
    cinza: "bg-nevoa-clara text-ardosia-escura",
    azul: "bg-azul/15 text-azul-ceu",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${cores[tom]}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
