import { getCurrentUser } from "./auth";
import { getSupabaseClient } from "./supabaseClient";
import type { Event, EventUpdate } from "../types/event";

export async function getPendingEvents(): Promise<Event[]> {
  const { data, error } = await getSupabaseClient()
    .from("events")
    .select("*, venue_record:venues(*), organiser_record:organisers(*)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Could not load pending submissions: ${error.message}`);
  }

  return (data ?? []) as Event[];
}

export async function approveEvent(eventId: string): Promise<Event> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("You need to be logged in as an admin to approve events.");
  }

  const { data, error } = await getSupabaseClient()
    .from("events")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: currentUser.id,
    })
    .eq("id", eventId)
    .eq("status", "pending")
    .select("*, venue_record:venues(*), organiser_record:organisers(*)")
    .single();

  if (error) {
    throw new Error(`Could not approve this event: ${error.message}`);
  }

  return data as Event;
}

export async function updatePendingEvent(eventId: string, input: EventUpdate): Promise<Event> {
  const {
    title,
    event_date,
    start_time,
    end_time,
    venue_id,
    venue,
    organiser_id,
    organiser,
    discipline,
    disciplines,
    description,
    link_or_ticket_info,
    image_url,
    manual_maps_url,
    submitter_name,
    submitter_email,
    admin_notes,
  } = input;

  const { data, error } = await getSupabaseClient()
    .from("events")
    .update({
      title,
      event_date,
      start_time,
      end_time,
      venue_id,
      venue,
      organiser_id,
      organiser,
      discipline,
      disciplines,
      description,
      link_or_ticket_info,
      image_url,
      manual_maps_url,
      submitter_name,
      submitter_email,
      admin_notes,
    })
    .eq("id", eventId)
    .eq("status", "pending")
    .select("*, venue_record:venues(*), organiser_record:organisers(*)")
    .single();

  if (error) {
    throw new Error(`Could not save changes to this event: ${error.message}`);
  }

  return data as Event;
}

export async function getApprovedEventsForAdmin(): Promise<Event[]> {
  const { data, error } = await getSupabaseClient()
    .from("events")
    .select("*, venue_record:venues(*), organiser_record:organisers(*)")
    .eq("status", "approved")
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(`Could not load approved events: ${error.message}`);
  }

  return (data ?? []) as Event[];
}

export async function unpublishEvent(eventId: string): Promise<Event> {
  const { data, error } = await getSupabaseClient()
    .from("events")
    .update({
      status: "rejected",
      approved_at: null,
      approved_by: null,
    })
    .eq("id", eventId)
    .eq("status", "approved")
    .select("*, venue_record:venues(*), organiser_record:organisers(*)")
    .single();

  if (error) {
    throw new Error(`Could not unpublish this event: ${error.message}`);
  }

  return data as Event;
}

export async function deleteEvent(eventId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from("events")
    .delete()
    .eq("id", eventId);

  if (error) {
    throw new Error(`Could not delete this event: ${error.message}`);
  }
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

  if (error) {
    throw new Error(`Could not reject this event: ${error.message}`);
  }

  return data as Event;
}
