# Segurança — Site do Quad Concursos

**Para:** time do site e do backend · **Atualizado em:** 03/10/2026

Lista de todos os riscos de segurança levantados até agora no site e na API, com as medidas para cada um. Base:
- testes feitos na API local e na publicada (`api.quadconcursos.com.br`);
- revisão do código do site;
- `npm audit` das dependências.

**Como ler**
- **Prioridade:** **Crítica** = resolver antes de qualquer coisa · **Alta** = antes do lançamento · **Média** = logo após o lançamento · **Baixa** = melhoria contínua.
- **Quem faz:** Site · Backend · Infra (hospedagem e configuração) · Decisão (o Quad precisa definir).
- **Status:** ✅ feito · 🟡 parcial · ⏳ pendente.

---

## Resumo

| # | Problema | Prioridade | Quem faz | Status |
|---|---|---|---|---|
| S1 | Dependências do site com falhas conhecidas (Next.js crítica) | **Crítica** | Site | ✅ |
| S2 | Um aluno acessar dados de outro trocando o id na URL | **Crítica** | Backend | 🟡 |
| S3 | Descobrir quem tem conta no Quad (enumeração) | Alta | Backend · Site · Decisão | ⏳ |
| S4 | Adivinhar senha no login (força bruta) | Alta | Backend | ⏳ |
| S5 | Roubo do login por script malicioso (token no navegador) | Alta | Decisão · Backend · Site | ⏳ |
| S6 | Sessões que continuam abertas quando não deveriam | Média | Backend | 🟡 |
| S7 | Códigos e links de verificação e recuperação de senha | Alta | Backend | 🟡 |
| S8 | Pagamento: preço, cupom e liberação de acesso manipuláveis | **Crítica** (antes de vender) | Site · Backend | ⏳ |
| S9 | Arquivos e materiais acessados por quem não deve | Média | Backend | 🟡 |
| S10 | HTTPS e cabeçalhos de segurança | Média | Infra · Site · Backend | 🟡 |
| S11 | CORS: quais sites podem chamar a API | Alta | Backend | 🟡 |
| S12 | Área do aluno bloqueada só no navegador | Média | Site | ⏳ |
| S13 | Redirecionamento para sites externos após o login | — | Site | ✅ |
| S14 | Privacidade e LGPD | Alta | Conteúdo · Backend · Site | 🟡 |
| S15 | Scripts de terceiros (Analytics, Pixel) | Média | Site · Decisão | ⏳ |
| S16 | Senhas, chaves e ambientes | Alta | Infra | 🟡 |
| S17 | Monitoramento e resposta a incidentes | Média | Infra · Backend | ⏳ |
| S18 | Contas de administrador e professor | Alta | Backend · Decisão | ⏳ |

---

## S1. Dependências do site com falhas conhecidas

**Problema:** o `npm audit` aponta **13 vulnerabilidades** nas bibliotecas do site: 1 crítica, 10 altas e 2 moderadas. A crítica é o **Next.js 16.2.10**, que tem falhas publicadas de:
- **execução remota de código**, em que um atacante consegue rodar comandos no servidor do site;
- **desvio do middleware**, justamente o recurso que usaríamos para proteger a área do aluno (S12);
- vazamento de rotas internas e negação de serviço.

**Risco:** o servidor onde o site roda pode ser invadido.

**Status (06/10/2026):**
- ✅ Next.js atualizado para **16.3.8** (e `eslint-config-next` junto): a falha crítica e as de desvio do middleware estão corrigidas. Build de produção e os 16 testes de ponta a ponta passaram.
- ✅ As dependências que vão para o site publicado têm **0 vulnerabilidades** (`npm audit --omit=dev`).
- 🟡 Restam 9 avisos (7 altos, 2 moderados) só em **ferramentas de desenvolvimento** (verificador de código e Tailwind 3), que não vão para o site publicado. Corrigi-los exige migrar para o Tailwind 4 — fica para uma atualização planejada.
- ✅ A verificação automática do GitHub (`.github/workflows/verificacao.yml`) barra vulnerabilidades graves nas dependências do site.

**Medidas principais:**
1. Atualizar o **Next.js para 16.3.8 ou superior** e, junto, `eslint-config-next`, `tailwindcss` e `postcss`.
2. Rodar `npm audit` a cada atualização e incluí-lo na verificação automática do GitHub (backlog, Etapa 4, Bloco 3).
3. Ativar alertas automáticos de atualização de segurança (Dependabot do GitHub).
4. Revisar as dependências uma vez por mês.

---

## S2. Um aluno acessar dados de outro trocando o id

**Problema:** rotas que recebem um id na URL (ex.: `/api/enderecos/{id}`) precisam conferir se o dado **pertence a quem está logado**. Sem essa conferência, basta trocar o id para ver ou alterar dados de outra pessoa.

**Risco:** vazamento e alteração de dados pessoais (LGPD).

**Status:**
- ✅ **Endereço:** corrigido. Um aluno tentando ler ou alterar o endereço de outro recebe 403 (conferido em 03/10/2026).
- ✅ **Cadastro do usuário** (`/api/usuarios/{id}`): aluno recebe 403. Ele lê os próprios dados por `/api/alunos/eu`.
- ✅ **Matrículas:** comprovado com dados (05/10/2026). O aluno A só recebe as próprias matrículas, mesmo pedindo as do aluno B ou filtrando pela turma de B.
- ✅ **Inscrições e compras:** comprovado com dados (05/10/2026). O aluno A não vê, por nenhum filtro, a inscrição nem a compra do aluno B; abrir a compra de B pelo id dá 403, e cancelar a inscrição de B dá 404.
- ✅ **Download de materiais:** comprovado com dados (05/10/2026). O aluno A não vê nem baixa o material da turma de B (e vice-versa): 403 "Só quem tem matrícula ativa na turma do material o alcança".

**Medidas principais:**
1. Regra geral no backend: para o papel `ALUNO`, **toda** rota com id confere o dono e responde 403 se não for dele.
2. Preferir rotas `/eu`, que pegam o usuário do token e não recebem id.
3. Teste com duas contas de aluno para cada rota nova, perguntando: "o aluno B acessa o dado do aluno A?".

---

## S3. Descobrir quem tem conta no Quad (enumeração)

**Problema:** três lugares revelam se um e-mail, CPF ou telefone já tem conta:
- a consulta de disponibilidade do cadastro (`POST /api/usuarios/disponibilidade`, pública);
- a criação da conta (responde "Já existe uma conta com este e-mail");
- e, futuramente, o "esqueci minha senha", se for mal feito.

**Risco:** um robô testa milhares de e-mails e CPFs e monta uma lista de alunos do Quad. Isso é um problema de privacidade e facilita golpes direcionados ("Olá, aluno do Quad, sua matrícula...").

**Não protegem:**
- **CORS:** só o navegador obedece; um robô ignora.
- **Chave da API no site:** qualquer visitante consegue ler.
- **Passar a chamada pelo servidor do site:** o risco só muda de lugar.

**Medidas principais:**
1. **Limite de tentativas** (essencial): ex.: 10 consultas por minuto e 50 por dia por IP na disponibilidade e na criação de conta. Acima disso, responder 429.
2. **Verificação anti-robô invisível** (recomendada): Cloudflare Turnstile (gratuito) ou Google reCAPTCHA v3 no passo 1 do cadastro, **sem pedir nada ao aluno**. O site envia o "selo" junto com a consulta, e o backend confere antes de responder.
3. **Monitorar** volume alto de consultas vindo do mesmo IP.
4. **Esqueci minha senha:** responder sempre "se houver uma conta, enviamos o link", exista o e-mail ou não. O site já está pronto para isso.

**Decisão:** qual serviço anti-robô usar.

---

## S4. Adivinhar senha no login (força bruta)

**Problema:** hoje não há limite de tentativas de login.

**Risco:** um robô testa senhas comuns em várias contas até acertar.

**Medidas principais:**
1. **Limite por IP e por conta:** ex.: 5 erros seguidos na mesma conta → espera de 15 minutos, com bloqueio progressivo.
2. **Verificação anti-robô** depois de algumas tentativas erradas (mesmo serviço do S3).
3. **Mensagem genérica:** ✅ já é "E-mail ou senha inválidos", sem dizer qual dos dois errou.
4. **Avisar o aluno por e-mail** quando houver muitas tentativas na conta dele.

---

## S5. Roubo do login por script malicioso

**Problema:** o login do aluno (token de acesso, que vale cerca de 15 minutos, e token de renovação, que vale **7 dias**) fica guardado no navegador (`localStorage`), onde **qualquer script da página consegue ler**.

**Risco:** se um script malicioso entrar no site, por uma falha no código ou por um script de terceiros comprometido (S15), ele copia o token de renovação e **controla a conta do aluno por uma semana**, sem saber a senha.

**Medidas principais:**
1. **Guardar o login num cookie protegido** (`HttpOnly`, `Secure`, `SameSite=Lax`), criado pelo backend no login e na renovação. Script não consegue ler cookie protegido. Exige mudanças no backend (gravar, ler e apagar o cookie; CORS com credenciais; proteção contra requisições forjadas) e no site.
2. **Política de conteúdo (CSP)** no site, limitando de onde scripts podem ser carregados (S10).
3. **Controlar scripts de terceiros** (S15).
4. Manter o token de acesso curto (✅ cerca de 15 minutos).

**Decisão (05/10/2026):** cookie protegido. Pedido detalhado ao backend em `docs/pedidos-backend.md`, item 2.10; o site é adaptado depois da entrega.

**Requisito:** o site precisa ficar no mesmo domínio principal da API (`quadconcursos.com.br`).

---

## S6. Sessões que continuam abertas quando não deveriam

**Problema:** algumas situações deveriam encerrar sessões abertas em outros aparelhos.

**Status:**
- ✅ **Renovação com troca de token:** cada renovação invalida o token de renovação anterior (conferido).
- 🟡 **Sair:** o site avisa o backend (`POST /auth/logout`). Falta o backend **confirmar** que o token de renovação deixa de funcionar.
- ⏳ **Trocar a senha** pelo perfil **não encerra** as outras sessões (conferido: o aluno continua logado em outros lugares).

**Medidas principais:**
1. Ao **trocar ou redefinir a senha**, encerrar todas as outras sessões da conta.
2. Se um token de renovação já usado aparecer de novo (sinal de roubo), **encerrar todas as sessões** da conta.
3. **Depois do lançamento:** tela "Meus acessos", com aparelhos conectados e botão "sair de todos".

---

## S7. Códigos e links de verificação e recuperação de senha

**Problema:** códigos de SMS e links de e-mail viram alvo de tentativa e erro e de reaproveitamento.

**Medidas principais (backend):**
1. **Códigos de SMS:**
   - 6 dígitos;
   - guardados com hash, nunca o número puro;
   - válidos por 10 minutos;
   - no máximo 5 tentativas erradas;
   - reenvio só depois de 60 segundos.
2. **Links de e-mail:**
   - uso único;
   - redefinição de senha válida por 1 hora; confirmação de e-mail por 7 dias.
3. **Troca de telefone:** só pelo fluxo de código. A rota de editar o cadastro **não pode** aceitar o telefone.
4. **Redefinir a senha** encerra as sessões abertas (S6).
5. **Limite de tentativas** nas rotas de envio, contra disparo em massa de SMS, que é um custo direto para o Quad.

**Já feito no site:**
- ✅ A confirmação de e-mail acontece **num clique**, e não ao abrir o link, para o link não ser gasto pela pré-visualização do aplicativo de e-mail.
- ✅ O código do SMS só é enviado quando o aluno pede.

---

## S8. Pagamento

**Problema:** tudo que fica no navegador pode ser alterado pelo comprador. Hoje:
- o preço dos itens do carrinho é guardado no navegador;
- os cupons (`QUAD10`, `BEMVINDO`) estão escritos no código do site;
- a tela de confirmação mostra "aprovado" a partir de um parâmetro na URL (simulação, até a integração com o Pagar.me).

**Risco:** comprar com preço ou desconto falsos, ou receber acesso sem pagar.

**Medidas principais:**
1. **Preço e desconto calculados só no backend:** o site manda apenas o que está sendo comprado e o código do cupom. Nunca o valor.
2. **Remover os cupons do código do site** antes do lançamento; o backend valida.
3. **Liberar acesso só pelo aviso do Pagar.me (webhook)**, nunca pela tela de confirmação do site.
4. **Webhook autenticado e sem duplicidade:** conferir que o aviso veio mesmo do Pagar.me e ignorar avisos repetidos.
5. **Cartão:** os dados vão direto do navegador ao Pagar.me (token de 60 segundos). O servidor do Quad nunca vê o número do cartão.
6. **Chave secreta do Pagar.me só no backend.** O site usa apenas a chave pública.
7. **Cartão salvo** (se um dia existir): guardado só no Pagar.me, pedindo o CVV de novo a cada compra.

---

## S9. Arquivos e materiais

**Problema:** PDFs e materiais pagos não podem ser baixados por quem não comprou nem copiados por um link permanente.

**Medidas principais:**
1. ✅ Download **só com matrícula ativa** na turma: comprovado com duas contas (S2).
2. Arquivos num armazenamento **privado** (S3 da AWS sem acesso público), entregues pela API ou por links temporários.
3. **Foto de perfil** (futuro): aceitar só JPG e PNG, até 2 MB, e guardar em local privado.

---

## S10. HTTPS e cabeçalhos de segurança

**Status:**
- ✅ A API responde em HTTPS, e o `http://` redireciona.
- ✅ A API já envia `X-Frame-Options: DENY` e `X-Content-Type-Options: nosniff`.
- ⏳ A API **não envia HSTS** (cabeçalho que obriga o navegador a sempre usar HTTPS).
- ⏳ O Swagger anuncia o servidor como `http://` e está público em produção.
- ✅ O site envia cabeçalhos de segurança (`next.config.mjs`, 19/10/2026): CSP, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` e HSTS (2 anos, sem `includeSubDomains` até confirmar o https de todos os subdomínios). Também não anuncia mais o Next.js (`X-Powered-By`).
- ⚠️ A CSP **não usa nonce**. Os scripts em linha do Next continuam liberados (`'unsafe-inline'`), mas nenhum script de outro domínio carrega. O nonce obrigaria a gerar cada página a cada visita e acabaria com o cache. Analytics e Pixel (S15) vão exigir acrescentar os domínios deles na CSP.

**Medidas principais:**
1. **HSTS** na API e no site.
2. **Cabeçalhos no site** (`next.config.mjs`):
   - política de conteúdo (CSP);
   - bloqueio de exibição dentro de outros sites (`frame-ancestors`);
   - `Referrer-Policy`, `Permissions-Policy` e `nosniff`.
3. **Swagger:** corrigir o `http` (`server.forward-headers-strategy=framework`) e **avaliar restringir o acesso** a ele em produção, porque ele mostra o mapa completo da API.

---

## S11. CORS: quais sites podem chamar a API

**Status:** ✅ a API recusa sites desconhecidos, mas hoje só libera `http://localhost:3000`.

**Medidas principais:**
1. Antes do lançamento, liberar **só** o domínio final do site (`https://quadconcursos.com.br` e, se usado, `https://www`). Nunca liberar qualquer origem (`*`).
2. Se o login for para cookie (S5), habilitar credenciais apenas para esses domínios.
3. Lembrar que o CORS **não substitui** as outras proteções: ele só vale para navegadores.

---

## S12. Área do aluno bloqueada só no navegador

**Problema:** hoje quem decide se a pessoa pode ver `/aluno` é o navegador.

**Risco:** baixo. Os **dados** da área do aluno já são protegidos pela API, e sem login nada é carregado. Só a "casca" da página poderia aparecer.

**Medidas principais:**
1. Depois do S5 (cookie), bloquear `/aluno` e `/checkout` **no servidor do site** antes de a página carregar.
2. Fazer isso **só com o Next.js atualizado** (S1), porque a versão atual tem falha justamente nesse bloqueio.

---

## S13. Redirecionamento para sites externos após o login ✅

O endereço de volta após o login (`?redirect=`) só aceita caminhos do próprio site. Testado: `?redirect=//exemplo.com` é ignorado. Nada a fazer.

---

## S14. Privacidade e LGPD

**Medidas principais:**
1. **Termos de uso e Política de privacidade** publicados (`/termos` e `/privacidade`), com revisão jurídica.
2. **Aceite registrado:** o site já envia `aceiteTermos` e `versaoDosTermos`; falta o backend gravar.
3. **Consentimento de cookies** antes de ativar Analytics ou Pixel (S15).
4. **Canal para o aluno pedir** cópia ou exclusão dos próprios dados.
5. **Responder só o necessário:**
   - ✅ a disponibilidade devolve só sim ou não;
   - ⏳ a mensagem de erro do endereço cita o id da conta de outra pessoa; trocar por uma mensagem genérica.
6. **Registros (logs) sem dados sensíveis:** nunca gravar senha, token ou CPF completo.
7. **Plano de incidente:** a LGPD exige comunicar a ANPD e os afetados em vazamentos relevantes.

---

## S15. Scripts de terceiros (Analytics, Pixel)

**Problema:** todo script de terceiros roda com os mesmos poderes do site. Se o fornecedor for invadido, o script pode roubar dados e o login do aluno (S5).

**Medidas principais:**
1. Instalar só o necessário e **só depois do consentimento** de cookies.
2. Liberar esses domínios na política de conteúdo (CSP) e bloquear o resto.
3. **Não enviar dados pessoais** (e-mail, CPF, telefone) para Pixel ou Analytics sem necessidade e sem consentimento.
4. Fazer o S5 (cookie protegido) **antes** de colocar esses scripts.

---

## S16. Senhas, chaves e ambientes

**Status:**
- ✅ Arquivos `.env*.local` fora do Git.
- ✅ Banco local separado do de produção.
- ✅ Chave secreta do Pagar.me prevista só no backend.

**Medidas principais:**
1. Chaves de produção (Pagar.me, banco, e-mail, SMS) **só no painel da hospedagem**, nunca no código nem em conversas.
2. **Trocar** qualquer chave que já tenha sido exposta.
3. Contas de teste **só no banco local**. Conferir que nenhuma conta de teste exista em produção.
4. **Backups** do banco criptografados e com teste de restauração.

---

## S17. Monitoramento e resposta a incidentes

**Medidas principais:**
1. Alertas de erro no site e na API (ex.: Sentry).
2. Alerta para **picos de 401, 403 e 429**, que costumam indicar ataque em andamento.
3. **Registro das ações de administrador** (quem matriculou, estornou, alterou o quê e quando).
4. Plano simples de incidente: quem é avisado, como bloquear, como comunicar (S14, item 7).

---

## S18. Contas de administrador e professor

**Problema:** uma conta de administrador invadida dá acesso a todos os dados e ações: matrículas, estornos, materiais.

**Medidas principais:**
1. **Verificação em duas etapas (2FA)** obrigatória para administradores e professores.
2. **Menor privilégio:** cada pessoa só com as permissões de que precisa. Revisar as permissões periodicamente.
3. Senhas fortes e únicas, e desligar logo as contas de quem sai da equipe.

---

## Já feito

| O quê | Onde |
|---|---|
| Endereço só acessível pelo dono ou administrador | Backend (03/10/2026) |
| CPF, e-mail e telefone únicos por conta | Backend |
| CPF validado também no backend | Backend |
| Troca de senha exige a senha atual | Backend |
| Token de renovação trocado a cada renovação | Backend |
| Mensagem genérica de login ("E-mail ou senha inválidos") | Backend |
| Disponibilidade responde só sim ou não | Backend |
| API em HTTPS, com `X-Frame-Options` e `nosniff` | Backend · Infra |
| Destino após o login só dentro do site | Site |
| Confirmação de e-mail por clique (o link não é gasto pela pré-visualização) | Site |
| Cartão nunca passa pelo servidor do Quad (planejado no checkout) | Site · Backend |

---

## Para depois do lançamento

1. Verificação em duas etapas **opcional** para alunos.
2. Tela "Meus acessos", com aparelhos conectados e "sair de todos".
3. Firewall de aplicação (AWS WAF ou Cloudflare) na frente do site e da API.
4. **Teste de invasão** feito por terceiros antes de grandes campanhas de venda.
5. Revisão de segurança a cada trimestre usando este documento.
6. Programa para receber relatos de falhas de quem as encontrar.
