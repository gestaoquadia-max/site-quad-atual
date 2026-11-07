import Link from "next/link";
import TelaDeResultado from "@/components/acesso/TelaDeResultado";

// O resultado da confirmação do e-mail, já feita pela API (07/11/2026). O link do e-mail abre a rota da API, que
// confirma na hora e manda o aluno para cá com ?resultado= (docs/pedidos-backend.md, item 4.7). A página só mostra
// a tela de cada resultado: não confirma nada nem chama a API.
export type ResultadoDaConfirmacao = "CONFIRMADO" | "JA_CONFIRMADO" | "INVALIDO";

export default function ConfirmarEmailConteudo({ resultado }: { resultado: ResultadoDaConfirmacao | null }) {
  const irAoPerfil = (
    <Link href="/aluno/perfil" className="btn-q btn-q-azul h-[54px] w-full text-base">
      Ir para o meu perfil
    </Link>
  );

  if (resultado === "CONFIRMADO") {
    return (
      <TelaDeResultado tom="sucesso" titulo="E-mail confirmado" acoes={irAoPerfil}>
        Obrigado! Você vai receber por e-mail os avisos das suas compras e turmas.
      </TelaDeResultado>
    );
  }

  if (resultado === "JA_CONFIRMADO") {
    return (
      <TelaDeResultado tom="sucesso" titulo="Seu e-mail já estava confirmado" acoes={irAoPerfil}>
        Está tudo certo: este e-mail já tinha sido confirmado antes. Não precisa fazer mais nada.
      </TelaDeResultado>
    );
  }

  // INVALIDO, ou a página aberta sem resultado (endereço digitado à mão ou link cortado).
  return (
    <TelaDeResultado tom="erro" titulo="Link inválido ou vencido" acoes={irAoPerfil}>
      Este link não é válido, já foi usado ou venceu (ele vale 24 horas). Você pode pedir um novo na página do seu perfil.
    </TelaDeResultado>
  );
}
