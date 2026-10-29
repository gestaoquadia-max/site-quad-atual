"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatarTelefone } from "@/lib/format";
import { destinoAposLogin, lerDestinoAposLogin, rotaComDestino } from "@/lib/redirecionamento";
import { useCarregandoUsuario, useRecarregarUsuario, useSessaoAtiva, useUsuarioAtual } from "@/lib/usuario";
import { BotaoPrincipal, TituloDoFormulario } from "@/components/acesso/Campos";
import TelaDeResultado from "@/components/acesso/TelaDeResultado";
import VerificarCelular from "@/components/acesso/VerificarCelular";

export default function ConfirmarCelularConteudo() {
  const router = useRouter();
  const sessaoAtiva = useSessaoAtiva();
  const usuario = useUsuarioAtual();
  const carregando = useCarregandoUsuario();
  const recarregar = useRecarregarUsuario();
  const [confirmado, setConfirmado] = useState(false);

  // Sem login não há o que confirmar: entra e volta para cá.
  useEffect(() => {
    if (sessaoAtiva === false) {
      router.replace(rotaComDestino("/entrar", rotaComDestino("/confirmar-celular", lerDestinoAposLogin())));
    }
  }, [sessaoAtiva, router]);

  const continuar = (
    <BotaoPrincipal type="button" onClick={() => router.push(destinoAposLogin())}>
      Continuar
    </BotaoPrincipal>
  );

  if (confirmado) {
    return (
      <TelaDeResultado tom="sucesso" titulo="Celular confirmado" acoes={continuar}>
        Pronto! Sua conta está liberada. Você já pode acessar suas turmas, materiais e compras.
      </TelaDeResultado>
    );
  }

  if (!sessaoAtiva || carregando) {
    return (
      <p role="status" className="text-sm text-ardosia">
        Carregando...
      </p>
    );
  }

  if (usuario?.telefoneVerificado) {
    return (
      <TelaDeResultado tom="sucesso" titulo="Celular já confirmado" acoes={continuar}>
        O número <strong className="text-tinta">{formatarTelefone(usuario.telefone ?? "")}</strong> já está confirmado na sua conta.
      </TelaDeResultado>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <TituloDoFormulario titulo="Confirme seu celular" />
      <VerificarCelular
        telefoneInicial={formatarTelefone(usuario?.telefone ?? "")}
        textoInicial="Para continuar usando a sua conta, confirme o número do seu celular. Vamos enviar um código por SMS."
        onConfirmado={() => {
          setConfirmado(true);
          recarregar();
        }}
        onPular={() => router.push(destinoAposLogin())}
      />
    </div>
  );
}
