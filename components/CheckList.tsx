// Lista de itens com marcador de "incluso" (novo visual). `dark` para fundo escuro.
export default function CheckList({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <ul>
      {items.map((item) => (
        <li
          key={item}
          className={`flex items-start gap-3 border-b py-3 text-[15px] leading-[1.5] last:border-0 ${
            dark ? "border-white/[0.08] text-[#DCE4EF]" : "border-linha text-ardosia-escura"
          }`}
        >
          <span aria-hidden="true" className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-azul/[0.12] text-azul">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path d="M3 8.5l3.2 3L13 4.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
