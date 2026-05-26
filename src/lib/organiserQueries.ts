import { getSupabaseClient } from "./supabaseClient";
import type { Organiser } from "../types/event";

export async function getOrganisers(): Promise<Organiser[]> {
  const { data, error } = await getSupabaseClient()
    .from("organisers")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Could not load organisers: ${error.message}`);
  }

  return (data ?? []) as Organiser[];
}

export async function searchOrganisers(query: string): Promise<Organiser[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return getOrganisers();
  }

  const { data, error } = await getSupabaseClient()
    .from("organisers")
    .select("*")
    .ilike("name", `%${trimmedQuery}%`)
    .order("name", { ascending: true })
    .limit(8);

  if (error) {
    throw new Error(`Could not search organisers: ${error.message}`);
  }

  return (data ?? []) as Organiser[];
}
