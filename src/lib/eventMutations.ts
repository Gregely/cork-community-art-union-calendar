import { getSupabaseClient } from "./supabaseClient";
import type { EventInsert } from "../types/event";

export async function submitEvent(input: EventInsert): Promise<void> {
  const payload = {
    title: input.title,
    event_date: input.event_date,
    start_time: input.start_time,
    end_time: input.end_time ?? null,
    venue: input.venue,
    venue_id: input.venue_id ?? null,
    organiser_id: input.organiser_id ?? null,
    organiser: input.organiser,
    discipline: input.discipline,
    description: input.description ?? null,
    link_or_ticket_info: input.link_or_ticket_info,
    image_url: input.image_url ?? null,
    submitter_name: input.submitter_name ?? null,
    submitter_email: input.submitter_email ?? null,
    status: "pending",
  };

  const { error } = await getSupabaseClient()
    .from("events")
    .insert(payload);

  if (error) {
    throw new Error(`Could not submit your event for review: ${error.message}`);
  }
}
