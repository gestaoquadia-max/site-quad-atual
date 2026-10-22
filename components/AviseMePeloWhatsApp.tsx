import { institucional, linkDoWhatsApp } from "@/lib/institucional";

// Lista de interessados: ainda não existe no backend. Até lá, o pedido vai pelo WhatsApp do atendimento,
// com a mensagem já escrita. Sem número cadastrado em lib/institucional.ts, não aparece.
export default function AviseMePeloWhatsApp({
  assunto,
  rotulo = "Entrar na lista de interesses",
  destaque = false,
  className = "",
}: {
  // Completa a frase "quero ser avisado quando abrir …".
  assunto: string;
  rotulo?: string;
  destaque?: boolean;
  className?: string;
}) {
  if (!institucional.whatsapp) return null;
  const texto = `Olá! Vim pelo site do Quad Concursos e quero ser avisado quando abrir ${assunto}.`;
  return (
    <a
      href={`${linkDoWhatsApp(institucional.whatsapp)}?text=${encodeURIComponent(texto)}`}
      target="_blank"
      rel="noopener"
      className={`btn-q h-12 px-[18px] text-[15px] ${destaque ? "btn-q-azul" : "btn-q-contorno"} ${className}`}
    >
      {rotulo}
    </a>
  );
}
