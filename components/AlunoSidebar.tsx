"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "./Avatar";

const usuario = { nome: "João Silva", email: "aluno@quad.com", fotoUrl: undefined as string | undefined };

const menu = [
  { href: "/aluno", label: "Painel" },
  { href: "/aluno/materiais", label: "Meus materiais" },
  { href: "/aluno/turmas", label: "Minhas turmas" },
  { href: "/aluno/eventos", label: "Meus eventos" },
  { href: "/aluno/compras", label: "Compras" },
  { href: "/aluno/perfil", label: "Perfil" },
];

export default function AlunoSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-dark bg-navy-deep md:border-b-0 md:border-r md:py-8">
      <div className="hidden border-b border-dark px-6 pb-6 md:block">
        <Avatar nome={usuario.nome} fotoUrl={usuario.fotoUrl} size="h-12 w-12 text-lg mb-3" />
        <div className="text-[15px] font-semibold text-offwhite">{usuario.nome}</div>
        <div className="text-xs text-steel">{usuario.email}</div>
      </div>
      <ul className="flex overflow-x-auto md:mt-4 md:block">
        {menu.map((m) => {
          const ativo = pathname === m.href;
          return (
            <li key={m.href}>
              <Link
                href={m.href}
                className={`focus-ring block cursor-pointer whitespace-nowrap px-6 py-3 text-sm transition-colors md:border-l-[3px] ${
                  ativo
                    ? "border-blue bg-blue/5 text-blue"
                    : "border-transparent text-steel-light hover:bg-white/5 hover:text-offwhite"
                }`}
              >
                {m.label}
              </Link>
            </li>
          );
        })}
        <li>
          <Link
            href="/"
            className="focus-ring block whitespace-nowrap border-transparent px-6 py-3 text-sm text-steel-light transition-colors hover:text-offwhite md:border-l-[3px]"
          >
            Sair
          </Link>
        </li>
      </ul>
    </aside>
  );
}
