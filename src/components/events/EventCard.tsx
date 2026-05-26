import { KeyboardEvent, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { CalendarEvent } from "../../types/event";
import { getEventDisciplines } from "../../types/event";
import { getVenueMapLinks } from "../../lib/venueQueries";
import { formatDate, formatTimeRange } from "../../utils/date";
import { DisciplineBadge } from "./DisciplineBadge";

type EventCardProps = {
  event: CalendarEvent;
  compact?: boolean;
};

export function EventCard({ event, compact = false }: EventCardProps) {
  const navigate = useNavigate();
  const mapLinks = getVenueMapLinks({
    venueName: event.venue,
    venueAddress: event.venue_record?.address,
    googleMapsUrl: event.venue_record?.google_maps_url,
    appleMapsUrl: event.venue_record?.apple_maps_url,
    manualMapsUrl: event.manual_maps_url,
  });
  const detailPath = `/events/${event.id}`;
  const eventDisciplines = getEventDisciplines(event);

  function openEventDetail() {
    navigate(detailPath);
  }

  function handleCardKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openEventDetail();
    }
  }

  function stopCardNavigation(event: MouseEvent<HTMLAnchorElement>) {
    event.stopPropagation();
  }

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Open event details for ${event.title}`}
      onClick={openEventDetail}
      onKeyDown={handleCardKeyDown}
      className="group w-full cursor-pointer rounded-2xl border-2 border-ink bg-white p-4 shadow-poster transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-posterYellow active:translate-y-0.5 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {eventDisciplines.map((d) => (
              <DisciplineBadge key={d} discipline={d} />
            ))}
          </div>
          <div>
            <h3 className="font-display text-xl font-black leading-tight text-ink group-hover:underline group-focus:underline min-[360px]:text-2xl">
              {event.title}
            </h3>
            <p className="mt-2 text-sm font-bold text-leeBlue">
              {formatDate(event.event_date)} at {formatTimeRange(event.start_time, event.end_time)}
            </p>
          </div>
          {!compact && event.description ? (
            <p className="max-w-2xl text-sm leading-6 text-stone-700">{event.description}</p>
          ) : null}
        </div>
        <div className="w-full rounded-xl border-2 border-dashed border-ink bg-paper px-4 py-3 text-sm sm:w-auto sm:min-w-56 sm:max-w-72">
          <p className="font-black">{event.venue}</p>
          <p className="mt-1 text-stone-700">{event.organiser}</p>
          <a
            href={mapLinks.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            onClick={stopCardNavigation}
            onKeyDown={(event) => event.stopPropagation()}
            className="mt-3 inline-flex min-h-11 items-center rounded-full border-2 border-ink bg-white px-4 py-2 text-xs font-black hover:bg-posterYellow focus:outline-none focus:ring-4 focus:ring-posterYellow"
          >
            Open in Maps
          </a>
        </div>
      </div>
    </article>
  );
}
