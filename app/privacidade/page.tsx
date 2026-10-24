import Link from "next/link";
import BotaoPreferenciasDeCookies from "@/components/BotaoPreferenciasDeCookies";
import PaginaInstitucional, { Dado, Secao } from "@/components/PaginaInstitucional";
import { institucional } from "@/lib/institucional";
import { VERSAO_DOS_TERMOS_EXIBICAO } from "@/lib/termos";
import { metadadosDaPagina } from "@/lib/seo";

export const metadata = metadadosDaPagina({
  titulo: "Política de privacidade",
  descricao:
    "Como o Quad Concursos coleta, usa, guarda e protege os seus dados pessoais, de acordo com a LGPD.",
  caminho: "/privacidade",
});

// MINUTA: texto base escrito a partir do que o site e a API fazem hoje. Precisa de revisão jurídica antes de publicar.
export default function PrivacidadePage() {
  const i = institucional;
  return (
    <PaginaInstitucional
      eyebrow="LGPD"
      titulo="Política de privacidade"
      descricao="Como coletamos, usamos, guardamos e protegemos os seus dados pessoais."
      versao={VERSAO_DOS_TERMOS_EXIBICAO}
      minuta
    >
      <Secao titulo="1. Quem cuida dos seus dados">
        <p>
          O controlador dos dados pessoais tratados neste site é {i.nomeFantasia} (<Dado valor={i.razaoSocial} campo="razaoSocial" />,
          CNPJ <Dado valor={i.cnpj} campo="cnpj" />), com sede em <Dado valor={i.endereco} campo="endereco" />.
        </p>
        <p>
          A mesma conta é usada no site e no aplicativo <strong>Viver o Quad</strong>, que fazem parte do mesmo serviço e
          compartilham o mesmo cadastro.
        </p>
      </Secao>

      <Secao titulo="2. Quais dados coletamos">
        <ul>
          <li>
            <strong>Cadastro:</strong> nome completo, CPF, e-mail, celular, endereço e senha. A senha é guardada de forma
            protegida e ninguém da equipe tem acesso a ela.
          </li>
          <li>
            <strong>Vida acadêmica:</strong> turmas em que você está matriculado, materiais que abriu, inscrições em eventos e
            simulados, presenças e resultados.
          </li>
          <li>
            <strong>Compras:</strong> o que foi comprado, valores, forma de pagamento e situação do pagamento. Os dados do
            cartão são digitados diretamente no ambiente do nosso parceiro de pagamentos: <strong>não guardamos o número
            do cartão nem o código de segurança</strong>, apenas a bandeira e os quatro últimos dígitos.
          </li>
          <li>
            <strong>Dados técnicos:</strong> informações básicas do acesso, como endereço IP, navegador e data e hora, usadas
            para segurança e para corrigir erros.
          </li>
        </ul>
      </Secao>

      <Secao titulo="3. Para que usamos os seus dados">
        <ul>
          <li>Criar e manter a sua conta e confirmar que o e-mail e o celular são seus.</li>
          <li>Prestar os serviços contratados: turmas, materiais, eventos e simulados.</li>
          <li>Processar pagamentos, liberar o acesso ao que foi comprado e emitir comprovantes e notas fiscais.</li>
          <li>Enviar comunicações sobre a sua conta, suas compras e suas turmas.</li>
          <li>Proteger a sua conta e o site contra fraudes e acessos indevidos.</li>
          <li>Cumprir obrigações legais e fiscais.</li>
          <li>Enviar novidades e ofertas, somente se você autorizar — e você pode cancelar a qualquer momento.</li>
        </ul>
        <p>
          As bases legais usadas são, conforme o caso: execução do contrato com você, cumprimento de obrigação legal,
          legítimo interesse (por exemplo, segurança) e o seu consentimento.
        </p>
      </Secao>

      <Secao titulo="4. Com quem compartilhamos">
        <p>Compartilhamos apenas o necessário, com parceiros que precisam dos dados para prestar o serviço:</p>
        <ul>
          <li>
            <strong>Pagar.me</strong> (Stone), que processa os pagamentos por cartão e PIX.
          </li>
          <li>Provedores de hospedagem e armazenamento em nuvem onde o site, o sistema e os materiais ficam guardados.</li>
          <li>Serviços de envio de e-mail e de SMS ou WhatsApp, usados para códigos de verificação e avisos.</li>
          <li>
            <strong>ViaCEP</strong>, que recebe apenas o CEP digitado no cadastro, para preencher o endereço
            automaticamente.
          </li>
          <li>
            Ferramentas de análise de audiência e de anúncios (como Google e Meta), <strong>somente se você aceitar</strong>{" "}
            esses cookies (item 5).
          </li>
          <li>Autoridades públicas, quando houver obrigação legal ou ordem judicial.</li>
        </ul>
        <p>Não vendemos os seus dados pessoais.</p>
        <p>
          Alguns desses parceiros podem guardar dados em servidores fora do Brasil. Nesses casos, a transferência segue o
          artigo 33 da LGPD: só é feita com parceiros que garantem, por contrato, o mesmo nível de proteção exigido aqui.
        </p>
      </Secao>

      <Secao titulo="5. Cookies e armazenamento no navegador" id="cookies">
        <p>Cookies são pequenos arquivos que o site guarda no seu navegador. Usamos três tipos:</p>
        <ul>
          <li>
            <strong>Essenciais</strong> (sempre ativos, porque sem eles o site não funciona): os cookies que mantêm você
            conectado à área do aluno com segurança (<code>quad_acesso</code>, <code>quad_renovacao</code> e{" "}
            <code>quad_sessao</code>) e o registro dos itens do seu carrinho e da sua escolha sobre cookies, guardados no
            próprio navegador.
          </li>
          <li>
            <strong>Análise de audiência</strong> (só com o seu consentimento): medem visitas e uso das páginas, de forma
            agregada, para melhorarmos o site.
          </li>
          <li>
            <strong>Marketing</strong> (só com o seu consentimento): medem o resultado dos nossos anúncios e mostram anúncios
            do Quad em outras plataformas.
          </li>
        </ul>
        <p>
          No primeiro acesso, você escolhe o que aceita. Você pode recusar os cookies opcionais sem perder nenhuma
          funcionalidade do site, e pode mudar a sua escolha a qualquer momento:{" "}
          <BotaoPreferenciasDeCookies className="font-semibold text-azul-forte underline underline-offset-2" />.
        </p>
      </Secao>

      <Secao titulo="6. Por quanto tempo guardamos">
        <p>
          Guardamos os seus dados enquanto a sua conta estiver ativa e, depois disso, pelo tempo exigido por lei — por
          exemplo, os registros fiscais e de pagamento pelos prazos previstos na legislação, e os registros de acesso ao site
          (data, hora e endereço IP) por 6 meses, como determina o Marco Civil da Internet (Lei 12.965/2014, art. 15).
          Passados esses prazos, os dados são excluídos ou tornados anônimos.
        </p>
      </Secao>

      <Secao titulo="7. Seus direitos">
        <p>Pela Lei Geral de Proteção de Dados (Lei 13.709/2018), você pode pedir, a qualquer momento:</p>
        <ul>
          <li>confirmação de que tratamos os seus dados e acesso a eles;</li>
          <li>correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desacordo com a lei;</li>
          <li>portabilidade dos dados a outro fornecedor;</li>
          <li>eliminação dos dados tratados com base no seu consentimento e revogação desse consentimento;</li>
          <li>informação sobre com quem compartilhamos os seus dados;</li>
          <li>informação sobre a possibilidade de não dar o consentimento e sobre o que acontece se você não der.</li>
        </ul>
        <p>
          Os pedidos são atendidos sem custo. Se não estiver satisfeito com a resposta, você também pode reclamar à
          Autoridade Nacional de Proteção de Dados (ANPD) ou aos órgãos de defesa do consumidor.
        </p>
        <p>
          Parte dos seus dados pode ser vista e alterada diretamente na <Link href="/aluno/perfil">área do aluno</Link>.
          Para os demais pedidos, escreva para o nosso encarregado de dados
          {i.encarregado ? `, ${i.encarregado}` : <Dado valor="" campo="encarregado" />}:{" "}
          {i.emailPrivacidade ? (
            <a href={`mailto:${i.emailPrivacidade}`}>
              {i.emailPrivacidade}
            </a>
          ) : (
            <Dado valor="" campo="emailPrivacidade" />
          )}
          .
        </p>
      </Secao>

      <Secao titulo="8. Segurança">
        <p>
          Usamos conexão protegida (HTTPS), senhas guardadas de forma protegida, controle de acesso para que cada aluno veja
          apenas os próprios dados e parceiros de pagamento certificados. Se ocorrer um incidente de segurança que possa
          trazer risco a você, avisaremos você e a Autoridade Nacional de Proteção de Dados, como determina a lei.
        </p>
      </Secao>

      <Secao titulo="9. Menores de idade">
        <p>
          O cadastro de menores de 18 anos deve ser feito ou autorizado pelos pais ou responsáveis legais, que respondem
          pelas informações fornecidas.
        </p>
      </Secao>

      <Secao titulo="10. Mudanças nesta política">
        <p>
          Podemos atualizar esta política para refletir mudanças no serviço ou na lei. A data da versão em vigor aparece no
          topo da página; mudanças relevantes serão avisadas no site ou por e-mail, com destaque para o que mudou. Se a
          mudança afetar algo que depende do seu consentimento, você poderá revogá-lo caso não concorde.
        </p>
      </Secao>
    </PaginaInstitucional>
  );
}
