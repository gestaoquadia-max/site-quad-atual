import PaginaInstitucional, { Secao } from "@/components/PaginaInstitucional";
import { institucional, linkDoWhatsApp } from "@/lib/institucional";
import { metadadosDaPagina } from "@/lib/seo";

export const metadata = metadadosDaPagina({
  titulo: "Acessibilidade",
  descricao: "Como o site do Quad Concursos cuida da acessibilidade e como pedir ajuda se algo não funcionar para você.",
  caminho: "/acessibilidade",
});

// Para onde leva o símbolo de acessibilidade do rodapé (Lei 13.146/2015, art. 63). Descreve o que o site faz hoje.
export default function AcessibilidadePage() {
  const i = institucional;
  return (
    <PaginaInstitucional eyebrow="Inclusão" titulo="Acessibilidade" descricao="Queremos que todas as pessoas consigam usar o site do Quad com autonomia.">
      <Secao titulo="Nosso compromisso">
        <p>
          O site do Quad Concursos segue as Diretrizes de Acessibilidade para Conteúdo Web (WCAG 2.1), nível AA, como pede a
          Lei Brasileira de Inclusão da Pessoa com Deficiência (Lei 13.146/2015, art. 63).
        </p>
      </Secao>
      <Secao titulo="O que já fazemos">
        <ul>
          <li>Todo o site pode ser usado só pelo teclado, com o foco sempre visível, e há um atalho para pular direto ao conteúdo.</li>
          <li>Textos e botões têm contraste suficiente para leitura, e o tamanho do texto pode ser ampliado pelo navegador.</li>
          <li>Imagens, ícones e botões têm descrições para leitores de tela, e os formulários indicam os erros em texto.</li>
          <li>As animações são reduzidas para quem pede menos movimento nas configurações do aparelho.</li>
          <li>As páginas principais passam por testes automáticos de acessibilidade a cada mudança no site.</li>
        </ul>
      </Secao>
      <Secao titulo="Encontrou alguma barreira?">
        <p>
          Se alguma parte do site não funcionar bem para você, conte para a gente
          {i.whatsapp ? (
            <>
              {" "}
              pelo{" "}
              <a href={linkDoWhatsApp(i.whatsapp)} target="_blank" rel="noopener">
                WhatsApp do atendimento
              </a>
            </>
          ) : null}
          {i.emailAtendimento ? (
            <>
              {" "}
              ou pelo e-mail <a href={`mailto:${i.emailAtendimento}`}>{i.emailAtendimento}</a>
            </>
          ) : null}
          . Vamos ajudar você a concluir o que precisava e corrigir o problema.
        </p>
      </Secao>
    </PaginaInstitucional>
  );
}
