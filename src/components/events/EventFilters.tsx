import type { Discipline } from "../../types/event";
import { disciplines } from "../../types/event";

type EventFiltersProps = {
  selectedDiscipline: "All" | Discipline;
  startDate: string;
  endDate: string;
  onDisciplineChange: (discipline: "All" | Discipline) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
};

export function EventFilters({
  selectedDiscipline,
  startDate,
  endDate,
  onDisciplineChange,
  onStartDateChange,
  onEndDateChange,
}: EventFiltersProps) {
  return (
    <section className="rounded-2xl border-2 border-ink bg-posterYellow p-4 shadow-poster">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm font-black">
          Discipline
          <select
            value={selectedDiscipline}
            onChange={(event) => onDisciplineChange(event.target.value as "All" | Discipline)}
            className="min-h-11 w-full rounded-xl border-2 border-ink bg-white px-3 py-3 font-bold focus:outline-none focus:ring-4 focus:ring-white"
          >
            <option value="All">All disciplines</option>
            {disciplines.map((discipline) => (
              <option key={discipline} value={discipline}>
                {discipline}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-black">
          From
          <input
            type="date"
            value={startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
            className="min-h-11 w-full rounded-xl border-2 border-ink bg-white px-3 py-3 font-bold focus:outline-none focus:ring-4 focus:ring-white"
          />
        </label>
        <label className="space-y-2 text-sm font-black">
          Until
          <input
            type="date"
            value={endDate}
            onChange={(event) => onEndDateChange(event.target.value)}
            className="min-h-11 w-full rounded-xl border-2 border-ink bg-white px-3 py-3 font-bold focus:outline-none focus:ring-4 focus:ring-white"
          />
        </label>
      </div>
    </section>
  );
}
