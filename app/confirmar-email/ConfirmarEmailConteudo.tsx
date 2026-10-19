"use client";

import { useState } from "react";
import Link from "next/link";
import { confirmarEmail } from "@/lib/auth";
import { ErroDaApi } from "@/lib/http";

// A confirmação só acontece no clique: o link é de uso único, e confirmar sozinho ao abrir a página
// poderia gastá-lo (ex.: pré-visualização do link pelo app de e-mail).
export default function ConfirmarEmailConteudo({ token }: { token: string | null }) {
  const [estado, setEstado] = useState<"inicial" | "confirmando" | "confirmado" | "invalido" | "erro">(
    token ? "inicial" : "invalido",
  );
  const [mensagem, setMensagem] = useState("");

  async function confirmar() {
    setEstado("confirmando");
    try {
      await confirmarEmail(token!);
      setEstado("confirmado");
    } catch (e) {
      if (e instanceof ErroDaApi && (e.codigo === "TOKEN_INVALIDO" || e.codigo === "TOKEN_EXPIRADO")) {
        setEstado("invalido");
      } else {
        setMensagem(e instanceof ErroDaApi ? e.message : "Não foi possível conectar. Verifique sua internet e tente novamente.");
        setEstado("erro");
      }
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-navy-deep px-6 py-12">
      <div className="w-full max-w-[420px] border border-t-[3px] border-dark border-t-blue bg-navy-mid px-10 py-11">
        <span className="eyebrow text-blue">Área do aluno</span>
        <h1 className="font-display mb-4 mt-3.5 text-[26px] font-bold uppercase text-offwhite">Confirmar e-mail</h1>

        {estado === "confirmado" ? (
          <>
            <p className="mb-6 text-sm text-steel-light" role="status">
              E-mail confirmado. Obrigado!
            </p>
            <Link href="/aluno/perfil" className="btn btn-blue block w-full text-center">
              Ir para o meu perfil
            </Link>
          </>
        ) : estado === "invalido" ? (
          <>
            <p className="mb-6 text-sm text-steel-light" role="alert">
              Este link não é válido ou já venceu. Você pode pedir um novo na página do seu perfil.
            </p>
            <Link href="/aluno/perfil" className="btn btn-blue block w-full text-center">
              Ir para o meu perfil
            </Link>
          </>
        ) : (
          <>
            <p className="mb-6 text-sm text-steel-light">Clique no botão abaixo para confirmar o seu e-mail.</p>
            {estado === "erro" && (
              <div role="alert" className="mb-3.5 border border-[#9B3535]/50 bg-[#9B3535]/15 px-3.5 py-2.5 text-[13px] text-[#E08A8A]">
                {mensagem}
              </div>
            )}
            <button onClick={confirmar} disabled={estado === "confirmando"} className="btn btn-blue block w-full disabled:opacity-60">
              {estado === "confirmando" ? "Confirmando..." : "Confirmar meu e-mail"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
