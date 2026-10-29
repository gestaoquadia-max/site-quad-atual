import MolduraDeAcesso from "@/components/acesso/MolduraDeAcesso";
import ConfirmarCelularConteudo from "./ConfirmarCelularConteudo";
import { NAO_INDEXAR } from "@/lib/seo";

export const metadata = {
  title: "Confirmar celular",
  description: "Confirme o número do seu celular para liberar a sua conta no Quad Concursos.",
  robots: NAO_INDEXAR,
};

// Para onde vai a conta com o celular ainda não confirmado (a API responde 403 CELULAR_NAO_VERIFICADO)
// e o link "Confirmar agora" de "Meu perfil". Volta para ?redirect= depois de confirmar.
export default function ConfirmarCelularPage() {
  return (
    <MolduraDeAcesso>
      <ConfirmarCelularConteudo />
    </MolduraDeAcesso>
  );
}
