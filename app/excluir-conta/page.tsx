import Link from "next/link";
import PaginaInstitucional, { Secao } from "@/components/PaginaInstitucional";
import { institucional } from "@/lib/institucional";
import { metadadosDaPagina } from "@/lib/seo";

export const metadata = metadadosDaPagina({
  titulo: "Exclusão de conta",
  descricao:
    "Como pedir a exclusão da sua conta do Quad Concursos (site e aplicativo Viver o Quad), o que é apagado, o que é guardado e por quanto tempo.",
  caminho: "/excluir-conta",
});

// Página pedida pelo Google (13/11/2026): o endereço público que explica como excluir a conta, sem precisar instalar o
// aplicativo. O texto segue o que o site e a API fazem hoje (área do aluno → Perfil → "Excluir minha conta",
// app/aluno/perfil/PerfilConteudo.tsx, e lib/api.ts): pedido com a senha, 30 dias de espera com a conta funcionando,
// cancelamento até lá, e-mail com a data e, no fim, a conta anonimizada. Os prazos de guarda são os da Política de
// privacidade (seção 6). Mudou o fluxo? Mudar aqui também.
export default function ExcluirContaPage() {
  const email = institucional.emailPrivacidade;
  const linkDoEmail = `mailto:${email}?subject=${encodeURIComponent("Exclusão da minha conta")}`;
  return (
    <PaginaInstitucional
      eyebrow="LGPD"
      titulo="Exclusão de conta"
      descricao="Como pedir a exclusão da sua conta, o que é apagado e o que precisamos guardar."
      versao="13/11/2026"
    >
      <Secao titulo="1. A que conta esta página se aplica">
        <p>
          A conta do {institucional.nomeFantasia} é a mesma no site <strong>quadconcursos.com.br</strong> e no aplicativo{" "}
          <strong>Viver o Quad</strong>. Ao excluir a conta, ela deixa de existir nos dois: não é preciso pedir a exclusão
          em cada um.
        </p>
      </Secao>

      <Secao titulo="2. Como pedir a exclusão">
        <p>
          <strong>Pelo site (o caminho mais rápido):</strong>
        </p>
        <ul>
          <li>
            Entre na <Link href="/aluno/perfil">área do aluno</Link> com o seu e-mail e senha.
          </li>
          <li>
            Em <strong>Perfil</strong>, no quadro <strong>Cópia e exclusão dos dados</strong>, clique em{" "}
            <strong>Pedir a exclusão da conta</strong>.
          </li>
          <li>Confira o que você vai perder com a exclusão (a lista aparece nessa hora) e confirme digitando a sua senha.</li>
          <li>Você recebe por e-mail a data em que a conta será excluída.</li>
        </ul>
        <p>
          <strong>Por e-mail:</strong> se não conseguir entrar na conta ou confirmar com a senha, escreva para{" "}
          <a href={linkDoEmail}>{email}</a> <strong>a partir do e-mail cadastrado na conta</strong>, com o assunto
          &quot;Exclusão da minha conta&quot;. Podemos pedir uma confirmação de que a conta é sua antes de excluí-la.
        </p>
      </Secao>

      <Secao titulo="3. Prazo e como desistir">
        <p>
          A exclusão acontece <strong>30 dias depois do pedido</strong>. Até lá, a conta continua funcionando normalmente,
          e você pode desistir a qualquer momento: no mesmo lugar do Perfil, clique em{" "}
          <strong>Cancelar a exclusão</strong>. Depois da data, a conta não pode ser recuperada.
        </p>
      </Secao>

      <Secao titulo="4. O que você perde com a exclusão">
        <ul>
          <li>o acesso à área do aluno no site e ao aplicativo Viver o Quad;</li>
          <li>as matrículas em turmas ainda em andamento;</li>
          <li>as inscrições em eventos e simulados que ainda vão acontecer;</li>
          <li>os materiais e produtos comprados no balcão e ainda não retirados no Quad, sem reembolso automático;</li>
          <li>o saldo de Quad Coins.</li>
        </ul>
        <p>
          Se algo da lista ainda estiver em uso, considere esperar o fim da turma, do evento ou a retirada do produto antes
          de pedir a exclusão.
        </p>
      </Secao>

      <Secao titulo="5. O que é apagado e o que é guardado">
        <p>
          <strong>Apagados:</strong> os seus dados pessoais da conta (como nome, CPF, e-mail, celular, endereço e senha)
          são excluídos ou tornados anônimos, de forma que não seja mais possível identificar você.
        </p>
        <p>
          <strong>Guardados pelo prazo da lei:</strong> alguns registros precisamos manter mesmo depois da exclusão, só
          para cumprir obrigações legais, e depois eles também são excluídos ou tornados anônimos:
        </p>
        <ul>
          <li>os registros fiscais e de pagamento das suas compras, pelos prazos previstos na legislação;</li>
          <li>
            os registros de acesso ao site (data, hora e endereço IP), por 6 meses, como determina o Marco Civil da Internet
            (Lei 12.965/2014, art. 15).
          </li>
        </ul>
        <p>
          Os dados do cartão de crédito não ficam com o Quad: são digitados diretamente no ambiente do nosso parceiro de
          pagamentos.
        </p>
      </Secao>

      <Secao titulo="6. Outros pedidos sobre os seus dados">
        <p>
          Se você quer apenas apagar parte dos dados, corrigir algum deles ou receber uma cópia, sem excluir a conta,
          escreva para o nosso encarregado de dados, {institucional.encarregado}, em <a href={linkDoEmail}>{email}</a>. Os
          pedidos são atendidos sem custo. Saiba mais na nossa <Link href="/privacidade">Política de privacidade</Link>.
        </p>
      </Secao>
    </PaginaInstitucional>
  );
}
