"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function ListaCarregando({ linhas = 3, altura = "h-[76px]" }: { linhas?: number; altura?: string }) {
  return (
    <div role="status" aria-label="Carregando">
      {Array.from({ length: linhas }, (_, i) => (
        <div key={i} className={`mb-2.5 animate-pulse border border-light bg-white ${altura}`}>
          <div className="flex h-full items-center gap-3.5 px-5">
            <span className="h-11 w-[38px] flex-shrink-0 bg-[#E2DFD6]" />
            <div className="flex-1">
              <div className="mb-2 h-3.5 w-2/5 bg-[#E2DFD6]" />
              <div className="h-3 w-1/4 bg-[#ECE9E1]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListaVazia({
  titulo,
  texto,
  acao,
}: {
  titulo: string;
  texto?: string;
  acao?: { href: string; label: string };
}) {
  return (
    <div className="border border-light bg-white p-10 text-center">
      <p className="font-display mb-1.5 text-lg font-bold uppercase">{titulo}</p>
      {texto && <p className="mx-auto mb-5 max-w-[420px] text-sm text-steel">{texto}</p>}
      {acao && (
        <Link href={acao.href} className="btn btn-blue">
          {acao.label}
        </Link>
      )}
    </div>
  );
}

export function ListaErro({
  mensagem = "Não foi possível carregar estas informações agora.",
  onTentarNovamente,
}: {
  mensagem?: string;
  onTentarNovamente?: () => void;
}) {
  return (
    <div role="alert" className="border border-[#9B3535]/40 bg-[#9B3535]/10 p-8 text-center">
      <p className="mb-4 text-sm text-[#9B3535]">{mensagem}</p>
      <button
        type="button"
        onClick={onTentarNovamente ?? (() => window.location.reload())}
        className="btn btn-outline-dark px-5 py-2.5 text-xs"
      >
        Tentar novamente
      </button>
    </div>
  );
}

// Escolhe o que mostrar numa lista da área do aluno: carregando, erro, vazio ou o conteúdo.
export default function EstadoLista({
  carregando = false,
  erro = null,
  vazio,
  onTentarNovamente,
  linhasCarregando,
  alturaCarregando,
  vazioTitulo,
  vazioTexto,
  vazioAcao,
  children,
}: {
  carregando?: boolean;
  erro?: string | null;
  vazio: boolean;
  onTentarNovamente?: () => void;
  linhasCarregando?: number;
  alturaCarregando?: string;
  vazioTitulo: string;
  vazioTexto?: string;
  vazioAcao?: { href: string; label: string };
  children: ReactNode;
}) {
  if (carregando) return <ListaCarregando linhas={linhasCarregando} altura={alturaCarregando} />;
  if (erro) return <ListaErro mensagem={erro} onTentarNovamente={onTentarNovamente} />;
  if (vazio) return <ListaVazia titulo={vazioTitulo} texto={vazioTexto} acao={vazioAcao} />;
  return <>{children}</>;
}
