import Link from "next/link";

export default function Breadcrumb({
  items,
}: {
  items: { href?: string; label: string }[];
}) {
  return (
    <div className="mb-5 text-[13px] text-steel-dim">
      {items.map((item, i) => (
        <span key={item.label}>
          {i > 0 && " / "}
          {item.href ? (
            <Link href={item.href} className="focus-ring transition-colors hover:text-blue">
              {item.label}
            </Link>
          ) : (
            item.label
          )}
        </span>
      ))}
    </div>
  );
}
