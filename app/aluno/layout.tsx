import AlunoSidebar from "@/components/AlunoSidebar";

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[calc(100vh-68px)] md:grid-cols-[240px_1fr]">
      <AlunoSidebar />
      <main className="bg-offwhite p-10">{children}</main>
    </div>
  );
}
