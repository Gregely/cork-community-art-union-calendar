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
  activeClassName = "bg-ink text-paper border-ink",
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-10 items-center rounded-full border-2 px-4 py-2 text-sm font-black transition-colors focus:outline-none focus:ring-4 focus:ring-posterYellow ${
        active ? activeClassName : "border-ink bg-white text-ink hover:bg-posterYellow"
      }`}
    >
      {label}
    </button>
  );
}
