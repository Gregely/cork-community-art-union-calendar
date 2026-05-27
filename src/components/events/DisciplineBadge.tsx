// Stamp-style discipline tags. Each discipline has its own muted risograph ink.
// Double-border: border-2 (inner ring) + box-shadow gap (creamLight) + outer ring.
// Background is a ~12 % alpha tint of the ink for a barely-there colour ghost.
const stampInk: Record<string, string> = {
  Exhibition:        "#c0513a",   // warm coral
  Music:             "#4a6b28",   // deep olive
  Theatre:           "#b8421f",   // burnt red
  Film:              "#243040",   // dark slate / darkroom
  Dance:             "#8b4020",   // rust / terracotta
  Poetry:            "#6b3a7a",   // muted plum
  Workshop:          "#b87a12",   // amber-ochre
  Talk:              "#8b3218",   // deep rust (distinct from Theatre)
  Community:         "#2a6838",   // forest green (distinct from Music)
  Multidisciplinary: "#4a4c20",   // olive-charcoal
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
        backgroundColor: ink + "1e",          // ~12 % alpha tint
        boxShadow: `0 0 0 2px #fef7e6, 0 0 0 3.5px ${ink}`,
      }}
    >
      {discipline}
    </span>
  );
}
