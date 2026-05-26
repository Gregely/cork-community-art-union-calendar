import { useEffect, useMemo, useState } from "react";
import { EventFilters } from "../components/events/EventFilters";
import { EventList } from "../components/events/EventList";
import { PageShell } from "../components/layout/PageShell";
import { ErrorState } from "../components/shared/ErrorState";
import { LoadingState } from "../components/shared/LoadingState";
import { getApprovedEvents } from "../lib/eventQueries";
import type { Discipline, Event } from "../types/event";

export function EventsPage() {
  const [approvedEvents, setApprovedEvents] = useState<Event[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<"All" | Discipline>("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadEvents() {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const events = await getApprovedEvents();

        if (isCurrent) {
          setApprovedEvents(events);
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

    void loadEvents();

    return () => {
      isCurrent = false;
    };
  }, []);

  const events = useMemo(() => {
    return approvedEvents.filter((event) => {
      if (event.status !== "approved") return false;
      if (selectedDiscipline !== "All" && event.discipline !== selectedDiscipline) return false;
      if (startDate && event.event_date < startDate) return false;
      if (endDate && event.event_date > endDate) return false;
      return true;
    });
  }, [approvedEvents, selectedDiscipline, startDate, endDate]);

  return (
    <PageShell
      eyebrow="Public listings"
      title="Events"
      intro="Browse approved Cork city art and culture events. Keep it simple: date, place, organiser, and what is happening."
    >
      <div className="space-y-8">
        <EventFilters
          selectedDiscipline={selectedDiscipline}
          startDate={startDate}
          endDate={endDate}
          onDisciplineChange={setSelectedDiscipline}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
        {isLoading ? <LoadingState /> : null}
        {!isLoading && errorMessage ? <ErrorState message={errorMessage} /> : null}
        {!isLoading && !errorMessage ? <EventList events={events} /> : null}
      </div>
    </PageShell>
  );
}
