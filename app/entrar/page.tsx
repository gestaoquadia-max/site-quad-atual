"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/auth";
import { ErroDaApi } from "@/lib/http";
import { destinoAposLogin } from "@/lib/redirecionamento";
import AbasDeAcesso, { LinkDeAcesso } from "@/components/acesso/AbasDeAcesso";
import { AvisoDeErro, BotaoPrincipal, Campo, TituloDoFormulario } from "@/components/acesso/Campos";

export default function EntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function tentarLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !senha) return setErro("Informe o e-mail e a senha.");
    setErro("");
    setCarregando(true);
    try {
      await login(email.trim(), senha);
      router.push(destinoAposLogin());
    } catch (e) {
      setErro(e instanceof ErroDaApi ? e.message : "Não foi possível conectar. Verifique sua internet e tente novamente.");
      setCarregando(false);
    }
  }

  return (
    <>
      <AbasDeAcesso atual="/entrar" />
      <form onSubmit={tentarLogin} noValidate className="flex flex-col gap-[18px]">
        <TituloDoFormulario titulo="Bem-vindo de volta" subtitulo="Entre com o e-mail e a senha cadastrados." />
        <Campo rotulo="E-mail" tipo="email" autoComplete="email" placeholder="seu@email.com" valor={email} aoMudar={setEmail} />
        <Campo
          rotulo="Senha"
          tipo="password"
          autoComplete="current-password"
          placeholder="••••••••"
          valor={senha}
          aoMudar={setSenha}
          extra={
            <Link href="/esqueci-senha" className="text-[13px] font-semibold text-azul-forte hover:text-azul">
              Esqueci minha senha
            </Link>
          }
        />
        {erro && <AvisoDeErro>{erro}</AvisoDeErro>}
        <BotaoPrincipal type="submit" carregando={carregando} textoCarregando="Entrando…">
          Entrar
        </BotaoPrincipal>
        <div className="mt-1.5 flex flex-col gap-3 rounded-[14px] border border-linha bg-white p-5">
          <span className="font-display text-base font-extrabold text-tinta">Ainda não tem conta?</span>
          <span className="text-sm leading-[1.5] text-ardosia">Cadastre-se para acessar seus materiais, turmas e eventos.</span>
          <LinkDeAcesso
            para="/cadastro"
            className="grid h-[50px] place-items-center rounded-[11px] bg-marinho-900 font-display text-[15.5px] font-bold text-white transition-colors hover:bg-[#12305A] hover:text-white"
          >
            Criar minha conta
          </LinkDeAcesso>
        </div>
      </form>
    </>
  );
}
