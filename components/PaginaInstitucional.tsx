import type { ReactNode } from "react";
import PageHeader from "./PageHeader";

const emDesenvolvimento = process.env.NODE_ENV === "development";

// Mostra um dado da empresa; se ainda não foi preenchido em lib/institucional.ts,
// aparece como pendente só em desenvolvimento (no site publicado, some).
export function Dado({ valor, campo }: { valor: string; campo: string }) {
  if (valor) return <>{valor}</>;
  if (!emDesenvolvimento) return null;
  return (
    <span className="rounded bg-[#FFF4D6] px-1.5 py-0.5 text-[#7A5A00]" title="Preencher em lib/institucional.ts">
      [a preencher: {campo}]
    </span>
  );
}

export function Secao({ titulo, id, children }: { titulo: string; id?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-[#EEF2F7] pt-7 first:border-0 first:pt-0">
      <h2 className="mb-3 font-display text-[22px] font-extrabold tracking-[-0.02em]">{titulo}</h2>
      <div className="space-y-3 text-base leading-[1.75] text-ardosia-escura [&_a]:font-semibold [&_a]:text-azul-forte [&_a]:underline [&_a]:underline-offset-2 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}

// Termos de uso e Política de privacidade: texto longo numa coluna de leitura.
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
      <PageHeader eyebrow={eyebrow} title={titulo} desc={descricao} />
      <div className="bg-nevoa py-[clamp(48px,6vw,88px)]">
        <article className="conteiner">
          <div className="mx-auto max-w-[820px] rounded-[20px] border border-linha bg-white p-[clamp(24px,4vw,56px)]">
            {minuta && emDesenvolvimento && (
              <div role="note" className="mb-8 rounded-xl border border-[#F0DDA0] bg-[#FFF8E5] px-4 py-3 text-[13.5px] text-[#7A5A00]">
                <strong>Minuta — aguardando revisão jurídica.</strong> Este aviso só aparece em desenvolvimento. Não publicar antes da revisão e do
                preenchimento dos dados marcados como pendentes.
              </div>
            )}
            {versao && <p className="mb-8 text-sm font-semibold text-ardosia">Versão em vigor desde {versao}.</p>}
            <div className="flex flex-col gap-7">{children}</div>
          </div>
        </article>
      </div>
    </>
  );
}
