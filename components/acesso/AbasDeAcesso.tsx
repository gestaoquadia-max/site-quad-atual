"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { lerDestinoAposLogin, rotaComDestino } from "@/lib/redirecionamento";

// Link para /entrar ou /cadastro que leva junto o destino pós-login (?redirect=).
export function LinkDeAcesso({ para, className, children }: { para: "/entrar" | "/cadastro"; className?: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <Link
      href={para}
      onClick={(e) => {
        e.preventDefault();
        router.replace(rotaComDestino(para, lerDestinoAposLogin()));
      }}
      className={className}
    >
      {children}
    </Link>
  );
}

// "Entrar | Criar conta": cada aba é uma página (/entrar e /cadastro).
export default function AbasDeAcesso({ atual }: { atual: "/entrar" | "/cadastro" }) {
  const abas = [
    { para: "/entrar" as const, rotulo: "Entrar" },
    { para: "/cadastro" as const, rotulo: "Criar conta" },
  ];
  return (
    <nav aria-label="Acesso" className="grid grid-cols-2 rounded-[14px] bg-[#E6ECF4] p-[5px]">
      {abas.map((a) =>
        a.para === atual ? (
          <span
            key={a.para}
            aria-current="page"
            className="grid h-[46px] place-items-center rounded-[10px] bg-white font-display text-[15px] font-bold text-tinta shadow-[0_1px_2px_rgba(16,27,45,0.08),0_6px_16px_-8px_rgba(16,27,45,0.25)]"
          >
            {a.rotulo}
          </span>
        ) : (
          <LinkDeAcesso
            key={a.para}
            para={a.para}
            className="grid h-[46px] place-items-center rounded-[10px] font-display text-[15px] font-bold text-ardosia transition-colors hover:text-tinta"
          >
            {a.rotulo}
          </LinkDeAcesso>
        ),
      )}
    </nav>
  );
}
