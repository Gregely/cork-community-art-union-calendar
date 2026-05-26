import { getSupabaseClient } from "./supabaseClient";
import type { Event } from "../types/event";

function getTodayLocalDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function raiseQueryError(action: string, message: string): never {
  throw new Error(`Could not ${action}: ${message}`);
}

export async function getApprovedEvents(): Promise<Event[]> {
  const { data, error } = await getSupabaseClient()
    .from("events")
    .select("*, venue_record:venues(*), organiser_record:organisers(*)")
    .eq("status", "approved")
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    raiseQueryError("load approved events", error.message);
  }

  return (data ?? []) as Event[];
}

export async function getUpcomingApprovedEvents(limit = 3): Promise<Event[]> {
  const { data, error } = await getSupabaseClient()
    .from("events")
    .select("*, venue_record:venues(*), organiser_record:organisers(*)")
    .eq("status", "approved")
    .gte("event_date", getTodayLocalDate())
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(limit);

  if (error) {
    raiseQueryError("load upcoming approved events", error.message);
  }

  return (data ?? []) as Event[];
}

export async function getApprovedEventById(id: string): Promise<Event | null> {
  const { data, error } = await getSupabaseClient()
    .from("events")
    .select("*, venue_record:venues(*), organiser_record:organisers(*)")
    .eq("status", "approved")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    raiseQueryError("load this approved event", error.message);
  }

  return data as Event | null;
}
