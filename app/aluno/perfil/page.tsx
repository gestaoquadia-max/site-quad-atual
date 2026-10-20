import PerfilConteudo from "./PerfilConteudo";
import CabecalhoDoAluno from "@/components/aluno/CabecalhoDoAluno";

export const metadata = { title: "Perfil — Área do Aluno", description: "Seus dados de cadastro, seu endereço e a sua senha de acesso ao Quad Concursos." };

export default function PerfilPage() {
  return (
    <>
      <CabecalhoDoAluno titulo="Perfil" subtitulo="Seus dados de cadastro e a sua senha de acesso." />
      <PerfilConteudo />
    </>
  );
}
