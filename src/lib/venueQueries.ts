import { getSupabaseClient } from "./supabaseClient";
import type { Venue } from "../types/event";

type MapLinkOptions = {
  venueName: string;
  venueAddress?: string | null;
  googleMapsUrl?: string | null;
  appleMapsUrl?: string | null;
  manualMapsUrl?: string | null;
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
  manualMapsUrl,
}: MapLinkOptions) {
  // Saved venue maps take highest priority
  if (googleMapsUrl?.trim() || appleMapsUrl?.trim()) {
    const query = venueAddress?.trim() || `${venueName}, Cork, Ireland`;
    const encodedQuery = encodeURIComponent(query);
    return {
      googleMapsUrl: googleMapsUrl?.trim() || `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
      appleMapsUrl: appleMapsUrl?.trim() || `https://maps.apple.com/?q=${encodedQuery}`,
      isManualOnly: false,
    };
  }

  // Manual maps link from event submission
  if (manualMapsUrl?.trim()) {
    return {
      googleMapsUrl: manualMapsUrl.trim(),
      appleMapsUrl: null,
      isManualOnly: true,
    };
  }

  // Generated from venue name / address
  const query = venueAddress?.trim() || `${venueName}, Cork, Ireland`;
  const encodedQuery = encodeURIComponent(query);
  return {
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
    appleMapsUrl: `https://maps.apple.com/?q=${encodedQuery}`,
    isManualOnly: false,
  };
}
