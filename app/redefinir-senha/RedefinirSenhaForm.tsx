"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { redefinirSenha, verificarLinkDeRedefinicao } from "@/lib/auth";
import { ErroDaApi } from "@/lib/http";
import { AvisoDeErro, BotaoPrincipal, Campo, TituloDoFormulario } from "@/components/acesso/Campos";

function ehLinkRecusado(e: unknown) {
  return e instanceof ErroDaApi && (e.codigo === "TOKEN_INVALIDO" || e.codigo === "TOKEN_EXPIRADO");
}

export default function RedefinirSenhaForm({ token }: { token: string | null }) {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  // Link vencido ou já usado: a única saída é pedir um novo.
  const [linkInvalido, setLinkInvalido] = useState(!token);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  // Confere o link ao abrir, para não pedir a senha nova à toa. Só um link recusado (TOKEN_INVALIDO) bloqueia;
  // se a conferência falhar por outro motivo, o formulário aparece e a API confere de novo ao salvar.
  const [conferindo, setConferindo] = useState(!!token);

  useEffect(() => {
    if (!token) return;
    let cancelado = false;
    verificarLinkDeRedefinicao(token)
      .catch((e) => {
        if (!cancelado && ehLinkRecusado(e)) setLinkInvalido(true);
      })
      .finally(() => {
        if (!cancelado) setConferindo(false);
      });
    return () => {
      cancelado = true;
    };
  }, [token]);

  async function salvar() {
    if (novaSenha.length < 8 || novaSenha.length > 72) return setErro("A senha deve ter entre 8 e 72 caracteres.");
    if (novaSenha !== confirmar) return setErro("A confirmação não confere com a nova senha.");
    setErro("");
    setSalvando(true);
    try {
      await redefinirSenha(token!, novaSenha);
      setSalvo(true);
    } catch (e) {
      if (ehLinkRecusado(e)) {
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

  if (salvo) {
    return (
      <div className="flex flex-col gap-[18px]">
        <TituloDoFormulario titulo="Senha alterada" />
        <p className="text-[15px] leading-[1.6] text-ardosia-escura" role="status">
          Agora é só entrar com a nova senha.
        </p>
        <Link href="/entrar" className="btn-q btn-q-azul h-[54px] w-full text-base">
          Entrar
        </Link>
      </div>
    );
  }

  if (conferindo) {
    return (
      <div className="flex flex-col gap-[18px]">
        <TituloDoFormulario titulo="Nova senha" />
        <p className="text-[15px] text-ardosia" role="status">
          Conferindo o link...
        </p>
      </div>
    );
  }

  if (linkInvalido) {
    return (
      <div className="flex flex-col gap-[18px]">
        <TituloDoFormulario titulo="Nova senha" />
        <AvisoDeErro>Este link não é válido ou já venceu. Cada link vale por 30 minutos e só pode ser usado uma vez.</AvisoDeErro>
        <Link href="/esqueci-senha" className="btn-q btn-q-azul h-[54px] w-full text-base">
          Pedir um novo link
        </Link>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        salvar();
      }}
      className="flex flex-col gap-[18px]"
    >
      <TituloDoFormulario titulo="Nova senha" subtitulo="Crie uma nova senha para a sua conta." />
      <Campo id="nova-senha" rotulo="Nova senha" tipo="password" autoComplete="new-password" placeholder="Entre 8 e 72 caracteres" valor={novaSenha} aoMudar={setNovaSenha} />
      <Campo id="confirmar-senha" rotulo="Confirmar nova senha" tipo="password" autoComplete="new-password" placeholder="Repita a senha" valor={confirmar} aoMudar={setConfirmar} />
      {erro && <AvisoDeErro>{erro}</AvisoDeErro>}
      <BotaoPrincipal type="submit" carregando={salvando} textoCarregando="Salvando…">
        Salvar nova senha
      </BotaoPrincipal>
    </form>
  );
}
