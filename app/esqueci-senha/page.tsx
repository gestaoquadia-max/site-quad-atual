"use client";

import { useState } from "react";
import Link from "next/link";
import { solicitarRedefinicaoDeSenha } from "@/lib/auth";
import { ErroDaApi } from "@/lib/http";

function emailValido(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function enviar() {
    if (!emailValido(email)) return setErro("Informe um e-mail válido.");
    setErro("");
    setEnviando(true);
    try {
      await solicitarRedefinicaoDeSenha(email.trim());
      setEnviado(true);
    } catch (e) {
      setErro(
        e instanceof ErroDaApi ? e.message : "Não foi possível conectar. Verifique sua internet e tente novamente.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-navy-deep px-6 py-12">
      <div className="w-full max-w-[420px] border border-t-[3px] border-dark border-t-blue bg-navy-mid px-10 py-11">
        <span className="eyebrow">Área do aluno</span>
        <h2 className="font-display mb-1.5 mt-3.5 text-[26px] font-bold uppercase text-offwhite">Esqueci minha senha</h2>

        {enviado ? (
          <>
            <p className="mb-6 text-sm leading-relaxed text-steel-light" role="status">
              Se houver uma conta com o e-mail <strong className="text-offwhite">{email.trim()}</strong>, enviamos um
              link para criar uma nova senha. O link vale por 1 hora. Confira também a caixa de spam.
            </p>
            <Link href="/entrar" className="btn btn-blue block w-full text-center">
              Voltar para o login
            </Link>
            <button
              type="button"
              onClick={() => setEnviado(false)}
              className="focus-ring mt-4 block w-full text-center text-[13px] text-steel-light transition-colors hover:text-blue"
            >
              Não recebeu? Enviar de novo
            </button>
          </>
        ) : (
          <>
            <p className="mb-6 text-sm text-steel-light">
              Informe o e-mail da sua conta. Vamos enviar um link para você criar uma nova senha.
            </p>

            <label
              htmlFor="esqueci-email"
              className="font-display mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-steel-light"
            >
              E-mail
            </label>
            <input
              id="esqueci-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviar()}
              placeholder="seu@email.com"
              className="mb-4 w-full border border-dark bg-navy-deep px-3.5 py-3 text-[15px] text-offwhite outline-none transition-colors placeholder:text-[#4A5768] focus:border-blue"
            />

            {erro && (
              <div
                role="alert"
                className="mb-3.5 border border-[#9B3535]/50 bg-[#9B3535]/15 px-3.5 py-2.5 text-[13px] text-[#E08A8A]"
              >
                {erro}
              </div>
            )}

            <button onClick={enviar} disabled={enviando} className="btn btn-blue mt-2 block w-full disabled:opacity-60">
              {enviando ? "Enviando..." : "Enviar link"}
            </button>

            <div className="mt-4 text-center text-[13px]">
              <Link href="/entrar" className="focus-ring text-steel-light transition-colors hover:text-blue">
                Lembrei a senha
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
