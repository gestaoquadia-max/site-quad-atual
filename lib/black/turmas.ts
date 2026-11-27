import { modalidades } from "@/lib/conteudo";

// As modalidades com turma na Black (pedido de 27/11/2026: só a SD BOPE de 11/01 e a SD PATAMO de 18/01). Vale só para
// a prévia antes da abertura, quando a API ainda esconde as turmas; depois das 09:00, o site mostra o que vier marcado
// como Black no cadastro.
const DA_BLACK = ["patamo", "bope"];
export const MODALIDADES_DA_BLACK = modalidades.filter((m) => DA_BLACK.includes(m.id));
