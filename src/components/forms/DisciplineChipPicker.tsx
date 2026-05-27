import { disciplines } from "../../types/event";

const activeColors: Record<string, string> = {
  Exhibition: "bg-pinkPunch text-ink border-pinkPunch",
  Music: "bg-grass text-creamLight border-grass",
  Theatre: "bg-corkRed text-creamLight border-corkRed",
  Film: "bg-ink text-creamLight border-ink",
  Dance: "bg-cacao text-creamLight border-cacao",
  Poetry: "bg-cacaoMid text-creamLight border-cacaoMid",
  Workshop: "bg-posterYellow text-ink border-posterYellow",
  Talk: "bg-corkRed text-creamLight border-corkRed",
  Community: "bg-grass text-creamLight border-grass",
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
