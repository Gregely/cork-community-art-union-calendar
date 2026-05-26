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

const disciplineActiveColors: Record<string, string> = {
  Exhibition: "bg-pinkPunch text-white border-pinkPunch",
  Music: "bg-leeBlue text-white border-leeBlue",
  Theatre: "bg-corkRed text-white border-corkRed",
  Film: "bg-ink text-paper border-ink",
  Dance: "bg-grass text-white border-grass",
  Poetry: "bg-purple-600 text-white border-purple-600",
  Workshop: "bg-posterYellow text-ink border-posterYellow",
  Talk: "bg-orange-500 text-white border-orange-500",
  Community: "bg-teal-500 text-white border-teal-500",
  Multidisciplinary: "bg-lime-400 text-ink border-lime-400",
};

function getTodayLocalDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
      {/* Hero */}
      <section className="border-b-2 border-ink bg-paper">
        <div className="mx-auto grid max-w-6xl gap-8 px-3 py-9 min-[360px]:px-4 sm:px-6 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-16">
          <div className="min-w-0">
            <p className="mb-4 w-fit max-w-full rotate-[-1deg] rounded-full border-2 border-ink bg-posterYellow px-3 py-2 text-xs font-black uppercase min-[360px]:px-4 min-[360px]:text-sm">
              By Cork Community Arts Union
            </p>
            <h1 className="font-display text-4xl font-black leading-none min-[360px]:text-5xl sm:text-7xl">
              Cork Culture Board
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-stone-700 sm:text-lg sm:leading-8">
              A shared listings board for Cork's creative and cultural events.
            </p>
            <p className="mt-3 max-w-2xl text-base leading-7 text-stone-700 sm:text-lg sm:leading-8">
              Find gigs, readings, exhibitions, workshops, theatre, film, open mics, and community
              happenings across the city.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="button-primary bg-corkRed text-white" to="/events">
                Browse events
              </Link>
              <Link className="button-primary bg-leeBlue text-white" to="/submit">
                Submit an event
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border-2 border-ink bg-white p-4 shadow-poster sm:p-5">
            <div className="grid grid-cols-2 gap-3">
              {["Print", "Poetry", "Film", "Music", "Talks", "DIY"].map((word, index) => (
                <div
                  key={word}
                  className={`rounded-2xl border-2 border-ink p-3 text-center font-display text-xl font-black min-[360px]:text-2xl sm:p-4 ${
                    [
                      "bg-posterYellow",
                      "bg-pinkPunch text-white",
                      "bg-grass text-white",
                      "bg-leeBlue text-white",
                      "bg-corkRed text-white",
                      "bg-paper",
                    ][index]
                  }`}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Coming up */}
      <section className="mx-auto max-w-6xl px-3 py-10 min-[360px]:px-4 sm:px-6">
        {/* Header row */}
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase text-corkRed">What's on</p>
            <h2 className="font-display text-3xl font-black">Coming up</h2>
            <p className="mt-1 text-sm text-stone-600">The next events in Cork's arts calendar.</p>
          </div>
          <Link
            to={advancedSearchUrl}
            className="inline-flex min-h-11 items-center whitespace-nowrap text-sm font-black underline sm:block sm:min-h-0"
          >
            Advanced search
          </Link>
        </div>

        {/* Discipline filter chips */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {disciplines.map((d) => (
            <FilterChip
              key={d}
              label={d}
              active={selectedDisciplines.includes(d)}
              onClick={() => toggleDiscipline(d)}
              activeClassName={disciplineActiveColors[d] ?? "bg-ink text-paper border-ink"}
            />
          ))}
          {hasFilters ? (
            <button
              type="button"
              onClick={() => setSelectedDisciplines([])}
              className="inline-flex min-h-10 items-center rounded-full border-2 border-ink bg-ink px-4 py-2 text-sm font-black text-paper hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-posterYellow"
            >
              Clear
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
          <div className="space-y-5">
            {visibleEvents.map((event) => (
              <EventCard key={event.id} event={event} compact />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
