import MolduraDeAcesso from "@/components/acesso/MolduraDeAcesso";
import ConfirmarEmailConteudo, { type ResultadoDaConfirmacao } from "./ConfirmarEmailConteudo";
import { NAO_INDEXAR } from "@/lib/seo";

export const metadata = {
  title: "Confirmar e-mail",
  description: "Confirme o seu e-mail para receber os avisos das suas compras e turmas no Quad Concursos.",
  robots: NAO_INDEXAR,
};

const RESULTADOS: ResultadoDaConfirmacao[] = ["CONFIRMADO", "JA_CONFIRMADO", "INVALIDO"];

// A API confirma o e-mail no clique do link e manda o aluno para cá: /confirmar-email?resultado=CONFIRMADO.
export default async function ConfirmarEmailPage({ searchParams }: { searchParams: Promise<{ resultado?: string | string[] }> }) {
  const { resultado } = await searchParams;
  const valido = RESULTADOS.find((r) => r === resultado) ?? null;
  return (
    <MolduraDeAcesso>
      <ConfirmarEmailConteudo resultado={valido} />
    </MolduraDeAcesso>
  );
}
