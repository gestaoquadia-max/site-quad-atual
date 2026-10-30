import Image from "next/image";
import Link from "next/link";

// Decisão de 30/10/2026: cada submenu mostra no máximo 4 itens (no computador e no celular); o resto fica no "Ver todos".
export const ITENS_NO_MENU = 4;

// Ponto colorido ao lado de cada item: verde = aberto, azul = informativo, cinza = encerrado.
const CORES_DO_PONTO = {
  aberta: "bg-[#22B573]",
  breve: "bg-[#4D9BFF]",
  encerrada: "bg-[#A3AEBD]",
};

export type MegaMenuItem = {
  href: string;
  nome: string;
  meta: string;
  status?: "aberta" | "breve" | "encerrada";
  // Cor do ponto no lugar da cor da situação (ex.: o turno da turma). Classe Tailwind de fundo.
  corDoPonto?: string;
};

export type MegaMenuFeatured = {
  eyebrow: string;
  title: string;
  desc: string;
  meta?: string;
  ctaLabel: string;
  ctaHref: string;
  // Imagem do destaque (insígnia da turma, capa do material). Sem ela, o logo do Quad em marca d'água.
  imagem?: string | null;
  // Vinho nas Mentorias; azul no resto.
  tom?: "azul" | "vinho";
};

// Links para fora do site (landing das Mentorias) abrem na mesma aba, como os demais itens do menu.
function LinkDoMenu({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  return href.startsWith("http") ? (
    <a href={href} className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

const FUNDO_DO_DESTAQUE = {
  azul: "bg-[linear-gradient(160deg,#12305A,#071426_80%)]",
  vinho: "bg-[linear-gradient(160deg,#5A1424,#1A060C_80%)]",
};

// Painel solto abaixo da barra, no estilo de cartão: à esquerda o nome da seção e até 4 itens; à direita o destaque,
// com imagem, título e o botão.
export default function NavMegaMenu({
  rotulo,
  items,
  featured,
  viewAllHref,
  viewAllLabel,
}: {
  rotulo: string;
  items: MegaMenuItem[];
  featured: MegaMenuFeatured;
  viewAllHref: string;
  viewAllLabel: string;
}) {
  const visiveis = items.slice(0, ITENS_NO_MENU);
  const tom = featured.tom ?? "azul";
  return (
    // A centralização (translate) fica no elemento de fora; a animação de entrada, que também usa transform, no de dentro.
    <div className="absolute left-1/2 top-full w-[min(860px,calc(100vw-40px))] -translate-x-1/2 pt-2.5">
      <div className="grid animate-[q-surgir_200ms_cubic-bezier(.2,.7,.2,1)_both] grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-2 rounded-[20px] bg-white p-2.5 shadow-[0_30px_70px_-24px_rgba(7,20,38,0.55),0_0_0_1px_rgba(16,27,45,0.06)]">
        <div className="flex flex-col px-5 pb-3 pt-5">
          <span className="mb-2 text-xs font-medium text-ardosia">{rotulo}</span>
          {visiveis.length === 0 && <p className="py-2 text-sm text-ardosia">Nada aberto no momento.</p>}
          <ul className="flex flex-col">
            {visiveis.map((it) => (
              <li key={it.href + it.nome}>
                <LinkDoMenu
                  href={it.href}
                  className="-mx-2.5 flex flex-col gap-1 rounded-[10px] px-2.5 py-2.5 transition-colors hover:bg-nevoa"
                >
                  <span className="font-display text-[15px] font-bold tracking-[-0.01em] text-tinta">{it.nome}</span>
                  <span className="flex items-center gap-2 text-[12.5px] text-ardosia">
                    <span className={`h-1.5 w-1.5 flex-none rounded-full ${it.corDoPonto ?? CORES_DO_PONTO[it.status ?? "breve"]}`} />
                    {it.meta}
                  </span>
                </LinkDoMenu>
              </li>
            ))}
          </ul>
          <LinkDoMenu
            href={viewAllHref}
            className="mt-auto inline-flex min-h-[44px] items-center gap-1.5 pt-3 text-[13px] font-bold text-azul-forte transition-colors hover:text-marinho-600"
          >
            {viewAllLabel} →
          </LinkDoMenu>
        </div>

        <div className={`relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-[14px] p-6 text-white ${FUNDO_DO_DESTAQUE[tom]}`}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_80%_10%,rgba(255,255,255,0.12),transparent_70%)]" />
          {featured.imagem ? (
            <Image
              src={featured.imagem}
              alt=""
              width={160}
              height={160}
              sizes="160px"
              className="pointer-events-none absolute right-6 top-5 h-[130px] w-[130px] object-contain [filter:drop-shadow(0_14px_22px_rgba(0,0,0,0.55))]"
            />
          ) : (
            <Image
              src="/images/quad-logo-branco.png"
              alt=""
              aria-hidden="true"
              width={236}
              height={88}
              className="pointer-events-none absolute right-6 top-7 w-[150px] opacity-[0.14]"
            />
          )}
          <div className="relative flex flex-col gap-2">
            <span className={`text-[11px] font-bold uppercase tracking-[0.16em] ${tom === "vinho" ? "text-vinho-rosa" : "text-azul-ceu"}`}>{featured.eyebrow}</span>
            <span className="max-w-[300px] font-display text-[22px] font-extrabold leading-[1.15] tracking-[-0.02em]">{featured.title}</span>
            <span className="line-clamp-2 max-w-[340px] text-[13.5px] leading-[1.5] text-[#C9D5E5]">{featured.desc}</span>
            {featured.meta && <span className="text-xs font-bold uppercase tracking-[0.1em] text-white/80">{featured.meta}</span>}
            <LinkDoMenu
              href={featured.ctaHref}
              className={`btn-q mt-2 h-11 self-start rounded-[9px] px-[18px] text-sm ${tom === "vinho" ? "btn-q-vinho" : "btn-q-azul"}`}
            >
              {featured.ctaLabel}
            </LinkDoMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
