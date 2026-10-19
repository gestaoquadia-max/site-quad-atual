// A página é um componente de cliente, que não pode exportar metadados; eles ficam aqui.
export const metadata = {
  title: "Criar conta",
  description: "Crie sua conta no Quad Concursos para comprar turmas e materiais e se inscrever em eventos e simulados.",
};

export default function CadastroLayout({ children }: { children: React.ReactNode }) {
  return children;
}
