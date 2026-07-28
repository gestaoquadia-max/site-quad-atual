import { eventos } from "@/lib/data";
import AccentCard from "@/components/AccentCard";
import Kicker from "@/components/Kicker";

export const metadata = { title: "Meus eventos — Área do Aluno" };

const inscricoes = ["Simulado Aberto CFP", "Aulão de Véspera"];

export default function MeusEventosPage() {
  const meusEventos = eventos.filter((e) => inscricoes.includes(e.nome));

  return (
    <>
      <h2 className="font-display text-[28px] font-bold uppercase">Meus eventos</h2>
      <p className="mb-8 text-sm text-steel">Eventos em que você já garantiu sua inscrição.</p>

      <div className="grid gap-5 sm:grid-cols-2">
        {meusEventos.map((e) => (
          <AccentCard key={e.nome} className="p-6">
            <div className="mb-1.5 flex items-center justify-between">
              <Kicker>{e.tag}</Kicker>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#3E7A44]">Inscrito</span>
            </div>
            <h3 className="font-display mb-1.5 text-lg font-bold uppercase leading-tight">{e.nome}</h3>
            <p className="text-sm text-[#5A6472]">{e.desc}</p>
          </AccentCard>
        ))}
      </div>
    </>
  );
}
