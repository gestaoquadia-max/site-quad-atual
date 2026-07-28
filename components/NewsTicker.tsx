const noticias = [
  "TURMAS · CFP 2025.2 com matrículas abertas — início 04/08",
  "EVENTOS · Simulado Aberto CFP em 26/07 — inscrições abertas",
  "TURMAS · CFO Intensiva com 12 vagas restantes",
  "TURMAS · PRF 2026 — lista de espera com desconto garantido",
];

const SEPARADOR = "     •     ";
const REPETICOES = 4;

export default function NewsTicker() {
  const texto = (noticias.join(SEPARADOR) + SEPARADOR).repeat(REPETICOES);

  return (
    <div className="overflow-hidden whitespace-nowrap bg-blue py-1.5">
      <div className="animate-marquee inline-flex w-max">
        <span className="font-display text-xs font-semibold uppercase tracking-wide text-navy-deep">
          {texto}
        </span>
        <span className="font-display text-xs font-semibold uppercase tracking-wide text-navy-deep">
          {texto}
        </span>
      </div>
    </div>
  );
}
