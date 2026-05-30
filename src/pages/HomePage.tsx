import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EventCard } from "../components/events/EventCard";
import { FilterChip } from "../components/events/FilterChip";
import { EmptyState } from "../components/shared/EmptyState";
import { ErrorState } from "../components/shared/ErrorState";
import { LoadingState } from "../components/shared/LoadingState";
import { getAllApprovedEvents } from "../lib/eventQueries";
import { disciplines, getEventDisciplines } from "../types/event";
import type { Event } from "../types/event";

// Mirrors the DisciplineBadge risograph palette exactly.
const disciplineActiveColors: Record<string, string> = {
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

function getTodayLocalDate(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

const HERO_TILES = [
  { label: "Print",  bg: "bg-posterYellow", fg: "text-ink" },
  { label: "Poetry", bg: "bg-pinkPunch",    fg: "text-creamLight" },
  { label: "Film",   bg: "bg-ink",          fg: "text-cream" },
  { label: "Music",  bg: "bg-grass",        fg: "text-creamLight" },
  { label: "Talks",  bg: "bg-corkRed",      fg: "text-creamLight" },
  { label: "DIY",    bg: "bg-paper",        fg: "text-ink" },
];

export function HomePage() {
  const [allUpcomingEvents, setAllUpcomingEvents] = useState<Event[]>([]);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadEvents() {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const events = await getAllApprovedEvents();

        if (isCurrent) {
          const today = getTodayLocalDate();
          setAllUpcomingEvents(events.filter((e) => e.event_date >= today));
        }
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(
            error instanceof Error ? error.message : "Could not load upcoming events.",
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadEvents();

    return () => {
      isCurrent = false;
    };
  }, []);

  const visibleEvents = useMemo(() => {
    const filtered =
      selectedDisciplines.length === 0
        ? allUpcomingEvents
        : allUpcomingEvents.filter((e) =>
            getEventDisciplines(e).some((d) => selectedDisciplines.includes(d)),
          );
    return filtered.slice(0, 6);
  }, [allUpcomingEvents, selectedDisciplines]);

  function toggleDiscipline(d: string) {
    setSelectedDisciplines((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  }

  const hasFilters = selectedDisciplines.length > 0;

  const advancedSearchUrl =
    selectedDisciplines.length > 0
      ? `/events?disciplines=${selectedDisciplines.map(encodeURIComponent).join(",")}`
      : "/events";

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="border-b-2 border-ink">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-16">
          <div className="min-w-0">
            {/* Eyebrow stamp */}
            <div className="mb-5">
              <span
                className="inline-flex items-center border-2 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.08em]"
                style={{
                  color: "#b8421f",
                  borderColor: "#b8421f",
                  boxShadow: "0 0 0 2px #f1e4c8, 0 0 0 3.5px #b8421f",
                }}
              >
                On the board · {new Date().getFullYear()}
              </span>
            </div>

            {/* Title */}
            <h1
              className="font-display font-black leading-[0.92] tracking-[-0.025em] text-ink"
              style={{ fontSize: "clamp(52px, 8vw, 104px)" }}
            >
              <span className="block">Cork Culture</span>
              <span className="block translate-x-4 font-display italic text-corkRed sm:translate-x-7">
                Board
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-[1.75] text-cacaoMid sm:text-lg">
              A shared listings board for Cork's creative and cultural events. Gigs, readings,
              exhibitions, workshops, theatre, film, open mics, and community happenings.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link className="button-primary bg-corkRed text-creamLight" to="/events">
                Browse listings
              </Link>
              <Link className="button-primary" to="/submit">
                Pin up an event
              </Link>
            </div>

            <p className="mt-6 font-mono text-xs uppercase tracking-[0.1em] text-cacao">
              Brewed by <strong className="text-ink">C&#x2019;CAO</strong>
              <span className="ml-1.5 normal-case tracking-normal opacity-70">
                — said like cacao
              </span>
            </p>
          </div>

          {/* Hero board — noticeboard of discipline tiles */}
          <div
            className="border-2 border-ink bg-creamLight p-5 shadow-poster sm:p-6"
            style={{ transform: "rotate(1.5deg)" }}
            aria-hidden="true"
          >
            <div className="grid grid-cols-3 gap-3">
              {HERO_TILES.map(({ label, bg, fg }) => (
                <div
                  key={label}
                  className={`flex aspect-square items-center justify-center border-2 border-ink font-display text-2xl font-black sm:text-3xl ${bg} ${fg}`}
                >
                  {label}
                </div>
              ))}
            </div>
            <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-cacao opacity-70">
              cork community arts union
            </p>
          </div>
        </div>
      </section>

      {/* ── Coming up ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Section header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-corkRed">
              Fresh listings
            </p>
            <h2 className="font-display text-4xl font-black text-ink sm:text-5xl">Coming up</h2>
            <p className="mt-1 font-mono text-xs tracking-[0.06em] text-cacao">The next things going on in Cork's cultural scene.</p>
          </div>
          <Link
            to={advancedSearchUrl}
            className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-corkRed underline underline-offset-2 hover:text-ink sm:whitespace-nowrap"
          >
            See all listings →
          </Link>
        </div>

        {/* Discipline filter chips */}
        <div className="mb-7 flex flex-wrap items-center gap-2">
          {disciplines.map((d) => (
            <FilterChip
              key={d}
              label={d}
              active={selectedDisciplines.includes(d)}
              onClick={() => toggleDiscipline(d)}
              activeClassName={disciplineActiveColors[d] ?? "bg-ink text-creamLight border-ink"}
            />
          ))}
          {hasFilters ? (
            <button
              type="button"
              onClick={() => setSelectedDisciplines([])}
              className="font-mono text-[11px] uppercase tracking-[0.15em] text-cacao underline hover:text-corkRed"
            >
              Clear ·
            </button>
          ) : null}
        </div>

        {/* Event list */}
        {isLoading ? <LoadingState message="Loading events..." /> : null}
        {!isLoading && errorMessage ? <ErrorState message={errorMessage} /> : null}
        {!isLoading && !errorMessage && allUpcomingEvents.length === 0 ? (
          <EmptyState
            title="Nothing listed yet"
            message="Check back soon — events are added regularly. You can also submit your own."
          />
        ) : null}
        {!isLoading && !errorMessage && allUpcomingEvents.length > 0 && visibleEvents.length === 0 ? (
          <EmptyState
            title="No upcoming events match those filters"
            message="Try a different discipline, or clear the filters to see everything coming up."
          />
        ) : null}
        {!isLoading && !errorMessage && visibleEvents.length > 0 ? (
          <div className="space-y-4">
            {visibleEvents.map((event) => (
              <EventCard key={event.id} event={event} compact />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
