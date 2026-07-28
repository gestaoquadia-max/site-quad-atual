import { notFound } from "next/navigation";
import { professores } from "@/lib/data";
import { getIniciais } from "@/lib/format";
import Breadcrumb from "@/components/Breadcrumb";
import CheckList from "@/components/CheckList";

export function generateStaticParams() {
  return professores.map((p) => ({ slug: p.slug }));
}

export default async function ProfessorDetalhe({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const professor = professores.find((p) => p.slug === slug);
  if (!professor) notFound();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-navy to-navy-mid text-offwhite">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 items-end justify-center overflow-hidden sm:flex">
        {professor.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={professor.fotoUrl}
            alt=""
            className="h-full w-[340px] object-cover object-top mr-[80px] sm:w-[600px]"
          />
        ) : (
          <span className="font-display select-none text-[220px] font-bold leading-none text-white/5">
            {getIniciais(professor.nome)}
          </span>
        )}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-navy-deep via-navy-deep/80 to-navy-deep/0 sm:w-1/2" />

      <div className="relative z-10 mx-auto max-w-site px-6 py-header">
        <Breadcrumb
          items={[
            { href: "/", label: "Início" },
            { href: "/#professores", label: "Professores" },
            { label: professor.nome },
          ]}
        />
        <div className="max-w-[560px] pb-6 pt-8 sm:pt-16">
          <span className="eyebrow">{professor.materia}</span>
          <h1 className="font-display my-4 text-h1 font-bold uppercase leading-[1.1]">
            {professor.nome}
          </h1>
          <p className="text-base text-steel-light">{professor.bioCompleta}</p>
        </div>

        <div className="max-w-[560px] pt-6 sm:pt-8">
          <span className="eyebrow">Formação e experiência</span>
          <h2 className="font-display my-4 text-2xl font-bold uppercase">Credenciais</h2>
          <CheckList items={professor.formacao} dark />
        </div>
      </div>
    </div>
  );
}
