type FilterChipProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  activeClassName?: string;
};

export function FilterChip({
  label,
  active,
  onClick,
  activeClassName = "bg-ink text-creamLight border-ink",
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ clipPath: "polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px)" }}
      className={`inline-flex min-h-10 items-center border-2 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.08em] transition-[background-color,transform] hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-posterYellow ${
        active
          ? activeClassName
          : "border-ink bg-creamLight text-ink hover:bg-posterYellow"
      }`}
    >
      {label}
    </button>
  );
}
