"use client";

import { useEffect, useRef, useState } from "react";
import { loginComGoogle } from "@/lib/auth";
import { ErroDaApi } from "@/lib/http";

// Client ID do tipo WEB do projeto do Quad no Google Cloud (o mesmo que a API aceita em GOOGLE_CLIENT_IDS). Não é
// segredo. Sem ele, o botão não aparece.
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

type Google = {
  accounts: {
    id: {
      initialize: (o: { client_id: string; callback: (r: { credential: string }) => void; ux_mode?: string }) => void;
      renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
    };
  };
};

// Mensagens da API traduzidas para o que o aluno precisa fazer.
const MENSAGENS: Record<string, string> = {
  SEM_CONTA_PARA_O_EMAIL: "Não encontramos uma conta com esse e-mail do Google. Crie sua conta primeiro ou entre com e-mail e senha.",
  EMAIL_NAO_VERIFICADO_NO_PROVEDOR: "O Google ainda não confirmou esse e-mail. Entre com e-mail e senha.",
  CONTA_JA_VINCULADA_A_OUTRA_IDENTIDADE: "Sua conta já está ligada a outra conta do Google. Entre com ela ou com e-mail e senha.",
  ENTRADA_EXTERNA_DESLIGADA: "A entrada com o Google está indisponível no momento. Entre com e-mail e senha.",
  PROVEDOR_DE_IDENTIDADE_INDISPONIVEL: "O Google não respondeu agora. Tente de novo em instantes ou entre com e-mail e senha.",
};

// Botão oficial "Entrar com o Google": o script do Google devolve o ID token, que a API confere. Só para contas que já
// existem: a API não cria conta por aqui.
export default function EntrarComGoogle({ aoEntrar }: { aoEntrar: () => void }) {
  const lugar = useRef<HTMLDivElement>(null);
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);
  // O aoEntrar muda a cada renderização da página; o botão do Google é desenhado uma vez só.
  const aoEntrarAtual = useRef(aoEntrar);
  useEffect(() => {
    aoEntrarAtual.current = aoEntrar;
  }, [aoEntrar]);

  useEffect(() => {
    if (!CLIENT_ID || !lugar.current) return;
    const el = lugar.current;
    function desenhar() {
      const google = (window as unknown as { google?: Google }).google;
      if (!google) return;
      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async ({ credential }) => {
          setErro("");
          setEntrando(true);
          try {
            await loginComGoogle(credential);
            aoEntrarAtual.current();
          } catch (e) {
            setErro(e instanceof ErroDaApi ? (MENSAGENS[e.codigo ?? ""] ?? e.message) : "Não foi possível conectar. Tente de novo.");
            setEntrando(false);
          }
        },
      });
      google.accounts.id.renderButton(el, { type: "standard", theme: "outline", size: "large", text: "continue_with", shape: "rectangular", locale: "pt-BR", width: el.clientWidth || 320 });
    }
    const existente = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existente) {
      if ((window as unknown as { google?: Google }).google) desenhar();
      else existente.addEventListener("load", desenhar);
      return () => existente.removeEventListener("load", desenhar);
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.addEventListener("load", desenhar);
    document.head.appendChild(script);
    return () => script.removeEventListener("load", desenhar);
  }, []);

  if (!CLIENT_ID) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3 text-[13px] text-ardosia">
        <span className="h-px flex-1 bg-linha" />
        ou
        <span className="h-px flex-1 bg-linha" />
      </div>
      <div ref={lugar} aria-busy={entrando || undefined} className="flex min-h-[44px] justify-center" />
      {erro && (
        <p role="alert" className="rounded-xl border border-[#F1C4C4] bg-[#FFF5F5] p-3 text-[13.5px] leading-[1.5] text-[#9B1C1C]">
          {erro}
        </p>
      )}
    </div>
  );
}
