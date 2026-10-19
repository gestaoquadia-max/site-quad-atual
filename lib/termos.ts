// Versão dos Termos de uso e da Política de privacidade aceitos no cadastro.
// Atualizar sempre que o texto de /termos ou /privacidade mudar, para o backend saber qual versão cada aluno aceitou.
export const VERSAO_DOS_TERMOS = "2026-10-06";

// "2026-10-06" -> "06/10/2026", para exibir nas páginas.
export const VERSAO_DOS_TERMOS_EXIBICAO = VERSAO_DOS_TERMOS.split("-").reverse().join("/");
