import PerfilConteudo from "./PerfilConteudo";

export const metadata = { title: "Perfil — Área do Aluno" };

export default function PerfilPage() {
  return (
    <>
      <h2 className="font-display text-[28px] font-bold uppercase">Perfil</h2>
      <p className="mb-8 text-sm text-steel">Seus dados de cadastro e a sua senha de acesso.</p>
      <PerfilConteudo />
    </>
  );
}
