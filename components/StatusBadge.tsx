const styles: Record<string, string> = {
  aberta: "bg-[#E4EFE5] text-[#33693A]",
  breve: "bg-[#DCE8FE] text-blue-dark",
  encerrada: "bg-[#F0E4E4] text-[#9B3535]",
};

export default function StatusBadge({
  status,
  label,
}: {
  status: "aberta" | "breve" | "encerrada";
  label: string;
}) {
  return (
    <span className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 ${styles[status]}`}>
      {label}
    </span>
  );
}
