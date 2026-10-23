import Link from "next/link";
import PaginaInstitucional, { Dado, Secao } from "@/components/PaginaInstitucional";
import { institucional } from "@/lib/institucional";
import { VERSAO_DOS_TERMOS_EXIBICAO } from "@/lib/termos";
import { metadadosDaPagina } from "@/lib/seo";

export const metadata = metadadosDaPagina({
  titulo: "Termos de uso",
  descricao:
    "Regras de uso do site, da área do aluno, das compras e dos materiais do Quad Concursos.",
  caminho: "/termos",
});

// MINUTA: texto base escrito a partir de como o serviço funciona hoje. Precisa de revisão jurídica antes de publicar.
export default function TermosPage() {
  const i = institucional;
  return (
    <PaginaInstitucional
      eyebrow="Regras de uso"
      titulo="Termos de uso"
      descricao="As regras para usar o site, a área do aluno, comprar turmas e materiais e participar de eventos."
      versao={VERSAO_DOS_TERMOS_EXIBICAO}
      minuta
    >
      <Secao titulo="1. Sobre estes termos">
        <p>
          Estes termos regem o uso do site e dos serviços de {i.nomeFantasia} (<Dado valor={i.razaoSocial} campo="razaoSocial" />,
          CNPJ <Dado valor={i.cnpj} campo="cnpj" />). Ao criar uma conta ou fazer uma compra, você declara que leu e aceita
          estes termos e a <Link href="/privacidade">Política de privacidade</Link>.
        </p>
      </Secao>

      <Secao titulo="2. Sua conta">
        <ul>
          <li>Os dados informados no cadastro precisam ser verdadeiros e mantidos atualizados.</li>
          <li>
            Cada CPF, e-mail e celular pode estar em uma única conta. A conta é liberada depois da confirmação do celular,
            e o e-mail deve ser confirmado pelo link enviado.
          </li>
          <li>
            A conta é pessoal e intransferível. Não compartilhe a sua senha: tudo o que for feito com o seu acesso é de sua
            responsabilidade. Se suspeitar de uso indevido, troque a senha e avise o atendimento.
          </li>
          <li>A mesma conta dá acesso ao site e ao aplicativo Viver o Quad.</li>
        </ul>
      </Secao>

      <Secao titulo="3. O que oferecemos">
        <ul>
          <li>
            <strong>Turmas presenciais:</strong> cada turma tem duração, horários e valor próprios, informados na página da
            turma. O valor é referente ao período completo da turma.
          </li>
          <li>
            <strong>Materiais:</strong> materiais em PDF e os materiais publicados nas turmas, acessados pela área do aluno.
          </li>
          <li>
            <strong>Eventos e simulados:</strong> gratuitos ou pagos, presenciais ou online, sujeitos ao número de vagas.
          </li>
        </ul>
        <p>
          O Quad se dedica a oferecer a melhor preparação, mas a aprovação em concurso depende de fatores que não estão sob
          o nosso controle, como o desempenho do candidato e as regras de cada edital. Por isso, não garantimos aprovação.
        </p>
      </Secao>

      <Secao titulo="4. Compras e pagamentos">
        <ul>
          <li>Os pagamentos são processados pelo Pagar.me, por cartão de crédito (em até dois cartões) ou PIX.</li>
          <li>O acesso ao que foi comprado é liberado depois da confirmação do pagamento pelo Pagar.me.</li>
          <li>O PIX tem prazo de vencimento; depois dele, a compra expira e a vaga pode ser liberada.</li>
          <li>Preços, condições e cupons valem conforme informado no momento da compra.</li>
        </ul>
      </Secao>

      <Secao titulo="5. Cancelamento e reembolso">
        <p>
          Nas compras feitas pela internet, você pode desistir em até 7 dias a contar da compra, com devolução integral do
          valor pago, conforme o artigo 49 do Código de Defesa do Consumidor.
        </p>
        <p>
          Depois desse prazo, as condições de cancelamento de cada turma ou evento são as informadas na sua página ou no
          contrato de matrícula. Pedidos de cancelamento são feitos pelo atendimento.
        </p>
      </Secao>

      <Secao titulo="6. Uso dos materiais">
        <ul>
          <li>Os materiais, aulas e conteúdos do Quad são protegidos por direitos autorais.</li>
          <li>O acesso é pessoal e serve apenas para o seu estudo.</li>
          <li>
            É proibido copiar, compartilhar, revender, publicar ou distribuir os materiais, no todo ou em parte, por
            qualquer meio, sem autorização por escrito do Quad.
          </li>
          <li>O descumprimento pode levar ao bloqueio da conta, sem prejuízo das medidas legais cabíveis.</li>
        </ul>
      </Secao>

      <Secao titulo="7. Conduta">
        <p>
          Esperamos respeito nas aulas, nos eventos e nos canais do Quad. Não são tolerados assédio, preconceito,
          tentativas de fraude ou de acesso indevido a dados de outras pessoas. Nesses casos, a conta pode ser suspensa ou
          encerrada.
        </p>
      </Secao>

      <Secao titulo="8. Disponibilidade do serviço">
        <p>
          Trabalhamos para manter o site e a área do aluno sempre no ar, mas podem ocorrer interrupções para manutenção ou
          por motivos fora do nosso controle. Avisaremos com antecedência sempre que possível.
        </p>
      </Secao>

      <Secao titulo="9. Mudanças nestes termos">
        <p>
          Estes termos podem ser atualizados. A data da versão em vigor aparece no topo da página; mudanças relevantes
          serão avisadas no site ou por e-mail e, quando necessário, pediremos um novo aceite.
        </p>
      </Secao>

      <Secao titulo="10. Foro">
        <p>
          Fica eleito o foro de <Dado valor={i.foro} campo="foro" /> para resolver questões relacionadas a estes termos,
          sem prejuízo do direito do consumidor de recorrer ao foro do seu domicílio.
        </p>
      </Secao>
    </PaginaInstitucional>
  );
}
