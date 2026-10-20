import Link from "next/link";
import { Fragment } from "react";

// Trilha de navegação ("Início / Blog / Artigo") do topo escuro das páginas do novo visual.
// O último item é a página atual (sem link).
export default function Trilha({ itens, className = "" }: { itens: { rotulo: string; href?: string }[]; className?: string }) {
  return (
    <nav aria-label="Trilha" className={`flex flex-wrap gap-2 text-[13px] text-prata-escura ${className}`}>
      {itens.map((item, i) => (
        <Fragment key={item.rotulo + i}>
          {i > 0 && <span aria-hidden="true">/</span>}
          {item.href ? (
            <Link href={item.href} className="text-prata hover:text-white">
              {item.rotulo}
            </Link>
          ) : (
            <span aria-current="page" className="text-white">
              {item.rotulo}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
