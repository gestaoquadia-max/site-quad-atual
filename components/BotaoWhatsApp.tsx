import { institucional, linkDoWhatsApp } from "@/lib/institucional";

const MENSAGEM = "Olá! Vim pelo site do Quad Concursos e gostaria de falar com o atendimento.";

// Botão flutuante do atendimento, em todas as páginas públicas. Sem número em lib/institucional.ts, não aparece.
export default function BotaoWhatsApp() {
  if (!institucional.whatsapp) return null;
  return (
    <a
      href={`${linkDoWhatsApp(institucional.whatsapp)}?text=${encodeURIComponent(MENSAGEM)}`}
      target="_blank"
      rel="noopener"
      aria-label="Falar com o atendimento pelo WhatsApp"
      title="Falar com o atendimento pelo WhatsApp"
      className="fixed bottom-[calc(16px+env(safe-area-inset-bottom,0px))] right-[calc(16px+env(safe-area-inset-right,0px))] z-[80] grid h-14 w-14 place-items-center rounded-full bg-[#25D366] shadow-[0_10px_24px_-8px_rgba(37,211,102,0.55),0_3px_8px_rgba(0,0,0,0.18)] transition-[transform,box-shadow] duration-200 hover:scale-[1.07] hover:shadow-[0_14px_30px_-8px_rgba(37,211,102,0.65),0_4px_10px_rgba(0,0,0,0.2)] focus-visible:outline-white active:scale-[0.98] md:bottom-[calc(24px+env(safe-area-inset-bottom,0px))] md:right-[calc(24px+env(safe-area-inset-right,0px))]"
    >
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" fill="#fff">
        <path d="M16.04 3C9.06 3 3.38 8.62 3.38 15.55c0 2.22.59 4.38 1.7 6.29L3.3 28.4l6.76-1.75a12.7 12.7 0 0 0 5.98 1.51h.01c6.98 0 12.66-5.62 12.66-12.55 0-3.36-1.32-6.51-3.71-8.88A12.62 12.62 0 0 0 16.04 3Zm0 22.98h-.01c-1.89 0-3.74-.5-5.36-1.46l-.38-.22-4.01 1.04 1.07-3.88-.25-.4a10.33 10.33 0 0 1-1.6-5.51c0-5.75 4.72-10.43 10.54-10.43 2.82 0 5.46 1.09 7.45 3.06a10.3 10.3 0 0 1 3.09 7.38c0 5.75-4.73 10.42-10.54 10.42Zm5.78-7.8c-.32-.16-1.87-.92-2.16-1.02-.29-.11-.5-.16-.71.16-.21.31-.82 1.02-1 1.23-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.56-.94-.83-1.58-1.86-1.76-2.17-.18-.32-.02-.49.14-.64.14-.14.32-.37.48-.55.16-.18.21-.31.32-.52.11-.21.05-.39-.03-.55-.08-.16-.71-1.71-.98-2.34-.26-.61-.52-.53-.71-.54h-.61c-.21 0-.55.08-.84.39-.29.31-1.1 1.07-1.1 2.62 0 1.54 1.13 3.04 1.29 3.25.16.21 2.22 3.37 5.38 4.72.75.32 1.34.52 1.8.66.76.24 1.44.2 1.98.12.6-.09 1.87-.76 2.13-1.49.26-.73.26-1.36.18-1.49-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </a>
  );
}
