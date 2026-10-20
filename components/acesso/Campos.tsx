"use client";

import { useId, useState } from "react";

// Peças dos formulários de acesso e da área do aluno, no novo visual (fundo claro).

export const CLASSE_DO_CAMPO =
  "h-[52px] w-full rounded-[10px] border border-linha-forte bg-white px-3.5 text-[15.5px] text-tinta outline-none transition-[border-color,box-shadow] placeholder:text-[#97A3B4] focus:border-azul focus:shadow-[0_0_0_4px_rgba(0,107,255,0.15)] disabled:bg-nevoa disabled:text-ardosia";

export const CLASSE_DO_ROTULO = "text-[13.5px] font-semibold text-tinta";

type PropsDoCampo = {
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
  tipo?: string;
  obrigatorio?: boolean;
  mascara?: (v: string) => string;
  extra?: React.ReactNode;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "className">;

function IconeOlho({ aberto }: { aberto: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
      {!aberto && <path d="M3 3l18 18" />}
    </svg>
  );
}

// Campo com rótulo; o de senha ganha o botão de mostrar/ocultar.
export function Campo({ rotulo, valor, aoMudar, tipo = "text", obrigatorio, mascara, extra, className = "", id, ...resto }: PropsDoCampo) {
  const idGerado = useId();
  const idDoCampo = id ?? idGerado;
  const [visivel, setVisivel] = useState(false);
  const ehSenha = tipo === "password";
  return (
    <div className={`flex flex-col gap-[7px] ${className}`}>
      <span className="flex items-baseline justify-between gap-3">
        <label htmlFor={idDoCampo} className={CLASSE_DO_ROTULO}>
          {rotulo}
          {obrigatorio && (
            <span className="text-[#B42323]" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </label>
        {extra}
      </span>
      <span className="relative block">
        <input
          id={idDoCampo}
          type={ehSenha && visivel ? "text" : tipo}
          inputMode={mascara ? "numeric" : undefined}
          value={valor}
          onChange={(e) => aoMudar(mascara ? mascara(e.target.value) : e.target.value)}
          required={obrigatorio}
          className={`${CLASSE_DO_CAMPO} ${ehSenha ? "pr-[52px]" : ""}`}
          {...resto}
        />
        {ehSenha && (
          <button
            type="button"
            onClick={() => setVisivel((v) => !v)}
            aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={visivel}
            className="absolute right-1 top-1 grid h-11 w-11 place-items-center rounded-lg text-ardosia transition-colors hover:text-azul"
          >
            <IconeOlho aberto={!visivel} />
          </button>
        )}
      </span>
    </div>
  );
}

export function Seletor({
  rotulo,
  valor,
  aoMudar,
  obrigatorio,
  children,
  className = "",
}: {
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
  obrigatorio?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={`flex flex-col gap-[7px] ${className}`}>
      <label htmlFor={id} className={CLASSE_DO_ROTULO}>
        {rotulo}
        {obrigatorio && (
          <span className="text-[#B42323]" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      <select id={id} value={valor} onChange={(e) => aoMudar(e.target.value)} required={obrigatorio} className={CLASSE_DO_CAMPO}>
        {children}
      </select>
    </div>
  );
}

export function AvisoDeErro({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div role="alert" className={`rounded-[10px] border border-[#F1C4C4] bg-[#FFF5F5] px-4 py-3 text-sm leading-[1.5] text-[#9B1C1C] ${className}`}>
      {children}
    </div>
  );
}

export function AvisoInformativo({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div role="status" className={`rounded-[10px] border border-azul/25 bg-azul-gelo px-4 py-3 text-sm leading-[1.55] text-ardosia-escura ${className}`}>
      {children}
    </div>
  );
}

function Rodinha() {
  return <span aria-hidden="true" className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/35 border-t-white" />;
}

// Botão principal azul; mostra a rodinha e o texto de espera enquanto a ação roda.
export function BotaoPrincipal({
  carregando,
  textoCarregando,
  children,
  className = "",
  ...resto
}: { carregando?: boolean; textoCarregando?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      disabled={carregando || resto.disabled}
      aria-busy={carregando || undefined}
      className={`btn-q btn-q-azul h-[54px] w-full text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_12px_26px_-14px_rgba(0,107,255,1)] disabled:cursor-progress disabled:bg-[#4D8DFF] ${className}`}
      {...resto}
    >
      {carregando ? (
        <>
          <Rodinha />
          {textoCarregando}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function TituloDoFormulario({ titulo, subtitulo, extra }: { titulo: string; subtitulo?: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h1 className="font-display text-[clamp(26px,2.4vw,32px)] font-extrabold tracking-[-0.03em] text-tinta">{titulo}</h1>
        {subtitulo && <p className="mt-1.5 text-[15px] leading-[1.5] text-ardosia">{subtitulo}</p>}
      </div>
      {extra}
    </div>
  );
}
