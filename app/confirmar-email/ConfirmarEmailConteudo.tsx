"use client";

import { useState } from "react";
import Link from "next/link";
import { confirmarEmail } from "@/lib/auth";
import { ErroDaApi } from "@/lib/http";
import { AvisoDeErro, BotaoPrincipal, TituloDoFormulario } from "@/components/acesso/Campos";
import TelaDeResultado from "@/components/acesso/TelaDeResultado";

// A confirmação só acontece no clique: o link é de uso único, e confirmar sozinho ao abrir a página
// poderia gastá-lo (ex.: pré-visualização do link pelo app de e-mail).
export default function ConfirmarEmailConteudo({ token }: { token: string | null }) {
  const [estado, setEstado] = useState<"inicial" | "confirmando" | "confirmado" | "invalido" | "erro">(token ? "inicial" : "invalido");
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

  const irAoPerfil = (
    <Link href="/aluno/perfil" className="btn-q btn-q-azul h-[54px] w-full text-base">
      Ir para o meu perfil
    </Link>
  );

  if (estado === "confirmado") {
    return (
      <TelaDeResultado tom="sucesso" titulo="E-mail confirmado" acoes={irAoPerfil}>
        Obrigado! Você vai receber por e-mail os avisos das suas compras e turmas.
      </TelaDeResultado>
    );
  }

  if (estado === "invalido") {
    return (
      <TelaDeResultado tom="erro" titulo="Link inválido ou vencido" acoes={irAoPerfil}>
        Este link não é válido ou já venceu. Você pode pedir um novo na página do seu perfil.
      </TelaDeResultado>
    );
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <TituloDoFormulario titulo="Confirmar e-mail" />
      <p className="text-[15px] text-ardosia-escura">Clique no botão abaixo para confirmar o seu e-mail.</p>
      {estado === "erro" && <AvisoDeErro>{mensagem}</AvisoDeErro>}
      <BotaoPrincipal type="button" onClick={confirmar} carregando={estado === "confirmando"} textoCarregando="Confirmando…">
        Confirmar meu e-mail
      </BotaoPrincipal>
    </div>
  );
}
