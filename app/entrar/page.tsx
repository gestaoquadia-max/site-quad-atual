"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/auth";
import { ErroDaApi } from "@/lib/http";
import { destinoAposLogin, lerDestinoAposLogin, rotaComDestino } from "@/lib/redirecionamento";

export default function EntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function tentarLogin() {
    setErro("");
    setCarregando(true);
    try {
      await login(email, senha);
      router.push(destinoAposLogin());
    } catch (e) {
      setErro(
        e instanceof ErroDaApi ? e.message : "Não foi possível conectar. Verifique sua internet e tente novamente.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-navy-deep px-6 py-12">
      <div className="w-full max-w-[420px] border border-t-[3px] border-dark border-t-blue bg-navy-mid px-10 py-11">
        <span className="eyebrow">Área do aluno</span>
        <h2 className="font-display mb-1.5 mt-3.5 text-[26px] font-bold uppercase text-offwhite">
          Identifique-se
        </h2>
        <p className="mb-6 text-sm text-steel-light">Acesse seus materiais, turmas e eventos.</p>

        <label className="font-display mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-steel-light">
          E-mail
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="mb-4 w-full border border-dark bg-navy-deep px-3.5 py-3 text-[15px] text-offwhite outline-none transition-colors placeholder:text-[#4A5768] focus:border-blue"
        />

        <label className="font-display mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-steel-light">
          Senha
        </label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && tentarLogin()}
          placeholder="••••••••"
          className="mb-4 w-full border border-dark bg-navy-deep px-3.5 py-3 text-[15px] text-offwhite outline-none transition-colors placeholder:text-[#4A5768] focus:border-blue"
        />

        {erro && (
          <div className="mb-3.5 border border-[#9B3535]/50 bg-[#9B3535]/15 px-3.5 py-2.5 text-[13px] text-[#E08A8A]">
            {erro}
          </div>
        )}

        <button onClick={tentarLogin} disabled={carregando} className="btn btn-blue mt-2 block w-full disabled:opacity-60">
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        <div className="mt-4 flex justify-between text-[13px]">
          <Link href="/esqueci-senha" className="focus-ring cursor-pointer text-steel-light transition-colors hover:text-blue">
            Esqueci minha senha
          </Link>
          <Link
            href="/cadastro"
            onClick={(e) => {
              e.preventDefault();
              router.push(rotaComDestino("/cadastro", lerDestinoAposLogin()));
            }}
            className="focus-ring cursor-pointer text-steel-light transition-colors hover:text-blue"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
}
