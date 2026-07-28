export const metadata = { title: "Perfil — Área do Aluno" };

export default function PerfilPage() {
  return (
    <>
      <h2 className="font-display text-[28px] font-bold uppercase">Perfil</h2>
      <p className="mb-8 text-sm text-steel">Seus dados de cadastro.</p>

      <div className="max-w-[480px] border border-light bg-white p-7">
        <label className="font-display mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-steel">
          Nome completo
        </label>
        <input
          defaultValue="João Silva"
          className="mb-4 w-full border border-light bg-offwhite px-3.5 py-3 text-[15px] text-navy outline-none focus:border-blue"
        />

        <label className="font-display mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-steel">
          E-mail
        </label>
        <input
          defaultValue="aluno@quad.com"
          className="mb-4 w-full border border-light bg-offwhite px-3.5 py-3 text-[15px] text-navy outline-none focus:border-blue"
        />

        <label className="font-display mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-steel">
          Telefone
        </label>
        <input
          defaultValue="(75) 99999-0000"
          className="mb-6 w-full border border-light bg-offwhite px-3.5 py-3 text-[15px] text-navy outline-none focus:border-blue"
        />

        <button type="button" className="btn btn-blue block w-full">
          Salvar alterações
        </button>
      </div>
    </>
  );
}
