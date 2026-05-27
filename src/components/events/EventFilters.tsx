import { FilterChip } from "./FilterChip";
import { MultiSelectAutocomplete } from "./MultiSelectAutocomplete";
import type { Organiser, Venue } from "../../types/event";
import { disciplines } from "../../types/event";

export type DatePreset = "upcoming" | "today" | "this-week" | "this-month" | "custom";

// Matches DisciplineBadge ink palette — one distinct earthy hue per discipline.
const disciplineActiveColors: Record<string, string> = {
  Exhibition:        "bg-[#c0513a] text-creamLight border-[#c0513a]",
  Music:             "bg-[#4a6b28] text-creamLight border-[#4a6b28]",
  Theatre:           "bg-corkRed   text-creamLight border-corkRed",
  Film:              "bg-[#243040] text-creamLight border-[#243040]",
  Dance:             "bg-[#8b4020] text-creamLight border-[#8b4020]",
  Poetry:            "bg-[#6b3a7a] text-creamLight border-[#6b3a7a]",
  Workshop:          "bg-[#b87a12] text-ink        border-[#b87a12]",
  Talk:              "bg-[#8b3218] text-creamLight border-[#8b3218]",
  Community:         "bg-[#2a6838] text-creamLight border-[#2a6838]",
  Multidisciplinary: "bg-[#4a4c20] text-creamLight border-[#4a4c20]",
};

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: "upcoming", label: "All upcoming" },
  { value: "today", label: "Today" },
  { value: "this-week", label: "This week" },
  { value: "this-month", label: "This month" },
  { value: "custom", label: "Custom dates" },
];

type EventFiltersProps = {
  selectedDisciplines: string[];
  selectedVenueIds: string[];
  selectedOrganiserIds: string[];
  search: string;
  datePreset: DatePreset;
  customFrom: string;
  customTo: string;
  includePast: boolean;
  venues: Venue[];
  organisers: Organiser[];
  onDisciplinesChange: (values: string[]) => void;
  onVenueIdsChange: (values: string[]) => void;
  onOrganiserIdsChange: (values: string[]) => void;
  onSearchChange: (value: string) => void;
  onDatePresetChange: (value: DatePreset) => void;
  onCustomFromChange: (value: string) => void;
  onCustomToChange: (value: string) => void;
  onIncludePastChange: (value: boolean) => void;
  onClearAll: () => void;
};

function toggle(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
}

export function EventFilters({
  selectedDisciplines,
  selectedVenueIds,
  selectedOrganiserIds,
  search,
  datePreset,
  customFrom,
  customTo,
  includePast,
  venues,
  organisers,
  onDisciplinesChange,
  onVenueIdsChange,
  onOrganiserIdsChange,
  onSearchChange,
  onDatePresetChange,
  onCustomFromChange,
  onCustomToChange,
  onIncludePastChange,
  onClearAll,
}: EventFiltersProps) {
  const hasActiveFilters =
    selectedDisciplines.length > 0 ||
    selectedVenueIds.length > 0 ||
    selectedOrganiserIds.length > 0 ||
    search !== "" ||
    datePreset !== "upcoming" ||
    includePast;

  const activeLabels = [
    ...selectedDisciplines,
    ...selectedVenueIds.map((id) => venues.find((v) => v.id === id)?.name ?? id),
    ...selectedOrganiserIds.map((id) => organisers.find((o) => o.id === id)?.name ?? id),
    search ? `"${search}"` : "",
    datePreset !== "upcoming" ? DATE_PRESETS.find((d) => d.value === datePreset)?.label ?? "" : "",
    includePast ? "Including past" : "",
  ].filter(Boolean);

  return (
    <div className="space-y-5 border-2 border-ink bg-posterYellow p-4 shadow-poster sm:p-5">
      {/* Search */}
      <label className="block space-y-2">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-ink">Search</span>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Title, venue, organiser..."
          className="form-input w-full"
        />
      </label>

      {/* Discipline chips */}
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-ink">Discipline</p>
          {selectedDisciplines.length > 0 ? (
            <button
              type="button"
              onClick={() => onDisciplinesChange([])}
              className="text-xs font-black underline"
            >
              Clear
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {disciplines.map((d) => (
            <FilterChip
              key={d}
              label={d}
              active={selectedDisciplines.includes(d)}
              onClick={() => onDisciplinesChange(toggle(selectedDisciplines, d))}
              activeClassName={disciplineActiveColors[d] ?? "bg-ink text-paper border-ink"}
            />
          ))}
        </div>
      </div>

      {/* Venue autocomplete */}
      <MultiSelectAutocomplete
        label="Venue"
        placeholder="Search venues..."
        options={venues}
        selectedIds={selectedVenueIds}
        onChange={onVenueIdsChange}
        emptyMessage="No matching venues"
      />

      {/* Organiser autocomplete */}
      <MultiSelectAutocomplete
        label="Organiser"
        placeholder="Search organisers..."
        options={organisers}
        selectedIds={selectedOrganiserIds}
        onChange={onOrganiserIdsChange}
        emptyMessage="No matching organisers"
      />

      {/* Date preset chips */}
      <div>
        <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-ink">When</p>
        <div className="flex flex-wrap gap-2">
          {DATE_PRESETS.map(({ value, label }) => (
            <FilterChip
              key={value}
              label={label}
              active={datePreset === value}
              onClick={() => onDatePresetChange(value)}
              activeClassName="bg-ink text-paper border-ink"
            />
          ))}
        </div>
        {datePreset === "custom" ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-black">
              From
              <input
                type="date"
                value={customFrom}
                onChange={(e) => onCustomFromChange(e.target.value)}
                className="form-input w-full"
              />
            </label>
            <label className="space-y-2 text-sm font-black">
              Until
              <input
                type="date"
                value={customTo}
                onChange={(e) => onCustomToChange(e.target.value)}
                className="form-input w-full"
              />
            </label>
          </div>
        ) : null}
      </div>

      {/* Include past */}
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={includePast}
          onChange={(e) => onIncludePastChange(e.target.checked)}
          className="h-5 w-5 accent-ink"
        />
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-ink">Include past events</span>
      </label>

      {/* Active filter summary + clear all */}
      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink pt-4">
          <p className="text-xs font-black uppercase leading-relaxed">
            Active: {activeLabels.join(" · ")}
          </p>
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex min-h-9 items-center border-2 border-ink bg-ink px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.1em] text-paper shadow-paste transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-poster focus:outline-none focus:ring-4 focus:ring-posterYellow"
          >
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}
