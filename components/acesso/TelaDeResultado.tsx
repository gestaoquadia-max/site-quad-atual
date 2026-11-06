// Fim de uma ação de acesso (e-mail e celular confirmados, senha alterada, link enviado): ícone, título, texto
// e o botão para seguir. Mesmo ícone da tela de confirmação do checkout; "enviado" é o envelope de "confira seu e-mail".
export default function TelaDeResultado({
  tom,
  titulo,
  children,
  acoes,
}: {
  tom: "sucesso" | "erro" | "enviado";
  titulo: string;
  children: React.ReactNode;
  acoes: React.ReactNode;
}) {
  const cores = { sucesso: "bg-[rgba(34,197,94,0.14)] text-[#5FD39A]", erro: "bg-[rgba(220,38,38,0.14)] text-[#FF9C9C]", enviado: "bg-azul/15 text-azul-ceu" };
  return (
    <div className="flex flex-col gap-[18px]">
      <div aria-hidden="true" className={`grid h-14 w-14 place-items-center rounded-2xl ${cores[tom]}`}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {tom === "sucesso" && <path d="M5 12.5l4.5 4.5L19 7.5" />}
          {tom === "erro" && <path d="M7 7l10 10M17 7L7 17" />}
          {tom === "enviado" && (
            <>
              <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
              <path d="M4 7l8 6 8-6" />
            </>
          )}
        </svg>
      </div>
      <h1 className="font-display text-[clamp(26px,2.4vw,32px)] font-extrabold tracking-[-0.03em] text-tinta">{titulo}</h1>
      <div role={tom === "erro" ? "alert" : "status"} className="text-[15px] leading-[1.6] text-ardosia-escura">
        {children}
      </div>
      <div className="flex flex-col gap-2.5">{acoes}</div>
    </div>
  );
}
