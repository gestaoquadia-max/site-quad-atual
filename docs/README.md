# Quad Concursos — Site (Next.js)

Site do Quad Concursos em Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 3.

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha NEXT_PUBLIC_API_URL
npm run dev
```

Acesse http://localhost:3000

Para entrar na área do aluno, crie uma conta em `/cadastro` (a API precisa estar no ar).

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint (config em `eslint.config.mjs`) |
| `npx tsc --noEmit` | Checagem de tipos |

## Estrutura

```
app/
├── page.tsx              Home
├── turmas/               Listagem + detalhe ([slug])
├── produtos/             Materiais PDF: listagem + detalhe ([slug])
├── eventos/              Agenda + detalhe ([slug])
├── cursos/               Cursos online (Tutory)
├── blog/  aprovados/  professores/
├── entrar/  cadastro/    Login e criação de conta (API real)
├── aluno/                Área do aluno (protegida por sessão)
├── carrinho/  checkout/  Compra (checkout ainda simulado)
├── not-found.tsx         Página 404
└── error.tsx             Página de erro

components/               Componentes reutilizáveis
lib/api.ts                Chamadas à API (alunos, usuários)
lib/auth.ts               Login, logout e sessão (localStorage)
lib/usuario.tsx           Contexto do usuário logado
lib/cart.tsx              Carrinho (localStorage)
lib/data.ts               Dados de exemplo (turmas, materiais, eventos, blog...)
docs/                     Documentação técnica (LaTeX)
```

## Identidade visual

Tokens em `tailwind.config.ts`; fontes carregadas com `next/font` em `app/layout.tsx`:

- Títulos (`font-display`): Rajdhani · Corpo (`font-body`): Work Sans

## Planejamento

O que falta até a produção está em [BACKLOG.md](BACKLOG.md).
