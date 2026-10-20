import { Suspense } from "react";
import { metadadosDaPagina } from "@/lib/seo";
import ComParametrosDoEndereco from "@/components/simulados/ComParametrosDoEndereco";

export const metadata = metadadosDaPagina({
  titulo: "Simulados do Quad",
  descricao: "Simulados presenciais, individuais e combos para Soldado PMBA, Investigador PCBA e outras carreiras, em PDF, plataforma ou impresso.",
  caminho: "/simulados",
});

function Carregando() {
  return (
    <section className="bg-marinho-950 py-[clamp(56px,7vw,96px)] text-white">
      <div className="conteiner">
        <h1 className="mb-[18px] font-display text-[clamp(2.6rem,5.6vw,5rem)] font-extrabold leading-none tracking-[-0.045em]">Simulados do Quad</h1>
        <p className="text-prata" role="status">
          Carregando as edições…
        </p>
      </div>
    </section>
  );
}

export default function SimuladosPage() {
  return (
    <Suspense fallback={<Carregando />}>
      <ComParametrosDoEndereco />
    </Suspense>
  );
}
