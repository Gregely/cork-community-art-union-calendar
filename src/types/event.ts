export type EventStatus = "pending" | "approved" | "rejected";

export type Discipline =
  | "Exhibition"
  | "Music"
  | "Theatre"
  | "Film"
  | "Dance"
  | "Poetry"
  | "Workshop"
  | "Talk"
  | "Community";

export type Event = {
  id: string;
  title: string;
  event_date: string;
  start_time: string;
  end_time: string | null;
  venue_id: string | null;
  venue: string;
  organiser_id: string | null;
  organiser: string;
  discipline: string;
  disciplines: string[];
  description: string | null;
  link_or_ticket_info: string;
  image_url: string | null;
  manual_maps_url: string | null;
  status: EventStatus;
  submitter_name: string | null;
  submitter_email: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  approved_by: string | null;
  venue_record?: Venue | null;
  organiser_record?: Organiser | null;
};

export type EventInsert = {
  id?: string;
  title: string;
  event_date: string;
  start_time: string;
  end_time?: string | null;
  venue_id?: string | null;
  venue: string;
  organiser_id?: string | null;
  organiser: string;
  discipline: string;
  disciplines?: string[];
  description?: string | null;
  link_or_ticket_info: string;
  image_url?: string | null;
  manual_maps_url?: string | null;
  status?: EventStatus;
  submitter_name?: string | null;
  submitter_email?: string | null;
  admin_notes?: string | null;
  created_at?: string;
  updated_at?: string;
  approved_at?: string | null;
  approved_by?: string | null;
};

export type EventUpdate = Partial<EventInsert>;

export type CalendarEvent = Event;

export type Venue = {
  id: string;
  name: string;
  address: string | null;
  google_maps_url: string | null;
  apple_maps_url: string | null;
  created_at: string;
  updated_at: string;
};

export type VenueInsert = {
  id?: string;
  name: string;
  address?: string | null;
  google_maps_url?: string | null;
  apple_maps_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type VenueUpdate = Partial<VenueInsert>;

export type Organiser = {
  id: string;
  name: string;
  email: string | null;
  website: string | null;
  instagram: string | null;
  created_at: string;
  updated_at: string;
};

export type OrganiserInsert = {
  id?: string;
  name: string;
  email?: string | null;
  website?: string | null;
  instagram?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type OrganiserUpdate = Partial<OrganiserInsert>;

export const disciplines: Discipline[] = [
  "Exhibition",
  "Music",
  "Theatre",
  "Film",
  "Dance",
  "Poetry",
  "Workshop",
  "Talk",
  "Community",
];

/** Returns the disciplines array for an event, falling back to [discipline] for older rows. */
export function getEventDisciplines(event: Pick<Event, "disciplines" | "discipline">): string[] {
  if (event.disciplines && event.disciplines.length > 0) return event.disciplines;
  if (event.discipline) return [event.discipline];
  return [];
}
