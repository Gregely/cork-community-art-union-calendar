import { disciplines } from "../../types/event";

const activeColors: Record<string, string> = {
  Exhibition: "bg-pinkPunch text-white border-pinkPunch",
  Music: "bg-leeBlue text-white border-leeBlue",
  Theatre: "bg-corkRed text-white border-corkRed",
  Film: "bg-ink text-paper border-ink",
  Dance: "bg-grass text-white border-grass",
  Poetry: "bg-purple-600 text-white border-purple-600",
  Workshop: "bg-posterYellow text-ink border-posterYellow",
  Talk: "bg-orange-500 text-white border-orange-500",
  Community: "bg-teal-500 text-white border-teal-500",
};

type DisciplineChipPickerProps = {
  selectedDisciplines: string[];
  onChange: (disciplines: string[]) => void;
  required?: boolean;
  /** Extra Tailwind classes for the outer wrapper (e.g. grid column span) */
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
    <div className={`space-y-2 text-sm font-black ${className}`}>
      <span>
        Discipline{required ? <span className="text-corkRed"> *</span> : null}
      </span>
      <div className="flex flex-wrap gap-2">
        {disciplines.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => toggle(d)}
            className={`inline-flex min-h-10 items-center rounded-full border-2 px-4 py-2 text-sm font-black transition-colors focus:outline-none focus:ring-4 focus:ring-posterYellow ${
              selectedDisciplines.includes(d)
                ? (activeColors[d] ?? "bg-ink text-paper border-ink")
                : "border-ink bg-white text-ink hover:bg-posterYellow"
            }`}
          >
            {d}
          </button>
        ))}
      </div>
      {required && selectedDisciplines.length === 0 ? (
        <p className="text-xs font-bold text-stone-500">Pick at least one.</p>
      ) : null}
    </div>
  );
}
