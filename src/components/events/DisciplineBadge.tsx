// Stamp-style discipline tags. Double-border effect uses box-shadow + border with matching ink color.
const stampInk: Record<string, string> = {
  Exhibition: "#c98979",    // dusty pink
  Music: "#5a6b2e",         // olive
  Theatre: "#b8421f",       // burnt red
  Film: "#2c1810",          // cacao deep
  Dance: "#6b3d2a",         // cacao
  Poetry: "#4d2b1d",        // cacao mid
  Workshop: "#c89432",      // ochre
  Talk: "#b8421f",          // burnt red
  Community: "#5a6b2e",     // olive
  Multidisciplinary: "#6b3d2a", // legacy
};

type DisciplineBadgeProps = {
  discipline: string;
};

export function DisciplineBadge({ discipline }: DisciplineBadgeProps) {
  const ink = stampInk[discipline] ?? "#6b3d2a";
  return (
    <span
      className="inline-flex items-center whitespace-nowrap border-2 px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em]"
      style={{
        color: ink,
        borderColor: ink,
        boxShadow: `0 0 0 2px #fef7e6, 0 0 0 3.5px ${ink}`,
      }}
    >
      {discipline}
    </span>
  );
}
