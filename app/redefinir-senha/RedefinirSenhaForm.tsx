"use client";

import { useState } from "react";
import Link from "next/link";
import { redefinirSenha } from "@/lib/auth";
import { ErroDaApi } from "@/lib/http";

const classeLabel = "font-display mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-steel-light";
const classeInput =
  "mb-4 w-full border border-dark bg-navy-deep px-3.5 py-3 text-[15px] text-offwhite outline-none transition-colors placeholder:text-[#4A5768] focus:border-blue";

export default function RedefinirSenhaForm({ token }: { token: string | null }) {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  // Link vencido ou já usado: a única saída é pedir um novo.
  const [linkInvalido, setLinkInvalido] = useState(!token);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  async function salvar() {
    if (novaSenha.length < 8 || novaSenha.length > 72) return setErro("A senha deve ter entre 8 e 72 caracteres.");
    if (novaSenha !== confirmar) return setErro("A confirmação não confere com a nova senha.");
    setErro("");
    setSalvando(true);
    try {
      await redefinirSenha(token!, novaSenha);
      setSalvo(true);
    } catch (e) {
      if (e instanceof ErroDaApi && (e.codigo === "TOKEN_INVALIDO" || e.codigo === "TOKEN_EXPIRADO")) {
        setLinkInvalido(true);
      } else if (e instanceof ErroDaApi) {
        const campos = e.erros.map((c) => c.mensagem.charAt(0).toUpperCase() + c.mensagem.slice(1));
        setErro(campos.length ? campos.join(". ") + "." : e.message);
      } else {
        setErro("Não foi possível conectar. Verifique sua internet e tente novamente.");
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-navy-deep px-6 py-12">
      <div className="w-full max-w-[420px] border border-t-[3px] border-dark border-t-blue bg-navy-mid px-10 py-11">
        <span className="eyebrow">Área do aluno</span>
        <h2 className="font-display mb-1.5 mt-3.5 text-[26px] font-bold uppercase text-offwhite">Nova senha</h2>

        {salvo ? (
          <>
            <p className="mb-6 text-sm text-steel-light" role="status">
              Senha alterada. Agora é só entrar com a nova senha.
            </p>
            <Link href="/entrar" className="btn btn-blue block w-full text-center">
              Entrar
            </Link>
          </>
        ) : linkInvalido ? (
          <>
            <p className="mb-6 text-sm text-steel-light" role="alert">
              Este link não é válido ou já venceu. Os links valem por 1 hora e só podem ser usados uma vez.
            </p>
            <Link href="/esqueci-senha" className="btn btn-blue block w-full text-center">
              Pedir um novo link
            </Link>
          </>
        ) : (
          <>
            <p className="mb-6 text-sm text-steel-light">Crie uma nova senha para a sua conta.</p>

            <label htmlFor="nova-senha" className={classeLabel}>
              Nova senha
            </label>
            <input
              id="nova-senha"
              type="password"
              autoComplete="new-password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Entre 8 e 72 caracteres"
              className={classeInput}
            />

            <label htmlFor="confirmar-senha" className={classeLabel}>
              Confirmar nova senha
            </label>
            <input
              id="confirmar-senha"
              type="password"
              autoComplete="new-password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && salvar()}
              placeholder="••••••••"
              className={classeInput}
            />

            {erro && (
              <div
                role="alert"
                className="mb-3.5 border border-[#9B3535]/50 bg-[#9B3535]/15 px-3.5 py-2.5 text-[13px] text-[#E08A8A]"
              >
                {erro}
              </div>
            )}

            <button onClick={salvar} disabled={salvando} className="btn btn-blue mt-2 block w-full disabled:opacity-60">
              {salvando ? "Salvando..." : "Salvar nova senha"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
