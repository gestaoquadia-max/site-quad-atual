import Link from "next/link";
import AccentCard from "@/components/AccentCard";
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

function Canal({ titulo, valor, campo, href }: { titulo: string; valor: string; campo: string; href?: string }) {
  // No site publicado, canal sem dado não aparece.
  if (!valor && !emDesenvolvimento) return null;
  return (
    <AccentCard className="p-6">
      <div className="font-display mb-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-steel">{titulo}</div>
      {valor && href ? (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="focus-ring text-[17px] font-semibold text-navy underline-offset-4 hover:underline"
        >
          {valor}
        </a>
      ) : (
        <div className="text-[17px] font-semibold text-navy">
          <Dado valor={valor} campo={campo} />
        </div>
      )}
    </AccentCard>
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
        bgClassName="bg-offwhite"
        textClassName="text-navy"
        descClassName="text-steel"
      />
      <section className="py-section">
        <div className="mx-auto max-w-site px-6">
          {!algumCanal && !emDesenvolvimento ? (
            <p className="text-steel">Nossos canais de atendimento serão publicados em breve.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Canal
                titulo="WhatsApp"
                valor={i.whatsapp ? formatarTelefoneFixoOuCelular(i.whatsapp) : ""}
                campo="whatsapp"
                href={i.whatsapp ? linkDoWhatsApp(i.whatsapp) : undefined}
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
          <p className="mt-8 text-sm text-steel">
            Para pedidos sobre os seus dados pessoais (acesso, correção ou exclusão), veja a{" "}
            <Link href="/privacidade" className="text-navy underline underline-offset-4 hover:text-blue-dark">
              Política de privacidade
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
