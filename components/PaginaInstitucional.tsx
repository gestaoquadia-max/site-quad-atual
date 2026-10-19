import type { ReactNode } from "react";
import PageHeader from "./PageHeader";

const emDesenvolvimento = process.env.NODE_ENV === "development";

// Mostra um dado da empresa; se ainda não foi preenchido em lib/institucional.ts,
// aparece como pendente só em desenvolvimento (no site publicado, some).
export function Dado({ valor, campo }: { valor: string; campo: string }) {
  if (valor) return <>{valor}</>;
  if (!emDesenvolvimento) return null;
  return (
    <span className="bg-[#FFF6DD] px-1.5 py-0.5 text-[#7A5A00]" title="Preencher em lib/institucional.ts">
      [a preencher: {campo}]
    </span>
  );
}

export function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mb-9">
      <h2 className="font-display mb-3 text-xl font-bold uppercase">{titulo}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-[#4A5462] [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}

export default function PaginaInstitucional({
  eyebrow,
  titulo,
  descricao,
  versao,
  minuta = false,
  children,
}: {
  eyebrow: string;
  titulo: string;
  descricao?: string;
  // Data da versão em vigor, ex.: "06/10/2026"
  versao?: string;
  // Texto ainda sem revisão jurídica: em desenvolvimento, mostra um aviso no topo.
  minuta?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={titulo}
        desc={descricao}
        bgClassName="bg-offwhite"
        textClassName="text-navy"
        descClassName="text-steel"
      />
      <div className="py-section">
        <article className="mx-auto max-w-narrow px-6">
          {minuta && emDesenvolvimento && (
            <div role="note" className="mb-8 border border-[#B8860B]/40 bg-[#FFF6DD] px-4 py-3 text-[13px] text-[#7A5A00]">
              <strong>Minuta — aguardando revisão jurídica.</strong> Este aviso só aparece em desenvolvimento. Não publicar
              antes da revisão e do preenchimento dos dados marcados como pendentes.
            </div>
          )}
          {versao && <p className="mb-8 text-sm text-steel">Versão em vigor desde {versao}.</p>}
          {children}
        </article>
      </div>
    </>
  );
}
