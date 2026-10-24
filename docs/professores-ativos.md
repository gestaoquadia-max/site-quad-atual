# Professores ativos: planilha × cadastro em produção

**Conferido em:** 24/10/2026
**Fontes:** planilha "INFORMAÇÕES DOS PROFESSORES ATIVOS" (coordenação) e a vitrine pública de professores da API de produção (`GET /api/professores/vitrine`, só leitura).

Os professores do site vêm do cadastro da API. Os ajustes abaixo são feitos pelo console, em produção; o site mostra o que estiver lá.

## Na planilha, mas sem cadastro em produção

| Professor | Matéria | Turmas | Turnos | Formato |
|---|---|---|---|---|
| Alberto | Biologia | CBM | Todos | Online |
| Danilo Dultra | Física | CBM | Todos | Online |
| Enzo | Química | CBM | Todos | Online |

## Cadastrados em produção, mas fora da planilha

- **Bruno Lima** (Informática, Matemática): parece cadastro de teste do seed de desenvolvimento.
- **Graziele Rodrigues Miranda Silva** (Direito Constitucional): conferir se ainda dá aula; se não, desativar.

## Matérias diferentes entre a planilha e o cadastro

| Professor (planilha → cadastro) | Planilha | A mais no cadastro |
|---|---|---|
| Danilo Moura → Danilo Ribeiro Moura | Dir. Administrativo | Raciocínio Lógico |
| Netão → Nelson Alves Ribeiro Neto | Matemática | Raciocínio Lógico |
| Omar → Omar Ferreira dos Santos Junior | Estatística | Matemática |
| Felipe Cotrim → Fellipe de Brito Cotrim | Igualdade | Direitos Humanos |
| Marcello → Marcello Reuter e Esquivel | Dir. Penal, Dir. Proc. Penal, Leg. Extravagante | Promoção da Igualdade |
| Minho → Elielmo Barbosa Miranda | Estatuto, Penal Militar, Proc. Penal Militar | Direito Administrativo |
| Fabian → Roberto Fabian Santos de Araújo | Dir. Proc. Penal | Prova Discursiva |
| Rodrigo → Rodrigo Jose Sousa Gomes | Redação, Discursiva, Med. Legal | "Prova Discursiva" repetida de "Discursiva" |

Os demais conferem: Wilson Gabriel, Alisson, Bernam (Jonath Bernam), Kigran (Moab Kigran), Noelice, Ezequiel, Cleison, Eduarda, Jorge, Alan, Paulo (Paulo Roberto, Inglês), Paulo Filho (Paulo Jorge, Contabilidade), Danilo Santos, Dan Reis (Daniel de Brito Reis), Bruno Araújo, Airton e Macário (Daniel Macário).

## Minibio

A minibio do site é o campo **graduação** do cadastro. Muitos professores estão com "Sem graduação": o site não mostra esse texto (desde 24/10/2026), e o cartão fica só com nome e matérias. Para aparecer uma apresentação, preencher a graduação com um texto curto (até 200 caracteres), por exemplo: "Bacharel em Direito, professor de Direito Constitucional para concursos policiais da Bahia".

## O que a planilha tem e o site ainda não mostra

Turnos, turmas (PMBA, PCBA, CBM) e formato (online ou presencial) de cada professor. A vitrine pública não traz esses dados; se o Quad quiser mostrá-los na página do professor, é um pedido novo ao backend.
