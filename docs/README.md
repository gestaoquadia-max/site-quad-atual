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
| `npm run test:e2e` | Testes de ponta a ponta com o Playwright (abre o site no Chrome e faz o que o aluno faria). Precisa da **API local ligada** com os dados de teste de `tests/e2e/contas.ts`; sobe o site sozinho se ele não estiver rodando. Relatório em `playwright-report/` |

A cada envio ao GitHub, `.github/workflows/verificacao.yml` confere tipos, padrões de código, build de produção e vulnerabilidades graves das dependências do site.

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
lib/vitrine.ts            Turmas, eventos e simulados lidos da vitrine pública da API (cache de 1 minuto)
lib/data.ts               Dados de exemplo (materiais, professores, aprovados, blog...) e os tipos das páginas
docs/                     Documentação técnica (LaTeX)
```

## Identidade visual

Tokens em `tailwind.config.ts`; fontes carregadas com `next/font` em `app/layout.tsx`:

- Títulos (`font-display`): Rajdhani · Corpo (`font-body`): Work Sans

**Contraste (WCAG AA, mínimo 4,5):** as cores da marca foram feitas para o fundo escuro. Em fundo claro:
- texto secundário cinza: `text-steel` (`#5A6472`); em fundo escuro, `text-steel-dim` (`#8B95A3`) ou `text-steel-light`;
- texto azul: `text-blue-dark`; o `.eyebrow` já vem azul-escuro, e em fundo escuro acrescente `text-blue`.

`npm run test:e2e` inclui `tests/e2e/acessibilidade.spec.ts`, que roda o axe nas páginas principais e falha se aparecer um problema de contraste, rótulo ou teclado.

## Planejamento

O que falta até a produção está em [BACKLOG.md](BACKLOG.md).

O que o site ainda precisa do backend está em [pedidos-backend.md](pedidos-backend.md), a comparação entre o conteúdo das páginas e as rotas da API está em [mapa-api-conteudo.md](mapa-api-conteudo.md), o formato que o site espera de cada conteúdo está em [contrato-api-conteudo.md](contrato-api-conteudo.md), e a medição de desempenho no celular está em [desempenho.md](desempenho.md).

Prompts prontos para agentes de código, por funcionalidade, estão em [prompts/](prompts/). Cupons de desconto: [prompts/cupons/](prompts/cupons/README.md).
