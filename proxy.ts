import { NextResponse, type NextRequest } from "next/server";

// Área do aluno protegida também no servidor: sem o cookie quad_sessao (gravado pela API no login, sem segredo,
// docs/pedidos-backend.md 2.10), manda para o login antes de carregar a página, guardando para onde voltar.
// Quem garante o acesso aos dados é a API (cookie quad_acesso, HttpOnly); este é só o primeiro filtro.
// O nome do cookie repete COOKIE_DE_SESSAO de lib/auth.ts: o proxy não deve importar módulos do app.
const COOKIE_DE_SESSAO = "quad_sessao";

export function proxy(request: NextRequest) {
  if (request.cookies.get(COOKIE_DE_SESSAO)?.value) return NextResponse.next();
  const login = new URL("/entrar", request.url);
  login.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/aluno", "/aluno/:path*"],
};
