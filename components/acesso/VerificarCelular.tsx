"use client";

import { useEffect, useState } from "react";
import { confirmarCodigoDoCelular, enviarCodigoPara } from "@/lib/api";
import { formatarTelefone } from "@/lib/format";
import { ErroDaApi } from "@/lib/http";
import { AvisoDeErro, AvisoInformativo, BotaoPrincipal, Campo } from "@/components/acesso/Campos";

const ESPERA_PADRAO_REENVIO_MS = 60_000;

// Os 6 números do código, grandes e espaçados. Também usado na troca de telefone em "Meu perfil".
export function CampoDoCodigo({ id, valor, aoMudar, disabled }: { id: string; valor: string; aoMudar: (v: string) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-col gap-[7px]">
      <label htmlFor={id} className="text-[13.5px] font-semibold text-tinta">
        Código
      </label>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="one-time-code"
        value={valor}
        onChange={(e) => aoMudar(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="000000"
        maxLength={6}
        disabled={disabled}
        className="h-[60px] w-full rounded-[10px] border border-linha-forte bg-superficie text-center font-display text-2xl font-bold tracking-[0.5em] text-tinta outline-none transition-[border-color,box-shadow] placeholder:text-[#C3CCD8] focus:border-azul focus:shadow-[0_0_0_4px_rgba(0,107,255,0.15)]"
      />
    </div>
  );
}

const classeLink =
  "text-sm font-semibold text-azul-forte underline-offset-4 transition-colors hover:text-azul hover:underline disabled:cursor-not-allowed disabled:text-ardosia disabled:no-underline";

// Passo 3 do cadastro e página /confirmar-celular: a conta só é liberada depois de confirmar o celular.
// O código é enviado só quando o aluno pede (evita SMS duplicado e permite corrigir o número antes).
// onConfirmado: código certo. onPular: a API ainda não tem a verificação, e o aluno segue sem ela.
export default function VerificarCelular({
  telefoneInicial,
  textoInicial,
  onConfirmado,
  onPular,
}: {
  telefoneInicial: string;
  textoInicial: string;
  onConfirmado: () => void;
  onPular: () => void;
}) {
  const [telefone, setTelefone] = useState(telefoneInicial);
  // O número que a conta tem na API agora (muda quando o aluno corrige o número antes do envio).
  const [telefoneDaConta, setTelefoneDaConta] = useState(telefoneInicial);
  // Sem número conhecido (ex.: a API não deixou ler o cadastro), o campo já abre para digitar.
  const [editandoNumero, setEditandoNumero] = useState(!telefoneInicial);
  const [codigoEnviadoPara, setCodigoEnviadoPara] = useState<string | null>(null);
  const [codigo, setCodigo] = useState("");
  const [reenviarEm, setReenviarEm] = useState(0);
  const [agora, setAgora] = useState(() => Date.now());
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [indisponivel, setIndisponivel] = useState(false);

  // Contagem regressiva do "Reenviar código".
  useEffect(() => {
    if (!reenviarEm) return;
    const id = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(id);
  }, [reenviarEm]);

  const segundosParaReenviar = Math.max(0, Math.ceil((reenviarEm - agora) / 1000));

  function tratarErro(e: unknown) {
    if (e instanceof ErroDaApi && e.codigo === "INDISPONIVEL") return setIndisponivel(true);
    // O número já estava verificado (outra aba, outro aparelho): não há o que confirmar.
    if (e instanceof ErroDaApi && e.codigo === "TELEFONE_JA_VERIFICADO") return onConfirmado();
    setErro(e instanceof ErroDaApi ? e.message : "Não foi possível conectar. Verifique sua internet e tente novamente.");
  }

  async function enviarCodigo() {
    if (telefone.replace(/\D/g, "").length < 10) return setErro("Telefone incompleto. Inclua o DDD.");
    setErro("");
    setCarregando(true);
    try {
      // O código vai ao número da conta: se o aluno corrigiu o número, ele é trocado antes do envio.
      const envio = await enviarCodigoPara(telefone, telefoneDaConta);
      setTelefoneDaConta(telefone);
      setReenviarEm(Date.now() + (envio.reenvioEmSegundos > 0 ? envio.reenvioEmSegundos * 1000 : ESPERA_PADRAO_REENVIO_MS));
      setAgora(Date.now());
      setCodigoEnviadoPara(telefone);
      setEditandoNumero(false);
      setCodigo("");
    } catch (e) {
      tratarErro(e);
    } finally {
      setCarregando(false);
    }
  }

  async function confirmar() {
    if (codigo.length !== 6) return setErro("Digite os 6 números do código.");
    setErro("");
    setCarregando(true);
    try {
      await confirmarCodigoDoCelular(codigo);
      onConfirmado();
    } catch (e) {
      tratarErro(e);
      setCarregando(false);
    }
  }

  if (indisponivel) {
    return (
      <div className="flex flex-col gap-4">
        <AvisoInformativo>
          A confirmação do celular por código ainda não está disponível. Por enquanto, você pode continuar e confirmar depois.
        </AvisoInformativo>
        <BotaoPrincipal type="button" onClick={onPular}>
          Continuar
        </BotaoPrincipal>
      </div>
    );
  }

  const digitandoCodigo = codigoEnviadoPara && !editandoNumero;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (digitandoCodigo) confirmar();
        else enviarCodigo();
      }}
      className="flex flex-col gap-4"
    >
      <p className="text-[15px] leading-[1.6] text-ardosia-escura">
        {codigoEnviadoPara ? (
          <>
            Enviamos um código de 6 números por SMS para <strong className="text-tinta">{codigoEnviadoPara}</strong>. Digite-o abaixo
            para liberar sua conta.
          </>
        ) : (
          textoInicial
        )}
      </p>

      {(!codigoEnviadoPara || editandoNumero) && (
        <div>
          <Campo
            id="verificar-telefone"
            rotulo="Celular"
            tipo="tel"
            valor={telefone}
            aoMudar={setTelefone}
            mascara={formatarTelefone}
            disabled={!editandoNumero || carregando}
            maxLength={15}
          />
          {!editandoNumero && (
            <button type="button" onClick={() => setEditandoNumero(true)} className={`${classeLink} mt-2`}>
              Número errado? Corrigir
            </button>
          )}
        </div>
      )}

      {digitandoCodigo && <CampoDoCodigo id="verificar-codigo" valor={codigo} aoMudar={setCodigo} disabled={carregando} />}

      {erro && <AvisoDeErro>{erro}</AvisoDeErro>}

      {digitandoCodigo ? (
        <>
          <BotaoPrincipal type="submit" carregando={carregando} textoCarregando="Confirmando…">
            Confirmar celular
          </BotaoPrincipal>
          <div className="flex justify-between gap-3">
            <button type="button" onClick={enviarCodigo} disabled={carregando || segundosParaReenviar > 0} className={classeLink}>
              {segundosParaReenviar > 0 ? `Reenviar código em ${segundosParaReenviar}s` : "Reenviar código"}
            </button>
            <button type="button" onClick={() => setEditandoNumero(true)} disabled={carregando} className={classeLink}>
              Corrigir número
            </button>
          </div>
        </>
      ) : (
        <BotaoPrincipal type="submit" carregando={carregando} textoCarregando="Enviando…">
          {codigoEnviadoPara ? "Enviar código para este número" : "Enviar código"}
        </BotaoPrincipal>
      )}
    </form>
  );
}
