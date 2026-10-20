"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function ListaCarregando({ linhas = 3, altura = "h-[76px]" }: { linhas?: number; altura?: string }) {
  return (
    <div role="status" aria-label="Carregando" className="flex flex-col gap-3">
      {Array.from({ length: linhas }, (_, i) => (
        <div key={i} className={`animate-pulse rounded-[18px] border border-linha bg-white ${altura}`}>
          <div className="flex h-full items-center gap-3.5 px-5">
            <span className="h-11 w-11 flex-shrink-0 rounded-[10px] bg-[#E6ECF4]" />
            <div className="flex-1">
              <div className="mb-2 h-3.5 w-2/5 rounded bg-[#E6ECF4]" />
              <div className="h-3 w-1/4 rounded bg-[#EEF2F7]" />
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
    <div className="flex flex-col items-center rounded-[18px] border-[1.5px] border-dashed border-[#C9D3E0] bg-white/60 px-6 py-12 text-center">
      <p className="mb-1.5 font-display text-xl font-extrabold tracking-[-0.01em] text-tinta">{titulo}</p>
      {texto && <p className="mb-5 max-w-[420px] text-[15px] leading-[1.55] text-ardosia">{texto}</p>}
      {acao && (
        <Link href={acao.href} className="btn-q btn-q-azul h-11 px-5 text-sm">
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
    <div role="alert" className="flex flex-col items-center rounded-[18px] border border-[#F1C4C4] bg-[#FFF5F5] px-6 py-8 text-center">
      <p className="mb-4 text-sm text-[#9B1C1C]">{mensagem}</p>
      <button type="button" onClick={onTentarNovamente ?? (() => window.location.reload())} className="btn-q btn-q-contorno h-10 px-4 text-[13.5px]">
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
