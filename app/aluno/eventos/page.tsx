import Link from "next/link";
import { eventos } from "@/lib/data";
import AccentCard from "@/components/AccentCard";
import Kicker from "@/components/Kicker";
import EstadoLista from "@/components/EstadoLista";

export const metadata = { title: "Meus eventos — Área do Aluno" };

const inscricoes = ["simulado-aberto-cfp", "aulao-de-vespera"];

export default function MeusEventosPage() {
  const meusEventos = eventos.filter((e) => inscricoes.includes(e.slug));

  return (
    <>
      <h2 className="font-display text-[28px] font-bold uppercase">Meus eventos</h2>
      <p className="mb-8 text-sm text-steel">Eventos em que você já garantiu sua inscrição.</p>

      <EstadoLista
        vazio={meusEventos.length === 0}
        vazioTitulo="Nenhuma inscrição em eventos"
        vazioTexto="Simulados, aulões e encontros em que você se inscrever aparecem aqui."
        vazioAcao={{ href: "/eventos", label: "Ver eventos" }}
        alturaCarregando="h-[150px]"
        linhasCarregando={2}
      >
      <div className="grid gap-5 sm:grid-cols-2">
        {meusEventos.map((e) => (
          <AccentCard key={e.slug} className="p-6">
            <div className="mb-1.5 flex items-center justify-between">
              <Kicker>{e.tag}</Kicker>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#3E7A44]">Inscrito</span>
            </div>
            <h3 className="font-display mb-1.5 text-lg font-bold uppercase leading-tight">{e.nome}</h3>
            <p className="text-sm text-[#5A6472]">{e.desc}</p>
            {e.detalhe && (
              <Link
                href={`/eventos/${e.slug}`}
                className="focus-ring mt-3 inline-block text-[13px] font-semibold text-navy underline underline-offset-4 transition-colors hover:text-blue-dark"
              >
                Ver programação
              </Link>
            )}
          </AccentCard>
        ))}
      </div>
      </EstadoLista>
    </>
  );
}
