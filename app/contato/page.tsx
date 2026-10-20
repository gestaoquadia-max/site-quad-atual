import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Dado } from "@/components/PaginaInstitucional";
import { formatarTelefoneFixoOuCelular, institucional, linkDoWhatsApp } from "@/lib/institucional";
import { metadadosDaPagina } from "@/lib/seo";

export const metadata = metadadosDaPagina({
  titulo: "Contato",
  descricao:
    "Fale com o Quad Concursos: WhatsApp, e-mail, telefone e endereço em Feira de Santana, Bahia.",
  caminho: "/contato",
});

const emDesenvolvimento = process.env.NODE_ENV === "development";

function Canal({ titulo, valor, campo, href, destaque = false }: { titulo: string; valor: string; campo: string; href?: string; destaque?: boolean }) {
  // No site publicado, canal sem dado não aparece.
  if (!valor && !emDesenvolvimento) return null;
  const externo = href?.startsWith("http");
  return (
    <div className={`flex flex-col gap-2 rounded-[18px] border p-6 ${destaque ? "border-transparent bg-marinho-900 text-white" : "border-linha bg-white"}`}>
      <div className={`text-xs font-bold uppercase tracking-[0.12em] ${destaque ? "text-azul-ceu" : "text-azul-forte"}`}>{titulo}</div>
      {valor && href ? (
        <a
          href={href}
          target={externo ? "_blank" : undefined}
          rel={externo ? "noopener noreferrer" : undefined}
          className={`font-display text-xl font-extrabold underline-offset-4 hover:underline ${destaque ? "text-white hover:text-white" : "text-tinta hover:text-azul"}`}
        >
          {valor}
          {externo && <span className="sr-only"> (abre em nova aba)</span>}
        </a>
      ) : (
        <div className="font-display text-xl font-extrabold">
          <Dado valor={valor} campo={campo} />
        </div>
      )}
    </div>
  );
}

export default function ContatoPage() {
  const i = institucional;
  const algumCanal = [i.whatsapp, i.telefone, i.emailAtendimento, i.endereco, i.instagram].some(Boolean);

  return (
    <>
      <PageHeader
        eyebrow="Atendimento"
        title="Contato"
        desc="Tire suas dúvidas sobre turmas, materiais, eventos e matrículas. Respondemos o mais rápido possível."
      />
      <section className="bg-nevoa py-[clamp(48px,6vw,88px)]">
        <div className="conteiner">
          {!algumCanal && !emDesenvolvimento ? (
            <p className="text-ardosia">Nossos canais de atendimento serão publicados em breve.</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-5">
              <Canal
                titulo="WhatsApp"
                valor={i.whatsapp ? formatarTelefoneFixoOuCelular(i.whatsapp) : ""}
                campo="whatsapp"
                href={i.whatsapp ? linkDoWhatsApp(i.whatsapp) : undefined}
                destaque
              />
              <Canal
                titulo="Telefone"
                valor={i.telefone ? formatarTelefoneFixoOuCelular(i.telefone) : ""}
                campo="telefone"
                href={i.telefone ? `tel:+55${i.telefone.replace(/\D/g, "")}` : undefined}
              />
              <Canal
                titulo="E-mail"
                valor={i.emailAtendimento}
                campo="emailAtendimento"
                href={i.emailAtendimento ? `mailto:${i.emailAtendimento}` : undefined}
              />
              <Canal
                titulo="Instagram"
                valor={i.instagram ? `@${i.instagram}` : ""}
                campo="instagram"
                href={i.instagram ? `https://instagram.com/${i.instagram}` : undefined}
              />
              <Canal titulo="Endereço" valor={i.endereco} campo="endereco" />
              <Canal titulo="Horário de atendimento" valor={i.horarioAtendimento} campo="horarioAtendimento" />
            </div>
          )}
          <p className="mt-8 text-[15px] text-ardosia">
            Para pedidos sobre os seus dados pessoais (acesso, correção ou exclusão), veja a{" "}
            <Link href="/privacidade" className="font-semibold text-azul-forte underline underline-offset-4 hover:text-azul">
              Política de privacidade
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
