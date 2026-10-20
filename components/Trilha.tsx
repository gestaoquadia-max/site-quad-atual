import Link from "next/link";
import { Fragment } from "react";

// Trilha de navegação ("Início / Blog / Artigo") do topo escuro das páginas do novo visual.
// O último item é a página atual (sem link).
// tom "claro": para páginas de fundo claro (ex.: produto da loja).
export default function Trilha({
  itens,
  className = "",
  tom = "escuro",
}: {
  itens: { rotulo: string; href?: string }[];
  className?: string;
  tom?: "escuro" | "claro";
}) {
  const claro = tom === "claro";
  return (
    <nav aria-label="Trilha" className={`flex flex-wrap gap-2 text-[13px] ${claro ? "text-ardosia" : "text-prata-escura"} ${className}`}>
      {itens.map((item, i) => (
        <Fragment key={item.rotulo + i}>
          {i > 0 && <span aria-hidden="true">/</span>}
          {item.href ? (
            <Link href={item.href} className={claro ? "text-ardosia hover:text-azul" : "text-prata hover:text-white"}>
              {item.rotulo}
            </Link>
          ) : (
            <span aria-current="page" className={claro ? "text-tinta" : "text-white"}>
              {item.rotulo}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
