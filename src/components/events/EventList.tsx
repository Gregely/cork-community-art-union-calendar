import type { CalendarEvent } from "../../types/event";
import { EmptyState } from "../shared/EmptyState";
import { EventCard } from "./EventCard";

type EventListProps = {
  events: CalendarEvent[];
};

export function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="No events on the board yet"
        message="Try changing the filters, or check back when more Cork arts listings have been approved."
      />
    );
  }

  return (
    <div className="space-y-5">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
