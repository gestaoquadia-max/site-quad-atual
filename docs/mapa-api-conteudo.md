# Mapa do conteúdo do site × rotas da API

> Levantado em 10/10/2026 na API de produção (`https://api.quadconcursos.com.br`) e na especificação da API local.
> Backlog: Etapa 5, Bloco 1 — "Mapear as rotas que já existem de turmas, eventos e materiais".

Hoje todo o conteúdo das páginas públicas vem de dados de exemplo em `lib/data.ts`. Este documento compara, campo a campo, o que cada página mostra com o que a API já entrega, para decidir o que dá para ligar já e o que falta pedir ao backend.

**Legenda**
- ✅ **Público:** a API entrega sem login. O site pode usar.
- 🔒 **Exige login:** a API tem o dado, mas só com login. As páginas públicas não podem usar.
- ⚠️ **Parcial:** existe algo próximo, mas não é exatamente o que a página mostra.
- ❌ **Não existe** na API.

---

## Resumo

| Conteúdo do site | Situação | Rota pública que já serve |
|---|---|---|
| Turmas (lista e detalhe) | ⚠️ O básico está público; faltam textos de venda, professores e local | `GET /api/loja/vitrine/atividades?tipo=TURMA` e `GET /api/loja/vitrine/atividades/TURMA/{id}` |
| Eventos (lista e detalhe) | ⚠️ Data, hora, preço e vagas estão públicos; falta quase todo o texto | `GET /api/loja/vitrine/atividades?tipo=EVENTO` e `.../EVENTO/{id}` |
| Simulados | ⚠️ Mesma situação dos eventos (o site hoje os mostra como evento) | `GET /api/loja/vitrine/atividades?tipo=SIMULADO` e `.../SIMULADO/{id}` |
| Materiais em PDF à venda | ❌ Não existem na API. A vitrine de itens tem camisa, caneca e skins do app | — |
| Professores | 🔒 Existem, mas só com login e sem nome, bio nem slug | — |
| Aprovados e histórias em vídeo | ❌ Não existem | — |
| Blog | ❌ Não existe | — |
| Cursos online (Tutory) | ❌ Não existem (são links externos) | — |
| Barra de notícias do topo | ❌ Não existe. Os avisos da API (`/api/avisos/eu`) são para alunos logados | — |

**Conclusão:** só turmas, eventos e simulados podem começar a vir da API agora, e mesmo assim parcialmente. O site ainda precisaria manter os textos de venda (o que está incluso, programação, etc.) em outro lugar. Professores, materiais em PDF e o conteúdo institucional dependem do backend ou da decisão de usar um sistema de conteúdo (Etapa 6, Bloco 1).

---

## Como a vitrine pública responde

> **Atualização de 19/10/2026:** a vitrine mudou o nome dos campos. Os campos `precoEmReais`, `precoDiamante`, `vagasDiamante`, `vendidasDiamante` e `restantesDiamante` deram lugar a `preco`, `vagas`, `vendidas` e `restantes`, que continuam em reais inteiros e no pool de quem paga em reais. O `detalhe` não mudou. O site já lê os nomes novos em `lib/vitrine.ts`. Nesse dia a produção tinha 5 turmas e nenhum evento ou simulado à venda. Um id em formato inválido responde **400**, e não 404.

A lista (`GET /api/loja/vitrine/atividades?tipo=TURMA|EVENTO|SIMULADO`) e o detalhe (`GET /api/loja/vitrine/atividades/{tipo}/{id}`) são abertos e trazem os mesmos campos. Exemplo real, de uma turma de produção:

```json
{
  "tipo": "TURMA", "id": "47854e66-…", "nome": "Bope",
  "imagemUrl": "https://api-quad-dev-imagens.s3.amazonaws.com/imagens/turmas/….jpg",
  "precoEmReais": 1197,
  "precoDiamante": 1377, "vagasDiamante": 120, "vendidasDiamante": 0, "restantesDiamante": 120,
  "precoQuadCoins": null, "vagasQuadCoins": null, "vendidasQuadCoins": null, "restantesQuadCoins": null,
  "detalhe": {
    "modalidade": "QUESTOES", "turnos": ["NOITE"],
    "inicio": "2026-07-13", "fim": "2026-10-16",
    "salaId": "3333…0003", "concursoId": "b2d7…",
    "descricao": "Turma focada resoluções de questões. Abordaremos todas as matérias do edital."
  }
}
```

Pontos importantes:
- **Preço em centavos** desde 23/10/2026 (`119700` = R$ 1.197), o do lote vigente, que vem em `lote`. Até 22/10/2026 era em reais inteiros.
- **Vagas para quem paga em reais** são as de "diamante": segundo a API, `vendidasDiamante` conta diamantes, cartão, PIX e boleto juntos. As vagas de Quad Coins são do app Viver o Quad e o site ignora.
- **O detalhe muda conforme o tipo:**

| Tipo | Campos de `detalhe` |
|---|---|
| TURMA | `modalidade` (NIVELAMENTO, REGULAR, QUESTOES, ISOLADAS), `turnos`, `inicio`, `fim`, `salaId`, `concursoId`, `descricao` |
| EVENTO | `modalidade` (PRESENCIAL, ONLINE), `inicio`, `fim`, `horaInicio`, `horaFim`, `salaId` |
| SIMULADO | `modalidade` (PRESENCIAL, ONLINE), `data`, `inicio`, `fim` (horas), `salaId` |

- **Só aparece na vitrine o que está à venda.** Turma encerrada, ou ainda sem oferta, não aparece.
- **Identificação por `id` (UUID).** A API não tem `slug`. Hoje as URLs do site são legíveis, como `/turmas/cfp-2025-2`.

---

## Turmas

Página: `/turmas`, `/turmas/[slug]` e os cartões da home. Tipo no site: `Turma` em `lib/data.ts`.

| O que a página mostra | Campo no site | Na API | Situação |
|---|---|---|---|
| Endereço da página | `slug` | Só `id` (UUID) | ❌ Pedir `slug` ou usar o id na URL |
| Nome | `nome` | `nome` | ✅ |
| Rótulo do concurso ("CFP · Soldado PM-BA") | `tag` | `detalhe.concursoId` → nome em `GET /api/concursos` | 🔒 O id é público, o nome do concurso só com login |
| Linha de resumo (dias, horário, início, duração, vagas) | `desc` | `detalhe.inicio`, `detalhe.fim`, `detalhe.turnos` | ⚠️ Turno (MANHÃ/TARDE/NOITE) é público; dias e horário exatos só em `GET /api/turmas/{id}` |
| Preço total | `preco` | `precoEmReais` | ✅ Reais inteiros, sem centavos |
| Situação (aberta / em breve / encerrada) | `status` | Não há campo | ⚠️ Estar na vitrine = à venda; `restantesDiamante = 0` = esgotada. "Em breve" e "encerrada" não aparecem |
| Imagem | — (o site ainda não usa) | `imagemUrl` | ✅ |
| Texto de apresentação | `detalhe.lead` | `detalhe.descricao` | ✅ Um texto só |
| Ficha (duração, horário, início, modalidade, local) | `detalhe.specs` | `inicio`, `fim`, `turnos`, `modalidade` | ⚠️ O local é só `salaId`; o nome da sala em `GET /api/salas` exige login e não traz endereço |
| Vagas totais e ocupadas | `detalhe.vagasTotal`, `vagasOcupadas` | `vagasDiamante`, `vendidasDiamante` | ✅ Em tempo real |
| O que está incluso | `detalhe.incluso` | — | ❌ |
| Professores da turma | — | — | Fora do escopo por enquanto (decisão de 21/10/2026): a página da turma não mostra a grade de professores |
| Máximo de parcelas | (fixo em 3x no site) | `GET /api/loja/pagamentos/configuracao` → `parcelasMaximas` | 🔒 Exige login (serve no checkout, não na vitrine) |

## Eventos e simulados

Página: `/eventos` e `/eventos/[slug]`. Tipo no site: `Evento`. O site trata simulado como um evento. Na API eles são tipos separados.

| O que a página mostra | Campo no site | Na API (vitrine) | Situação |
|---|---|---|---|
| Endereço da página | `slug` | Só `id` | ❌ |
| Nome | `nome` | `nome` | ✅ |
| Rótulo ("26 JUL · Presencial · SIC/SIQ") | `tag` | Data e `modalidade` ✅; categoria (AULÃO, PALESTRA…) só em `GET /api/eventos/{id}` | ⚠️ Categoria 🔒 |
| Resumo | `desc` | `resumo` só em `GET /api/eventos/{id}`; simulado tem `descricao` só em `GET /api/simulados/{id}` | 🔒 |
| Preço ou gratuito | `preco` | `precoEmReais` | ✅ Confirmar se `0` quer dizer gratuito |
| Situação (aberta / em breve) | `status` | Não há campo | ⚠️ Como nas turmas |
| Data e horário | `detalhe.specs` | Evento: `inicio`, `fim`, `horaInicio`, `horaFim`. Simulado: `data`, `inicio`, `fim` | ✅ |
| Texto "sobre" | `detalhe.sobre` | — | ❌ |
| Programação | `detalhe.programacao` | — | ❌ |
| O que está incluso | `detalhe.incluso` | — | ❌ |
| Local (nome e endereço) | `detalhe.local` | Só `salaId` | ❌ Sem endereço; o nome da sala exige login |
| Link (evento online) | — | `link` só em `GET /api/eventos/{id}` | 🔒 |
| Vagas | `detalhe.vagasTotal`, `vagasOcupadas` | `vagasDiamante`, `vendidasDiamante` | ✅ |
| Professores | `detalhe.professores` | `professorIds` só em `GET /api/eventos/{id}` | 🔒 E ainda faltaria o nome de cada um |
| Duração e nº de questões (simulado) | — | `duracaoMinutos`, `quantidadeDeQuestoes` só em `GET /api/simulados/{id}` | 🔒 |

## Materiais em PDF à venda

Página: `/produtos` e `/produtos/[slug]`. Tipo no site: `Produto` (nome, páginas, preço, sumário).

- A vitrine de itens (`GET /api/loja/vitrine`, pública) tem os tipos MODULOS, EXCURSOES, TREINAMENTO_TAF, MENTORIA, OUTROS e SKIN. Hoje traz "Camisa Quad" (com variações de tamanho P e M), "Caneca Quad" e skins do app.
- **Não há tipo para apostila ou PDF**, nem campos de páginas, sumário ou capa, nem a ligação entre a compra e o arquivo que o aluno baixa depois.
- Os "materiais" da API (`/api/materiais`) são outra coisa: o material de aula de cada turma, liberado para quem está matriculado. Não são vendidos avulsos.
- **Situação:** ❌ Pedido 3 em aberto ("Onde vão ficar os materiais em PDF?").

## Professores

Página: `/professores/[slug]` e a seção da home. Tipo no site: `Professor`.

| O que a página mostra | Na API | Situação |
|---|---|---|
| Nome | `ProfessorResponse` não tem nome, só `usuarioId`; o nome está em `/api/usuarios/{id}` | 🔒 |
| Matéria | `materiaIds` → nome em `/api/materias` | 🔒 |
| Foto | `fotoUrl` (endereço público) | 🔒 A rota do professor exige login, mas a imagem em si é aberta |
| Formação | `graduacao` (um texto) | 🔒 Parcial |
| Minibio e bio completa | — | ❌ |
| Endereço da página | — | ❌ Sem slug |

## Aprovados, histórias em vídeo, blog, cursos online e barra de notícias

Nenhum desses tem rota na API. A decisão em aberto é se vêm da API (o backend cria) ou de um sistema de conteúdo à parte. Essa escolha é a Etapa 6, Bloco 1 ("Decidir entre painel próprio, painel do backend ou sistema de conteúdo").

---

## O que dá para ligar já e o que falta pedir

**Ligado em 19/10/2026, sem mudar o backend** (`lib/vitrine.ts`, com cache de 1 minuto):
- Turmas, eventos e simulados: nome, preço, datas, turno ou horário, modalidade, descrição da turma e **vagas**. Também vêm da vitrine as listas, os detalhes, a home, o menu do topo, a barra de avisos e o sitemap.
- **Endereço provisório:** nome + id (`/turmas/patamo-6c29678d-…`). Se a turma for renomeada, o endereço antigo redireciona para o novo. Quando a API tiver `slug`, troca-se só `slugDa()` em `lib/vitrine.ts`.
- **Seções que somem** até a API entregar os textos de venda: "O que está incluso" (turma); "Sobre", "Programação", "O que está incluso" e "Quem conduz" (evento).
- **Eventos e simulados** estão ligados, mas não foram conferidos com dados reais porque a produção não tinha nenhum à venda. Conferir na primeira vez que um for publicado.

**Falta pedir ao backend** (complementa as seções 2 e 5 de `pedidos-backend.md`):
1. **`slug`** em turmas, eventos e simulados, ou a decisão de usar o id na URL.
2. **Textos de venda públicos:**
   - turma: rótulo do concurso, o que está incluso e dias e horário exatos (sem professores, decisão de 21/10/2026);
   - evento: categoria, resumo, programação, o que está incluso e professores;
   - simulado: descrição, duração e nº de questões.
3. **Local com endereço** (nome e endereço da unidade), público.
4. **Situação da venda** (aberta / em breve / encerrada), para mostrar turmas que ainda vão abrir ou que já fecharam.
5. **Preço com centavos** (pedido 5.3).
6. **Professores públicos:** nome, foto, matéria, minibio e slug.
7. **Materiais em PDF:** tipo de item, páginas, sumário, capa e liberação do arquivo após a compra.

**Formato final:** o formato exato que o site espera de cada conteúdo está em [contrato-api-conteudo.md](contrato-api-conteudo.md).
