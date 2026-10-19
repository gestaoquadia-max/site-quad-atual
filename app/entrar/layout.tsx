// A página é um componente de cliente, que não pode exportar metadados; eles ficam aqui.
export const metadata = {
  title: "Entrar",
  description: "Acesse a área do aluno do Quad Concursos para ver suas turmas, materiais, eventos e compras.",
};

export default function EntrarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
