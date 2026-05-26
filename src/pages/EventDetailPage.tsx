import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DisciplineBadge } from "../components/events/DisciplineBadge";
import { PageShell } from "../components/layout/PageShell";
import { EmptyState } from "../components/shared/EmptyState";
import { ErrorState } from "../components/shared/ErrorState";
import { LoadingState } from "../components/shared/LoadingState";
import { getApprovedEventById } from "../lib/eventQueries";
import { getVenueMapLinks } from "../lib/venueQueries";
import type { Event } from "../types/event";
import { getEventDisciplines } from "../types/event";
import { formatDate, formatTimeRange } from "../utils/date";

export function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadEvent() {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");
        const approvedEvent = await getApprovedEventById(id);

        if (isCurrent) {
          setEvent(approvedEvent);
        }
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load this event.");
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadEvent();

    return () => {
      isCurrent = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <PageShell title="Loading event">
        <LoadingState message="Loading this event..." />
      </PageShell>
    );
  }

  if (errorMessage) {
    return (
      <PageShell title="Event unavailable">
        <ErrorState message={errorMessage} />
      </PageShell>
    );
  }

  if (!event) {
    return (
      <PageShell title="Event not found">
        <EmptyState
          title="This event is not on the public board"
          message="It may still be pending review, or the link may be out of date."
        />
      </PageShell>
    );
  }

  const eventDisciplines = getEventDisciplines(event);
  const hasSavedMaps = !!(event.venue_record?.google_maps_url || event.venue_record?.apple_maps_url);
  const mapLinks = getVenueMapLinks({
    venueName: event.venue,
    venueAddress: event.venue_record?.address,
    googleMapsUrl: event.venue_record?.google_maps_url,
    appleMapsUrl: event.venue_record?.apple_maps_url,
    manualMapsUrl: event.manual_maps_url,
  });

  return (
    <PageShell eyebrow={eventDisciplines[0]} title={event.title}>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <article className="rounded-2xl border-2 border-ink bg-white p-4 shadow-poster sm:p-6">
          <div className="flex flex-wrap gap-1.5">
            {eventDisciplines.map((d) => (
              <DisciplineBadge key={d} discipline={d} />
            ))}
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <Detail label="Date" value={formatDate(event.event_date)} />
            <Detail label="Time" value={formatTimeRange(event.start_time, event.end_time)} />
            <Detail label="Venue" value={event.venue} />
            <Detail label="Organiser" value={event.organiser} />
          </dl>
          {event.description ? <p className="mt-8 text-base leading-7 text-stone-700 sm:text-lg sm:leading-8">{event.description}</p> : null}
          <div className="mt-8 rounded-2xl border-2 border-dashed border-ink bg-paper p-4">
            <p className="text-sm font-black uppercase text-corkRed">Link or ticket info</p>
            <p className="mt-2 font-bold">{event.link_or_ticket_info}</p>
          </div>
          <div className="mt-4 rounded-2xl border-2 border-dashed border-ink bg-paper p-4">
            <p className="text-sm font-black uppercase text-corkRed">Maps</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              {mapLinks.isManualOnly ? (
                <a
                  href={mapLinks.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-ink bg-white px-4 py-2 text-center text-sm font-black hover:bg-posterYellow focus:outline-none focus:ring-4 focus:ring-posterYellow"
                >
                  Open in Maps
                </a>
              ) : (
                <>
                  <a
                    href={mapLinks.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-ink bg-white px-4 py-2 text-center text-sm font-black hover:bg-posterYellow focus:outline-none focus:ring-4 focus:ring-posterYellow"
                  >
                    {hasSavedMaps ? "Google Maps" : "Open in Google Maps"}
                  </a>
                  {mapLinks.appleMapsUrl ? (
                    <a
                      href={mapLinks.appleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-ink bg-white px-4 py-2 text-center text-sm font-black hover:bg-posterYellow focus:outline-none focus:ring-4 focus:ring-posterYellow"
                    >
                      {hasSavedMaps ? "Apple Maps" : "Open in Apple Maps"}
                    </a>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </article>
        <aside className="h-fit rounded-2xl border-2 border-ink bg-posterYellow p-5 shadow-poster">
          <h2 className="font-display text-2xl font-black">Got an event?</h2>
          <p className="mt-3 text-sm leading-6">
            Add it to the queue. Submissions stay pending until a moderator reviews them.
          </p>
          <Link className="button-primary mt-5 bg-ink text-paper" to="/submit">
            Submit an event
          </Link>
        </aside>
      </div>
    </PageShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-black uppercase text-stone-500">{label}</dt>
      <dd className="mt-1 font-bold">{value}</dd>
    </div>
  );
}
