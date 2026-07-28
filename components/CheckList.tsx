export default function CheckList({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <ul>
      {items.map((item) => (
        <li
          key={item}
          className={`flex gap-3 border-b py-2.5 text-[15px] transition-colors ${
            dark ? "border-dark text-steel-light hover:bg-white/5" : "border-light text-[#3A4452] hover:bg-offwhite"
          }`}
        >
          <span className="hexagon mt-0.5 h-[18px] w-[18px] flex-shrink-0 bg-blue" />
          {item}
        </li>
      ))}
    </ul>
  );
}
