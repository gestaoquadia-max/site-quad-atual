"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AlunoSidebar from "@/components/AlunoSidebar";
import { useTokenDeAcesso } from "@/lib/usuario";
import { rotaComDestino } from "@/lib/redirecionamento";

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useTokenDeAcesso();

  useEffect(() => {
    if (token === null) router.replace(rotaComDestino("/entrar", pathname));
  }, [token, router, pathname]);

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-offwhite text-sm text-steel" role="status">
        Carregando...
      </div>
    );
  }

  return (
    <div className="grid min-h-[calc(100vh-68px)] md:grid-cols-[240px_1fr]">
      <AlunoSidebar />
      <main className="bg-offwhite p-10">{children}</main>
    </div>
  );
}
