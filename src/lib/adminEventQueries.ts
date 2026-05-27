import { getCurrentUser } from "./auth";
import { getSupabaseClient } from "./supabaseClient";
import type { Event, EventUpdate } from "../types/event";

// ── Reads ──────────────────────────────────────────────────────────────────

export async function getPendingEvents(): Promise<Event[]> {
  const { data, error } = await getSupabaseClient()
    .from("events")
    .select("*, venue_record:venues(*), organiser_record:organisers(*)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Could not load pending submissions: ${error.message}`);
  return (data ?? []) as Event[];
}

export async function getApprovedEventsForAdmin(): Promise<Event[]> {
  const { data, error } = await getSupabaseClient()
    .from("events")
    .select("*, venue_record:venues(*), organiser_record:organisers(*)")
    .eq("status", "approved")
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw new Error(`Could not load approved events: ${error.message}`);
  return (data ?? []) as Event[];
}

export async function getUnpublishedEvents(): Promise<Event[]> {
  const { data, error } = await getSupabaseClient()
    .from("events")
    .select("*, venue_record:venues(*), organiser_record:organisers(*)")
    .eq("status", "unpublished")
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw new Error(`Could not load unpublished events: ${error.message}`);
  return (data ?? []) as Event[];
}

export async function getRejectedEvents(): Promise<Event[]> {
  const { data, error } = await getSupabaseClient()
    .from("events")
    .select("*, venue_record:venues(*), organiser_record:organisers(*)")
    .eq("status", "rejected")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Could not load rejected events: ${error.message}`);
  return (data ?? []) as Event[];
}

// ── Status transitions ─────────────────────────────────────────────────────

export async function approveEvent(eventId: string): Promise<Event> {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("You need to be logged in as an admin to approve events.");

  const { data, error } = await getSupabaseClient()
    .from("events")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: currentUser.id,
    })
    .eq("id", eventId)
    .in("status", ["pending", "unpublished"])
    .select("*, venue_record:venues(*), organiser_record:organisers(*)")
    .single();

  if (error) throw new Error(`Could not approve this event: ${error.message}`);
  return data as Event;
}

export async function rejectEvent(eventId: string): Promise<Event> {
  const { data, error } = await getSupabaseClient()
    .from("events")
    .update({
      status: "rejected",
      approved_at: null,
      approved_by: null,
    })
    .eq("id", eventId)
    .eq("status", "pending")
    .select("*, venue_record:venues(*), organiser_record:organisers(*)")
    .single();

  if (error) throw new Error(`Could not reject this event: ${error.message}`);
  return data as Event;
}

export async function unpublishEvent(eventId: string): Promise<Event> {
  const { data, error } = await getSupabaseClient()
    .from("events")
    .update({
      status: "unpublished",
      approved_at: null,
      approved_by: null,
    })
    .eq("id", eventId)
    .eq("status", "approved")
    .select("*, venue_record:venues(*), organiser_record:organisers(*)")
    .single();

  if (error) throw new Error(`Could not unpublish this event: ${error.message}`);
  return data as Event;
}

/** Re-publish an unpublished event. Treated as a fresh approval. */
export async function republishEvent(eventId: string): Promise<Event> {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("You need to be logged in as an admin to publish events.");

  const { data, error } = await getSupabaseClient()
    .from("events")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: currentUser.id,
    })
    .eq("id", eventId)
    .eq("status", "unpublished")
    .select("*, venue_record:venues(*), organiser_record:organisers(*)")
    .single();

  if (error) throw new Error(`Could not re-publish this event: ${error.message}`);
  return data as Event;
}

/** Move a rejected event back to pending so it can be reviewed again. */
export async function restoreEventToPending(eventId: string): Promise<Event> {
  const { data, error } = await getSupabaseClient()
    .from("events")
    .update({
      status: "pending",
      approved_at: null,
      approved_by: null,
    })
    .eq("id", eventId)
    .eq("status", "rejected")
    .select("*, venue_record:venues(*), organiser_record:organisers(*)")
    .single();

  if (error) throw new Error(`Could not restore this event to pending: ${error.message}`);
  return data as Event;
}

// ── Edits ──────────────────────────────────────────────────────────────────

/** Edit a pending event (still in review). */
export async function updatePendingEvent(eventId: string, input: EventUpdate): Promise<Event> {
  const { data, error } = await getSupabaseClient()
    .from("events")
    .update(buildUpdatePayload(input))
    .eq("id", eventId)
    .eq("status", "pending")
    .select("*, venue_record:venues(*), organiser_record:organisers(*)")
    .single();

  if (error) throw new Error(`Could not save changes to this event: ${error.message}`);
  return data as Event;
}

/** Edit any event regardless of status — used from Published / Unpublished tabs. */
export async function updateEventForAdmin(eventId: string, input: EventUpdate): Promise<Event> {
  const { data, error } = await getSupabaseClient()
    .from("events")
    .update(buildUpdatePayload(input))
    .eq("id", eventId)
    .select("*, venue_record:venues(*), organiser_record:organisers(*)")
    .single();

  if (error) throw new Error(`Could not save changes to this event: ${error.message}`);
  return data as Event;
}

export async function deleteEvent(eventId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from("events")
    .delete()
    .eq("id", eventId);

  if (error) throw new Error(`Could not delete this event: ${error.message}`);
}

// ── Helpers ────────────────────────────────────────────────────────────────

function buildUpdatePayload(input: EventUpdate) {
  return {
    title: input.title,
    event_date: input.event_date,
    start_time: input.start_time,
    end_time: input.end_time,
    venue_id: input.venue_id,
    venue: input.venue,
    organiser_id: input.organiser_id,
    organiser: input.organiser,
    discipline: input.discipline,
    disciplines: input.disciplines,
    description: input.description,
    entry_fee: input.entry_fee,
    link_or_ticket_info: input.link_or_ticket_info,
    image_url: input.image_url,
    manual_maps_url: input.manual_maps_url,
    submitter_name: input.submitter_name,
    submitter_email: input.submitter_email,
    admin_notes: input.admin_notes,
  };
}
