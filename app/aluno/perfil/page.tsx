import PerfilConteudo from "./PerfilConteudo";

export const metadata = { title: "Perfil — Área do Aluno", description: "Seus dados de cadastro, seu endereço e a sua senha de acesso ao Quad Concursos." };

export default function PerfilPage() {
  return (
    <>
      <h1 className="font-display text-[28px] font-bold uppercase">Perfil</h1>
      <p className="mb-8 text-sm text-steel">Seus dados de cadastro e a sua senha de acesso.</p>
      <PerfilConteudo />
    </>
  );
}
