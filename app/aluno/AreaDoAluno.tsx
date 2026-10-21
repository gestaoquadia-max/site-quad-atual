"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AlunoSidebar from "@/components/AlunoSidebar";
import { useSessaoAtiva } from "@/lib/usuario";
import { rotaComDestino } from "@/lib/redirecionamento";

export default function AreaDoAluno({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const sessaoAtiva = useSessaoAtiva();

  useEffect(() => {
    if (sessaoAtiva === false) router.replace(rotaComDestino("/entrar", pathname));
  }, [sessaoAtiva, router, pathname]);

  if (!sessaoAtiva) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-nevoa text-sm text-ardosia" role="status">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nevoa text-tinta lg:flex">
      <AlunoSidebar />
      {/* div, não main: o layout raiz já tem o <main> da página */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-[1200px] px-[clamp(20px,4vw,48px)] pb-[clamp(56px,7vw,88px)] pt-[clamp(28px,4vw,48px)]">{children}</div>
      </div>
    </div>
  );
}
