import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DisciplineBadge } from "../components/events/DisciplineBadge";
import { EventShareButton } from "../components/events/EventShareButton";
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
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <LoadingState message="Loading this event..." />
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <ErrorState message={errorMessage} />
      </main>
    );
  }

  if (!event) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <EmptyState
          title="This event is not on the public board"
          message="It may still be pending review, or the link may be out of date."
        />
      </main>
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
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Back link */}
      <div className="mb-6">
        <Link
          to="/events"
          className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-cacao underline underline-offset-2 hover:text-corkRed"
        >
          ← All listings
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* Poster card */}
        <article className="border-2 border-ink bg-creamLight p-5 shadow-poster sm:p-8 lg:p-10">
          {/* Discipline stamps */}
          <div className="flex flex-wrap gap-3">
            {eventDisciplines.map((d) => (
              <DisciplineBadge key={d} discipline={d} />
            ))}
          </div>

          {/* Title */}
          <h1
            className="mt-4 font-display font-black leading-[0.95] tracking-[-0.025em] text-ink"
            style={{ fontSize: "clamp(36px, 5vw, 68px)" }}
          >
            {event.title}
          </h1>

          {/* Metaband */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-b-2 border-t-2 border-ink py-5 sm:grid-cols-4">
            <Metablock label="Date" value={formatDate(event.event_date)} />
            <Metablock label="Time" value={formatTimeRange(event.start_time, event.end_time)} />
            <Metablock label="Venue" value={event.venue} />
            <Metablock label="Organiser" value={event.organiser} />
          </div>

          {/* Description */}
          {event.description ? (
            <p className="mt-6 text-base leading-relaxed text-cacaoMid sm:text-lg sm:leading-8">
              {event.description}
            </p>
          ) : null}

          {/* Entry fee */}
          <div className="mt-6 border-t border-dashed border-cacao pt-5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-corkRed">
              Entry
            </p>
            <p className="mt-2 font-mono font-bold text-ink">
              {event.entry_fee ?? "Entry details not listed"}
            </p>
          </div>

          {/* Links & booking */}
          {event.link_or_ticket_info ? (
            <div className="mt-5 border-t border-dashed border-cacao pt-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-corkRed">
                Links &amp; booking
              </p>
              <p className="mt-2 font-mono font-bold text-ink">{event.link_or_ticket_info}</p>
            </div>
          ) : null}

          {/* Maps */}
          <div className="mt-5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-corkRed">
              Maps
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {mapLinks.isManualOnly ? (
                <a
                  href={mapLinks.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="button-primary"
                >
                  Open in Maps
                </a>
              ) : (
                <>
                  <a
                    href={mapLinks.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="button-primary"
                  >
                    {hasSavedMaps ? "Google Maps" : "Open in Google Maps"}
                  </a>
                  {mapLinks.appleMapsUrl ? (
                    <a
                      href={mapLinks.appleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="button-primary"
                    >
                      {hasSavedMaps ? "Apple Maps" : "Open in Apple Maps"}
                    </a>
                  ) : null}
                </>
              )}
            </div>
          </div>

          {/* Share */}
          <div className="mt-5 border-t border-dashed border-cacao pt-5">
            <EventShareButton event={event} />
          </div>

          {/* Poster foot */}
          <div className="mt-8 flex justify-between border-t border-dashed border-cacao pt-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cacao/80">
              Cork Culture Board
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cacao/80">
              By C&#x2019;CAO
            </span>
          </div>
        </article>

        {/* Sidebar */}
        <aside
          className="h-fit border-2 border-ink bg-posterYellow p-5 shadow-paste"
          style={{ transform: "rotate(-0.8deg)" }}
        >
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-corkRed">
            Got an event?
          </p>
          <h2 className="mt-2 font-display text-2xl font-black text-ink">Pin it up</h2>
          <p className="mt-3 text-sm leading-relaxed text-cacaoMid">
            Add it to the queue. Submissions stay pending until a moderator reviews them.
          </p>
          <Link className="button-primary mt-5 bg-ink text-creamLight" to="/submit">
            Submit an event
          </Link>
        </aside>
      </div>
    </main>
  );
}

function Metablock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-corkRed">
        {label}
      </dt>
      <dd className="mt-1 font-display text-lg font-black leading-tight text-ink">{value}</dd>
    </div>
  );
}
