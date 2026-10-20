"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/lib/auth";
import { getIniciais } from "@/lib/format";
import { useCarregandoUsuario, useUsuarioAtual } from "@/lib/usuario";
import { VoltarAoSite } from "./acesso/MolduraDeAcesso";

const menu = [
  { href: "/aluno", label: "Painel" },
  { href: "/aluno/materiais", label: "Meus materiais" },
  { href: "/aluno/turmas", label: "Minhas turmas" },
  { href: "/aluno/eventos", label: "Meus eventos" },
  { href: "/aluno/compras", label: "Compras" },
  { href: "/aluno/perfil", label: "Perfil" },
];

function Marca({ pequena = false }: { pequena?: boolean }) {
  return (
    <Link href="/" aria-label="Quad Concursos — voltar ao site" className="relative flex items-center gap-2.5 px-1.5 py-1">
      <Image src="/images/quad-logo-branco.png" alt="Quad Concursos" width={96} height={36} className={pequena ? "h-8 w-auto" : "h-[34px] w-auto"} />
      <span className="rounded-md bg-azul/[0.16] px-2 py-[3px] text-[10.5px] font-bold uppercase tracking-[0.12em] text-azul-ceu">Aluno</span>
    </Link>
  );
}

function QuemEsta() {
  const usuario = useUsuarioAtual();
  const carregando = useCarregandoUsuario();
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-3.5">
      <span aria-hidden="true" className="grid h-10 w-10 flex-none place-items-center rounded-[11px] bg-azul font-display text-sm font-extrabold text-white">
        {usuario?.nome ? getIniciais(usuario.nome) : ""}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate font-display text-[14.5px] font-bold text-white" title={usuario?.nome}>
          {usuario?.nome ?? (carregando ? "Carregando..." : "Aluno")}
        </span>
        <span className="truncate text-xs text-prata" title={usuario?.email ?? undefined}>
          {usuario?.email ?? ""}
        </span>
      </span>
    </div>
  );
}

function Navegacao({ aoEscolher }: { aoEscolher?: () => void }) {
  const caminho = usePathname();
  return (
    <nav aria-label="Área do aluno" className="flex flex-col gap-0.5">
      {menu.map((m) => {
        const ativo = caminho === m.href;
        return (
          <Link
            key={m.href}
            href={m.href}
            onClick={aoEscolher}
            aria-current={ativo ? "page" : undefined}
            className={`relative flex min-h-11 items-center rounded-[10px] px-3.5 text-[14.5px] font-semibold transition-colors ${
              ativo ? "bg-azul/[0.14] text-white hover:text-white" : "text-[#C9D5E5] hover:bg-white/5 hover:text-white"
            }`}
          >
            {ativo && <span aria-hidden="true" className="absolute inset-y-2.5 left-0 w-[3px] rounded-full bg-azul-vivo" />}
            {m.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={logout}
        className="flex min-h-11 items-center rounded-[10px] px-3.5 text-left text-[14.5px] font-semibold text-[#C9D5E5] transition-colors hover:bg-white/5 hover:text-white"
      >
        Sair
      </button>
    </nav>
  );
}

// Barra lateral fixa em telas largas; no celular, uma barra no topo com o menu recolhível.
export default function AlunoSidebar() {
  const caminho = usePathname();
  const [aberto, setAberto] = useState(false);
  const atual = menu.find((m) => m.href === caminho)?.label ?? "Menu";

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[272px] flex-none flex-col gap-[18px] overflow-y-auto border-r border-white/[0.06] bg-marinho-950 px-4 py-[22px] text-white lg:flex">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[image:radial-gradient(90%_40%_at_0%_0%,rgba(0,107,255,0.18),transparent_70%)]" />
        <Marca />
        <div className="relative">
          <QuemEsta />
        </div>
        <div className="relative">
          <Navegacao />
        </div>
        <VoltarAoSite className="relative mt-auto h-11 rounded-[10px] border-white/[0.12] text-[#C9D5E5]" />
      </aside>

      <div className="sticky top-0 z-20 border-b border-white/[0.06] bg-marinho-950 text-white lg:hidden">
        <div className="flex h-16 items-center justify-between gap-3 px-5">
          <Marca pequena />
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            aria-controls="menu-do-aluno"
            className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-white/[0.14] px-3.5 text-sm font-semibold"
          >
            <span className="sr-only">Menu da área do aluno: </span>
            {atual}
            <svg width="12" height="8" viewBox="0 0 10 6" fill="none" aria-hidden="true" className={`transition-transform ${aberto ? "rotate-180" : ""}`}>
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {aberto && (
          <div id="menu-do-aluno" className="flex flex-col gap-3.5 px-4 pb-[18px] pt-1">
            <QuemEsta />
            <Navegacao aoEscolher={() => setAberto(false)} />
            <VoltarAoSite className="h-11 rounded-[10px] border-white/[0.12] text-[#C9D5E5]" />
          </div>
        )}
      </div>
    </>
  );
}
