export default function SectionHead({
  eyebrow,
  title,
  desc,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  dark?: boolean;
}) {
  return (
    <div className="mb-10">
      <span className={`eyebrow ${dark ? "text-blue" : ""}`}>{eyebrow}</span>
      <h2 className="font-display text-h2 font-bold uppercase mt-3 leading-tight">{title}</h2>
      {desc && (
        <p className={`mt-2 max-w-[560px] ${dark ? "text-steel-light" : "text-steel"}`}>{desc}</p>
      )}
    </div>
  );
}
