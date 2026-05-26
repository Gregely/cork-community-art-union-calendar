import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { DatePreset } from "../components/events/EventFilters";
import { EventFilters } from "../components/events/EventFilters";
import { EventList } from "../components/events/EventList";
import { PageShell } from "../components/layout/PageShell";
import { ErrorState } from "../components/shared/ErrorState";
import { LoadingState } from "../components/shared/LoadingState";
import { getAllApprovedEvents } from "../lib/eventQueries";
import { getOrganisers } from "../lib/organiserQueries";
import { getVenues } from "../lib/venueQueries";
import type { Event, Organiser, Venue } from "../types/event";
import { getEventDisciplines } from "../types/event";

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayLocalDate(): string {
  return formatLocalDate(new Date());
}

function getEndOfWeek(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const end = new Date(today);
  end.setDate(today.getDate() + daysUntilSunday);
  return formatLocalDate(end);
}

function getEndOfMonth(): string {
  const today = new Date();
  return formatLocalDate(new Date(today.getFullYear(), today.getMonth() + 1, 0));
}

function parseMulti(value: string | null): string[] {
  return (value ?? "").split(",").filter(Boolean);
}

export function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedDisciplines = parseMulti(searchParams.get("disciplines"));
  const selectedVenueIds = parseMulti(searchParams.get("venue_ids"));
  const selectedOrganiserIds = parseMulti(searchParams.get("organiser_ids"));
  const search = searchParams.get("search") ?? "";
  const datePreset = (searchParams.get("date") as DatePreset) ?? "upcoming";
  const customFrom = searchParams.get("from") ?? "";
  const customTo = searchParams.get("to") ?? "";
  const includePast = searchParams.get("past") === "1";

  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [organisers, setOrganisers] = useState<Organiser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadData() {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const [events, venueList, organiserList] = await Promise.all([
          getAllApprovedEvents(),
          getVenues(),
          getOrganisers(),
        ]);
        if (isCurrent) {
          setAllEvents(events);
          setVenues(venueList);
          setOrganisers(organiserList);
        }
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load events.");
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadData();
    return () => {
      isCurrent = false;
    };
  }, []);

  const venueMap = useMemo(
    () => new Map(venues.map((v) => [v.id, v])),
    [venues],
  );
  const organiserMap = useMemo(
    () => new Map(organisers.map((o) => [o.id, o])),
    [organisers],
  );

  const filteredEvents = useMemo(() => {
    const today = getTodayLocalDate();
    const endOfWeek = getEndOfWeek();
    const endOfMonth = getEndOfMonth();

    return allEvents.filter((event) => {
      if (event.status !== "approved") return false;

      // Date range
      if (datePreset === "custom") {
        if (customFrom && event.event_date < customFrom) return false;
        if (customTo && event.event_date > customTo) return false;
      } else {
        if (!includePast && event.event_date < today) return false;
        if (datePreset === "today" && event.event_date !== today) return false;
        if (datePreset === "this-week" && event.event_date > endOfWeek) return false;
        if (datePreset === "this-month" && event.event_date > endOfMonth) return false;
      }

      // Disciplines — OR within selection, checked against the disciplines array with legacy fallback
      if (selectedDisciplines.length > 0) {
        const eventDisciplines = getEventDisciplines(event);
        if (!eventDisciplines.some((d) => selectedDisciplines.includes(d))) return false;
      }

      // Venues — OR within selection, match by FK or by name
      if (selectedVenueIds.length > 0) {
        const matchesAnyVenue = selectedVenueIds.some((vid) => {
          if (event.venue_id === vid) return true;
          const v = venueMap.get(vid);
          return v ? event.venue.toLowerCase() === v.name.toLowerCase() : false;
        });
        if (!matchesAnyVenue) return false;
      }

      // Organisers — OR within selection, match by FK or by name
      if (selectedOrganiserIds.length > 0) {
        const matchesAnyOrganiser = selectedOrganiserIds.some((oid) => {
          if (event.organiser_id === oid) return true;
          const o = organiserMap.get(oid);
          return o ? event.organiser.toLowerCase() === o.name.toLowerCase() : false;
        });
        if (!matchesAnyOrganiser) return false;
      }

      // Full-text search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const hit =
          event.title.toLowerCase().includes(q) ||
          event.venue.toLowerCase().includes(q) ||
          event.organiser.toLowerCase().includes(q) ||
          (event.description?.toLowerCase().includes(q) ?? false);
        if (!hit) return false;
      }

      return true;
    });
  }, [
    allEvents,
    selectedDisciplines,
    selectedVenueIds,
    selectedOrganiserIds,
    search,
    datePreset,
    customFrom,
    customTo,
    includePast,
    venueMap,
    organiserMap,
  ]);

  function updateFilter(key: string, value: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
        return next;
      },
      { replace: true },
    );
  }

  function updateMultiFilter(key: string, values: string[]) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (values.length > 0) {
          next.set(key, values.map(encodeURIComponent).join(","));
        } else {
          next.delete(key);
        }
        return next;
      },
      { replace: true },
    );
  }

  function clearAllFilters() {
    setSearchParams({}, { replace: true });
  }

  return (
    <PageShell
      eyebrow="Events"
      title="What's on in Cork"
      intro="Cork city arts and culture — exhibitions, gigs, workshops, screenings, readings, talks, and more."
    >
      <div className="space-y-8">
        <EventFilters
          selectedDisciplines={selectedDisciplines}
          selectedVenueIds={selectedVenueIds}
          selectedOrganiserIds={selectedOrganiserIds}
          search={search}
          datePreset={datePreset}
          customFrom={customFrom}
          customTo={customTo}
          includePast={includePast}
          venues={venues}
          organisers={organisers}
          onDisciplinesChange={(vals) => updateMultiFilter("disciplines", vals)}
          onVenueIdsChange={(vals) => updateMultiFilter("venue_ids", vals)}
          onOrganiserIdsChange={(vals) => updateMultiFilter("organiser_ids", vals)}
          onSearchChange={(val) => updateFilter("search", val)}
          onDatePresetChange={(val) =>
            updateFilter("date", val === "upcoming" ? "" : val)
          }
          onCustomFromChange={(val) => updateFilter("from", val)}
          onCustomToChange={(val) => updateFilter("to", val)}
          onIncludePastChange={(val) => updateFilter("past", val ? "1" : "")}
          onClearAll={clearAllFilters}
        />
        {isLoading ? <LoadingState /> : null}
        {!isLoading && errorMessage ? <ErrorState message={errorMessage} /> : null}
        {!isLoading && !errorMessage ? (
          <EventList
            events={filteredEvents}
            emptyTitle="No events match those filters"
            emptyMessage="Try adjusting the discipline, venue, date, or search term — or clear all filters to see everything."
          />
        ) : null}
      </div>
    </PageShell>
  );
}
