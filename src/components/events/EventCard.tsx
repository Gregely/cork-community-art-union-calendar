import { KeyboardEvent, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { CalendarEvent } from "../../types/event";
import { getEventDisciplines } from "../../types/event";
import { getVenueMapLinks } from "../../lib/venueQueries";
import { formatTimeRange } from "../../utils/date";
import { DisciplineBadge } from "./DisciplineBadge";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const CACAO = "#6b3d2a";

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

  const [year, mon, day] = event.event_date.split("-").map(Number);
  const dateObj = new Date(year, mon - 1, day);
  const DOW = DAYS_SHORT[dateObj.getDay()].toUpperCase();
  const DAY = dateObj.getDate();
  const MON = MONTHS_SHORT[dateObj.getMonth()].toUpperCase();

  function openEventDetail() {
    navigate(detailPath);
  }

  function handleCardKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openEventDetail();
    }
  }

  function stopCardNavigation(e: MouseEvent<HTMLAnchorElement>) {
    e.stopPropagation();
  }

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Open event details for ${event.title}`}
      onClick={openEventDetail}
      onKeyDown={handleCardKeyDown}
      className="group w-full cursor-pointer border-2 border-ink bg-creamLight shadow-paste transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-poster focus:outline-none focus:ring-4 focus:ring-posterYellow active:translate-y-0.5 active:shadow-none"
    >
      <div className="flex gap-4 p-4 sm:gap-5 sm:p-5">
        {/* Date stamp — double-border box matching prototype style */}
        <div
          className="flex w-16 flex-shrink-0 flex-col items-center justify-start gap-0.5 border-2 py-2 text-center sm:w-[72px]"
          style={{
            color: CACAO,
            borderColor: CACAO,
            boxShadow: `0 0 0 3px #fef7e6, 0 0 0 4.5px ${CACAO}`,
          }}
        >
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em]">{DOW}</span>
          <span className="font-display font-black leading-none text-ink" style={{ fontSize: 36 }}>
            {DAY}
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em]">{MON}</span>
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            {eventDisciplines.map((d) => (
              <DisciplineBadge key={d} discipline={d} />
            ))}
          </div>

          <h3 className="mt-2.5 font-display text-xl font-black leading-tight text-ink group-hover:underline group-focus:underline sm:text-2xl">
            {event.title}
          </h3>

          <div className="mt-2.5 space-y-1.5 font-mono text-[13px] text-cacaoMid">
            <div className="flex min-w-0 gap-2">
              <span className="w-10 flex-shrink-0 pt-px font-bold text-[10px] uppercase tracking-[0.15em] text-cacao">
                When
              </span>
              <span>{formatTimeRange(event.start_time, event.end_time)}</span>
            </div>
            <div className="flex min-w-0 gap-2">
              <span className="w-10 flex-shrink-0 pt-px font-bold text-[10px] uppercase tracking-[0.15em] text-cacao">
                Where
              </span>
              <span className="min-w-0 truncate">{event.venue}</span>
            </div>
            {!compact ? (
              <div className="flex min-w-0 gap-2">
                <span className="w-10 flex-shrink-0 pt-px font-bold text-[10px] uppercase tracking-[0.15em] text-cacao">
                  Who
                </span>
                <span className="min-w-0 truncate">{event.organiser}</span>
              </div>
            ) : null}
          </div>

          {!compact && event.description ? (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-cacaoMid">{event.description}</p>
          ) : null}

          <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-cacao pt-3">
            <a
              href={mapLinks.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              onClick={stopCardNavigation}
              onKeyDown={(e) => e.stopPropagation()}
              className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-cacao underline-offset-2 hover:text-corkRed hover:underline focus:outline-none"
            >
              Maps ↗
            </a>
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-corkRed">
              Details →
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
