"use client";

import { useEffect, useState } from "react";
import { confirmarCodigoDoCelular, enviarCodigoDoCelular } from "@/lib/api";
import { formatarTelefone } from "@/lib/format";
import { ErroDaApi } from "@/lib/http";

const ESPERA_PADRAO_REENVIO_MS = 60_000;

const classeInput =
  "w-full border border-dark bg-navy-deep px-3.5 py-3 text-[15px] text-offwhite outline-none transition-colors placeholder:text-[#4A5768] focus:border-blue";
const classeLink = "focus-ring text-[13px] text-steel-light underline underline-offset-4 transition-colors hover:text-blue disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60";

// Passo 3 do cadastro: a conta só é liberada depois de confirmar o celular.
// O código é enviado só quando o aluno pede (evita SMS duplicado e permite corrigir o número antes).
export default function VerificarCelular({ telefoneInicial, onConcluir }: { telefoneInicial: string; onConcluir: () => void }) {
  const [telefone, setTelefone] = useState(telefoneInicial);
  const [editandoNumero, setEditandoNumero] = useState(false);
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
    setErro(e instanceof ErroDaApi ? e.message : "Não foi possível conectar. Verifique sua internet e tente novamente.");
  }

  async function enviarCodigo() {
    if (telefone.replace(/\D/g, "").length < 10) return setErro("Telefone incompleto. Inclua o DDD.");
    setErro("");
    setCarregando(true);
    try {
      const envio = await enviarCodigoDoCelular(telefone);
      const podeReenviar = Date.parse(envio.podeReenviarEm);
      setReenviarEm(Number.isNaN(podeReenviar) ? Date.now() + ESPERA_PADRAO_REENVIO_MS : podeReenviar);
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
      onConcluir();
    } catch (e) {
      tratarErro(e);
      setCarregando(false);
    }
  }

  if (indisponivel) {
    return (
      <div>
        <span className="eyebrow">Confirme seu celular</span>
        <p className="mb-6 mt-4 border border-blue/35 bg-blue/10 px-3.5 py-3 text-[13px] leading-relaxed text-steel-light" role="status">
          Sua conta foi criada. A confirmação do celular por código ainda não está disponível; por enquanto, você pode
          continuar e confirmar depois.
        </p>
        <button onClick={onConcluir} className="btn btn-blue block w-full">
          Continuar
        </button>
      </div>
    );
  }

  return (
    <div>
      <span className="eyebrow">Confirme seu celular</span>
      <p className="mb-5 mt-4 text-sm leading-relaxed text-steel-light">
        {codigoEnviadoPara ? (
          <>
            Enviamos um código de 6 números por SMS para <strong className="text-offwhite">{codigoEnviadoPara}</strong>.
            Digite-o abaixo para liberar sua conta.
          </>
        ) : (
          <>Sua conta foi criada. Para liberá-la, vamos enviar um código por SMS para o seu celular.</>
        )}
      </p>

      {(!codigoEnviadoPara || editandoNumero) && (
        <div className="mb-4">
          <label
            htmlFor="verificar-telefone"
            className="font-display mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-steel-light"
          >
            Celular
          </label>
          <input
            id="verificar-telefone"
            inputMode="numeric"
            value={telefone}
            onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
            disabled={!editandoNumero || carregando}
            maxLength={15}
            className={`${classeInput} disabled:text-steel-light`}
          />
          {!editandoNumero && (
            <button type="button" onClick={() => setEditandoNumero(true)} className={`${classeLink} mt-2`}>
              Número errado? Corrigir
            </button>
          )}
        </div>
      )}

      {codigoEnviadoPara && !editandoNumero && (
        <div className="mb-4">
          <label
            htmlFor="verificar-codigo"
            className="font-display mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-steel-light"
          >
            Código
          </label>
          <input
            id="verificar-codigo"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={(e) => e.key === "Enter" && confirmar()}
            placeholder="000000"
            maxLength={6}
            disabled={carregando}
            className={`${classeInput} font-display text-center text-xl tracking-[0.5em]`}
          />
        </div>
      )}

      {erro && (
        <div role="alert" className="mb-3.5 border border-[#9B3535]/50 bg-[#9B3535]/15 px-3.5 py-2.5 text-[13px] text-[#E08A8A]">
          {erro}
        </div>
      )}

      {codigoEnviadoPara && !editandoNumero ? (
        <>
          <button onClick={confirmar} disabled={carregando} className="btn btn-blue mt-2 block w-full disabled:opacity-60">
            {carregando ? "Confirmando..." : "Confirmar celular"}
          </button>
          <div className="mt-4 flex justify-between gap-3">
            <button type="button" onClick={enviarCodigo} disabled={carregando || segundosParaReenviar > 0} className={classeLink}>
              {segundosParaReenviar > 0 ? `Reenviar código em ${segundosParaReenviar}s` : "Reenviar código"}
            </button>
            <button type="button" onClick={() => setEditandoNumero(true)} disabled={carregando} className={classeLink}>
              Corrigir número
            </button>
          </div>
        </>
      ) : (
        <button onClick={enviarCodigo} disabled={carregando} className="btn btn-blue mt-2 block w-full disabled:opacity-60">
          {carregando ? "Enviando..." : codigoEnviadoPara ? "Enviar código para este número" : "Enviar código"}
        </button>
      )}
    </div>
  );
}
