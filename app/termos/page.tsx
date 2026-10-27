import Link from "next/link";
import PaginaInstitucional, { Dado, Secao } from "@/components/PaginaInstitucional";
import { formatarTelefoneFixoOuCelular, institucional, linkDoWhatsApp } from "@/lib/institucional";
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
            Cada CPF, e-mail e celular pode estar em uma única conta. O e-mail deve ser confirmado pelo link enviado e,
            quando solicitado, o celular pelo código enviado por mensagem.
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
            <strong>Materiais:</strong> apostilas e kits impressos, retirados na sede do Quad, e os materiais publicados nas
            turmas, acessados pela área do aluno.
          </li>
          <li>
            <strong>Produtos da loja:</strong> camisas, canecas e outros itens do Quad, retirados na sede.
          </li>
          <li>
            <strong>Eventos e simulados:</strong> gratuitos ou pagos, presenciais ou online, sujeitos ao número de vagas.
          </li>
        </ul>
        {/* Limitação de direito do consumidor: em destaque (CDC, art. 54, § 4º). */}
        <p>
          <strong>
            O Quad se dedica a oferecer a melhor preparação, mas a aprovação em concurso depende de fatores que não estão
            sob o nosso controle, como o desempenho do candidato e as regras de cada edital. Por isso, não garantimos
            aprovação.
          </strong>
        </p>
      </Secao>

      <Secao titulo="4. Compras e pagamentos">
        <ul>
          <li>
            O preço, as vagas e as condições de cada turma, material, produto ou evento são informados na página dele, e o
            valor total do pedido aparece antes do pagamento.
          </li>
          <li>Os pagamentos são processados pelo Pagar.me, por cartão de crédito (em até dois cartões) ou PIX.</li>
          <li>
            No PIX e no cartão à vista, não há acréscimo. No cartão parcelado (de 2 a 12 vezes), há um acréscimo pelo
            parcelamento. O valor de cada parcela e o total a pagar aparecem antes da confirmação.
          </li>
          <li>O acesso ao que foi comprado é liberado depois da confirmação do pagamento pelo Pagar.me.</li>
          <li>O PIX tem prazo de vencimento; depois dele, a compra expira e a vaga pode ser liberada.</li>
          <li>Preços, condições e cupons valem conforme informado no momento da compra.</li>
        </ul>
      </Secao>

      <Secao titulo="5. Cancelamento e reembolso">
        <p>
          Nas compras feitas pela internet, você pode desistir em até 7 dias, contados da compra ou, no caso de produtos
          retirados na sede, do dia da retirada. O valor pago é devolvido integralmente, de imediato e corrigido, pela mesma
          forma de pagamento, conforme o artigo 49 do Código de Defesa do Consumidor. Para desistir, fale com o atendimento
          (veja o item 10).
        </p>
        {/* Política de cancelamento depois dos 7 dias: decisão do Quad (lib/institucional.ts). Vazia, o parágrafo some no site publicado. */}
        {(i.politicaDeCancelamento || process.env.NODE_ENV === "development") && (
          <p>
            Depois desse prazo, o cancelamento segue esta política: <Dado valor={i.politicaDeCancelamento} campo="politicaDeCancelamento" />
          </p>
        )}
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
          serão avisadas no site ou por e-mail e, quando necessário, pediremos um novo aceite. As mudanças não alteram as
          condições das compras já feitas, que seguem os termos em vigor na data da compra.
        </p>
      </Secao>

      <Secao titulo="10. Atendimento">
        <p>
          Dúvidas, pedidos de cancelamento e reclamações podem ser enviados ao atendimento:
          {i.whatsapp && <> WhatsApp <a href={linkDoWhatsApp(i.whatsapp)}>{formatarTelefoneFixoOuCelular(i.whatsapp)}</a>,</>}
          {i.emailAtendimento && <> e-mail <a href={`mailto:${i.emailAtendimento}`}>{i.emailAtendimento}</a></>}
          {i.horarioAtendimento && <> ({i.horarioAtendimento})</>}. Respondemos pelo mesmo canal.
        </p>
      </Secao>

      <Secao titulo="11. Foro">
        <p>
          Fica eleito o foro da comarca de <Dado valor={i.foro} campo="foro" /> para resolver questões relacionadas a estes termos,
          sem prejuízo do direito do consumidor de recorrer ao foro do seu domicílio.
        </p>
      </Secao>
    </PaginaInstitucional>
  );
}
