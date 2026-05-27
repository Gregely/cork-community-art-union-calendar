import { disciplines } from "../../types/event";

// Active colours mirror the DisciplineBadge ink palette exactly.
const activeColors: Record<string, string> = {
  Exhibition: "bg-[#c0513a] text-creamLight border-[#c0513a]",
  Music:      "bg-[#4a6b28] text-creamLight border-[#4a6b28]",
  Theatre:    "bg-corkRed   text-creamLight border-corkRed",
  Film:       "bg-[#243040] text-creamLight border-[#243040]",
  Dance:      "bg-[#8b4020] text-creamLight border-[#8b4020]",
  Poetry:     "bg-[#6b3a7a] text-creamLight border-[#6b3a7a]",
  Workshop:   "bg-[#b87a12] text-ink        border-[#b87a12]",
  Talk:       "bg-[#8b3218] text-creamLight border-[#8b3218]",
  Community:  "bg-[#2a6838] text-creamLight border-[#2a6838]",
};

type DisciplineChipPickerProps = {
  selectedDisciplines: string[];
  onChange: (disciplines: string[]) => void;
  required?: boolean;
  className?: string;
};

export function DisciplineChipPicker({
  selectedDisciplines,
  onChange,
  required = false,
  className = "",
}: DisciplineChipPickerProps) {
  function toggle(d: string) {
    onChange(
      selectedDisciplines.includes(d)
        ? selectedDisciplines.filter((x) => x !== d)
        : [...selectedDisciplines, d],
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-ink">
        Discipline{required ? <span className="text-corkRed"> *</span> : null}
      </span>
      <div className="flex flex-wrap gap-2">
        {disciplines.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => toggle(d)}
            style={{ clipPath: "polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px)" }}
            className={`inline-flex min-h-10 items-center border-2 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.08em] transition-[background-color,transform] hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-posterYellow ${
              selectedDisciplines.includes(d)
                ? (activeColors[d] ?? "bg-ink text-creamLight border-ink")
                : "border-ink bg-creamLight text-ink hover:bg-posterYellow"
            }`}
          >
            {d}
          </button>
        ))}
      </div>
      {required && selectedDisciplines.length === 0 ? (
        <p className="font-mono text-xs text-cacao">Pick at least one.</p>
      ) : null}
    </div>
  );
}
