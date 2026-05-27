import { getSupabaseClient } from "./supabaseClient";
import type { Event } from "../types/event";
import { getEventDisciplines } from "../types/event";

export type AdminStats = {
  totalEvents: number;
  pending: number;
  approved: number;
  unpublished: number;
  rejected: number;
  upcomingApproved: number;
  pastApproved: number;
  byDiscipline: { discipline: string; count: number }[];
  byVenue: { venue: string; count: number }[];
  recentSubmissions: Event[];
};

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function getAdminStats(): Promise<AdminStats> {
  const { data, error } = await getSupabaseClient()
    .from("events")
    .select("id, status, event_date, discipline, disciplines, venue, created_at, title, start_time, end_time, organiser, entry_fee, link_or_ticket_info, image_url, manual_maps_url, venue_id, organiser_id, description, submitter_name, submitter_email, admin_notes, updated_at, approved_at, approved_by")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Could not load stats: ${error.message}`);

  const events = (data ?? []) as Event[];
  const today = todayIso();

  const pending = events.filter((e) => e.status === "pending").length;
  const approved = events.filter((e) => e.status === "approved").length;
  const unpublished = events.filter((e) => e.status === "unpublished").length;
  const rejected = events.filter((e) => e.status === "rejected").length;

  const approvedEvents = events.filter((e) => e.status === "approved");
  const upcomingApproved = approvedEvents.filter((e) => e.event_date >= today).length;
  const pastApproved = approvedEvents.filter((e) => e.event_date < today).length;

  // Discipline breakdown across all approved events
  const disciplineCount: Record<string, number> = {};
  for (const e of approvedEvents) {
    for (const d of getEventDisciplines(e)) {
      disciplineCount[d] = (disciplineCount[d] ?? 0) + 1;
    }
  }
  const byDiscipline = Object.entries(disciplineCount)
    .map(([discipline, count]) => ({ discipline, count }))
    .sort((a, b) => b.count - a.count);

  // Venue breakdown across all approved events
  const venueCount: Record<string, number> = {};
  for (const e of approvedEvents) {
    if (e.venue) venueCount[e.venue] = (venueCount[e.venue] ?? 0) + 1;
  }
  const byVenue = Object.entries(venueCount)
    .map(([venue, count]) => ({ venue, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 5 most recently submitted (any status)
  const recentSubmissions = events.slice(0, 5);

  return {
    totalEvents: events.length,
    pending,
    approved,
    unpublished,
    rejected,
    upcomingApproved,
    pastApproved,
    byDiscipline,
    byVenue,
    recentSubmissions,
  };
}
