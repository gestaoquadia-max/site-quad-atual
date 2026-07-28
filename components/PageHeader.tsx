export default function PageHeader({
  eyebrow,
  title,
  desc,
  bgClassName = "bg-navy-deep",
  textClassName = "text-offwhite",
  descClassName = "text-steel-light",
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  bgClassName?: string;
  textClassName?: string;
  descClassName?: string;
}) {
  return (
    <div className={`${bgClassName} ${textClassName} py-header`}>
      <div className="mx-auto max-w-site px-6">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="font-display mt-3.5 text-h1 font-bold uppercase leading-tight">{title}</h1>
        {desc && <p className={`mt-2 max-w-[540px] ${descClassName}`}>{desc}</p>}
      </div>
    </div>
  );
}
