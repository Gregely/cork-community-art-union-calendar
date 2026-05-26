import { getSupabaseClient } from "./supabaseClient";
import type { Venue } from "../types/event";

type MapLinkOptions = {
  venueName: string;
  venueAddress?: string | null;
  googleMapsUrl?: string | null;
  appleMapsUrl?: string | null;
};

export async function getVenues(): Promise<Venue[]> {
  const { data, error } = await getSupabaseClient()
    .from("venues")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Could not load venues: ${error.message}`);
  }

  return (data ?? []) as Venue[];
}

export async function searchVenues(query: string): Promise<Venue[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return getVenues();
  }

  const { data, error } = await getSupabaseClient()
    .from("venues")
    .select("*")
    .ilike("name", `%${trimmedQuery}%`)
    .order("name", { ascending: true })
    .limit(8);

  if (error) {
    throw new Error(`Could not search venues: ${error.message}`);
  }

  return (data ?? []) as Venue[];
}

export function getVenueMapLinks({
  venueName,
  venueAddress,
  googleMapsUrl,
  appleMapsUrl,
}: MapLinkOptions) {
  const query = venueAddress?.trim() || `${venueName}, Cork, Ireland`;
  const encodedQuery = encodeURIComponent(query);

  return {
    googleMapsUrl: googleMapsUrl?.trim() || `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
    appleMapsUrl: appleMapsUrl?.trim() || `https://maps.apple.com/?q=${encodedQuery}`,
  };
}
