import Image from "next/image";
import Link from "next/link";
import type { Turma } from "@/lib/data";

// Isoladas presenciais em /turmas (entrega da designer, 11/11/2026): as turmas do tipo ISOLADA da API (curtas, de uma
// matéria ou tema), fora da escolha de modalidade. A seção só existe com alguma isolada cadastrada. O cartão traz a
// imagem, as vagas, o nome, o preço e "Matricular"; início, dias e horário ficam na página da turma.
function vagasRestantes(t: Turma) {
  const total = t.detalhe?.vagasTotal;
  if (total === undefined) return null;
  return total - (t.detalhe?.vagasOcupadas ?? 0);
}

function CartaoDaIsolada({ turma }: { turma: Turma }) {
  const restantes = vagasRestantes(turma);
  const imagem = turma.imagem ?? turma.insignia;
  return (
    <Link
      href={`/turmas/${turma.slug}`}
      className="group flex h-full flex-col rounded-[18px] border border-linha bg-superficie p-2 text-tinta shadow-cartao transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-azul/45 hover:text-tinta hover:shadow-cartao-alto"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-[radial-gradient(70%_60%_at_50%_40%,#16325C,#0B1A33)]">
        {imagem ? (
          <Image src={imagem} alt="" fill sizes="(min-width: 1024px) 300px, 90vw" className="object-contain p-[18%]" />
        ) : (
          <Image src="/images/quad-logo-branco.png" alt="" width={236} height={88} className="absolute left-1/2 top-1/2 w-[42%] -translate-x-1/2 -translate-y-1/2 opacity-20" />
        )}
      </div>
      <div className="flex flex-1 flex-col items-start gap-2.5 px-3.5 pb-3 pt-[18px]">
        {restantes !== null && (
          <span className="rounded-full bg-sucesso-fundo px-2.5 py-1 text-xs font-bold uppercase tracking-[0.04em] text-sucesso">
            {restantes === 1 ? "1 vaga restante" : `${restantes} vagas restantes`}
          </span>
        )}
        <h3 className="font-display text-[25px] font-extrabold leading-[1.1] tracking-[-0.02em] [text-wrap:balance]">{turma.nome}</h3>
        <p className="text-sm text-ardosia">
          {turma.precoCheio ? (
            <>
              De <s>{turma.precoCheio}</s> por <b className="font-display text-[19px] font-bold text-azul">{turma.preco}</b>
            </>
          ) : (
            <b className="font-display text-[19px] font-bold text-azul">{turma.preco}</b>
          )}
        </p>
        <span className="mt-auto block w-full pt-2">
          <span className="btn-q btn-q-azul h-12 w-full px-4 text-[15.5px] group-hover:bg-azul-vivo">
            Matricular <span aria-hidden="true">→</span>
          </span>
        </span>
      </div>
    </Link>
  );
}

export default function SecaoDeIsoladas({ turmas }: { turmas: Turma[] }) {
  if (turmas.length === 0) return null;
  return (
    <section id="isoladas" className="scroll-mt-[120px] bg-nevoa pb-[clamp(64px,8vw,100px)] pt-[clamp(48px,6vw,72px)]">
      <div className="conteiner flex flex-col gap-7">
        <div className="flex flex-col gap-2">
          <h2 className="titulo-secao">Isoladas presenciais</h2>
          <p className="text-[16.5px] leading-[1.55] text-ardosia [text-wrap:pretty]">
            Turmas curtas e focadas em uma matéria ou tema, com poucas aulas e vagas limitadas.
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-6">
          {turmas.map((t) => (
            <CartaoDaIsolada key={t.slug} turma={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
