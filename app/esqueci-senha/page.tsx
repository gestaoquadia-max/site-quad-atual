"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { solicitarRedefinicaoDeSenha } from "@/lib/auth";
import { ErroDaApi } from "@/lib/http";
import { AvisoDeErro, BotaoPrincipal, Campo, TituloDoFormulario } from "@/components/acesso/Campos";

function emailValido(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

const classeLink = "text-sm font-semibold text-azul-forte transition-colors hover:text-azul disabled:cursor-default disabled:text-ardosia";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  // Validade do link e espera para reenviar, como a API informa.
  const [enviado, setEnviado] = useState<{ validadeEmMinutos: number; reenvioEmSegundos: number } | null>(null);
  const [segundosParaReenviar, setSegundosParaReenviar] = useState(0);

  useEffect(() => {
    if (segundosParaReenviar <= 0) return;
    const t = setTimeout(() => setSegundosParaReenviar((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [segundosParaReenviar]);

  async function enviar() {
    if (!emailValido(email)) return setErro("Informe um e-mail válido.");
    setErro("");
    setEnviando(true);
    try {
      const resposta = await solicitarRedefinicaoDeSenha(email.trim());
      setEnviado(resposta);
      setSegundosParaReenviar(resposta.reenvioEmSegundos);
    } catch (e) {
      setErro(e instanceof ErroDaApi ? e.message : "Não foi possível conectar. Verifique sua internet e tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="flex flex-col gap-[18px]">
        <TituloDoFormulario titulo="Confira seu e-mail" />
        <p className="text-[15px] leading-[1.6] text-ardosia-escura" role="status">
          Se houver uma conta com o e-mail <strong className="text-tinta">{email.trim()}</strong>, enviamos um link para criar uma nova
          senha. O link vale por {enviado.validadeEmMinutos} minutos. Confira também a caixa de spam.
        </p>
        <Link href="/entrar" className="btn-q btn-q-azul h-[54px] w-full text-base">
          Voltar para o login
        </Link>
        {erro && <AvisoDeErro>{erro}</AvisoDeErro>}
        <div className="flex flex-col items-center gap-2.5 border-t border-linha pt-4">
          <button type="button" onClick={enviar} disabled={enviando || segundosParaReenviar > 0} className={classeLink}>
            {enviando
              ? "Enviando..."
              : segundosParaReenviar > 0
                ? `Não recebeu? Você pode pedir de novo em ${segundosParaReenviar} s`
                : "Não recebeu? Enviar de novo"}
          </button>
          <button type="button" onClick={() => setEnviado(null)} className={classeLink}>
            Usar outro e-mail
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        enviar();
      }}
      className="flex flex-col gap-[18px]"
    >
      <TituloDoFormulario titulo="Esqueci minha senha" subtitulo="Informe o e-mail da sua conta. Vamos enviar um link para você criar uma nova senha." />
      <Campo id="esqueci-email" rotulo="E-mail" tipo="email" autoComplete="email" placeholder="seu@email.com" valor={email} aoMudar={setEmail} />
      {erro && <AvisoDeErro>{erro}</AvisoDeErro>}
      <BotaoPrincipal type="submit" carregando={enviando} textoCarregando="Enviando…">
        Enviar link
      </BotaoPrincipal>
      <p className="text-center text-sm text-ardosia">
        Lembrou a senha?{" "}
        <Link href="/entrar" className="font-semibold text-azul-forte hover:text-azul">
          Entrar
        </Link>
      </p>
    </form>
  );
}
