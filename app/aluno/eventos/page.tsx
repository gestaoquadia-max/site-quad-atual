import MeusEventosConteudo from "./MeusEventosConteudo";

export const metadata = { title: "Meus eventos — Área do Aluno", description: "Os eventos e simulados em que você está inscrito no Quad Concursos." };

export default function MeusEventosPage() {
  return (
    <>
      <h1 className="font-display text-[28px] font-bold uppercase">Meus eventos</h1>
      <p className="mb-8 text-sm text-steel">Eventos e simulados em que você garantiu sua inscrição.</p>
      <MeusEventosConteudo />
    </>
  );
}
