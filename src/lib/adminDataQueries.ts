import { getSupabaseClient } from "./supabaseClient";
import type { Organiser, OrganiserInsert, OrganiserUpdate, Venue, VenueInsert, VenueUpdate } from "../types/event";

export async function getAllVenues(): Promise<Venue[]> {
  const { data, error } = await getSupabaseClient().from("venues").select("*").order("name", { ascending: true });
  if (error) throw new Error(`Could not load venues: ${error.message}`);
  return (data ?? []) as Venue[];
}

export async function createVenue(input: VenueInsert): Promise<Venue> {
  const { data, error } = await getSupabaseClient().from("venues").insert(input).select("*").single();
  if (error) throw new Error(`Could not add venue: ${error.message}`);
  return data as Venue;
}

export async function updateVenue(id: string, input: VenueUpdate): Promise<Venue> {
  const { data, error } = await getSupabaseClient().from("venues").update(input).eq("id", id).select("*").single();
  if (error) throw new Error(`Could not save venue: ${error.message}`);
  return data as Venue;
}

export async function deleteVenue(id: string): Promise<void> {
  const { error } = await getSupabaseClient().from("venues").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      throw new Error("This venue is attached to existing events. Edit the venue instead of deleting it.");
    }
    throw new Error(`Could not delete venue: ${error.message}`);
  }
}

export async function getAllOrganisers(): Promise<Organiser[]> {
  const { data, error } = await getSupabaseClient().from("organisers").select("*").order("name", { ascending: true });
  if (error) throw new Error(`Could not load organisers: ${error.message}`);
  return (data ?? []) as Organiser[];
}

export async function createOrganiser(input: OrganiserInsert): Promise<Organiser> {
  const { data, error } = await getSupabaseClient().from("organisers").insert(input).select("*").single();
  if (error) throw new Error(`Could not add organiser: ${error.message}`);
  return data as Organiser;
}

export async function updateOrganiser(id: string, input: OrganiserUpdate): Promise<Organiser> {
  const { data, error } = await getSupabaseClient().from("organisers").update(input).eq("id", id).select("*").single();
  if (error) throw new Error(`Could not save organiser: ${error.message}`);
  return data as Organiser;
}

export async function deleteOrganiser(id: string): Promise<void> {
  const { error } = await getSupabaseClient().from("organisers").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      throw new Error("This organiser is attached to existing events. Edit the organiser instead of deleting it.");
    }
    throw new Error(`Could not delete organiser: ${error.message}`);
  }
}
