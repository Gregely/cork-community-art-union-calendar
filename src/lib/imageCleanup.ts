/**
 * Old-image cleanup utility.
 *
 * Finds events whose event_date is more than CLEANUP_DAYS_THRESHOLD days in
 * the past and that have an uploaded image (image_storage_path != null).
 * Deletes those files from Supabase Storage and clears the image fields on
 * the event rows.  Event records themselves are never deleted.
 *
 * Structured so the core logic (`cleanupOldEventImages`) can be called from:
 *   - The admin dashboard UI
 *   - A Vercel Cron route
 *   - A Supabase Edge Function
 *   - Any scheduled server job
 */

import { deleteEventImage } from "./storage";
import { getSupabaseClient } from "./supabaseClient";

export const CLEANUP_DAYS_THRESHOLD = 60;

export type CleanupPreview = { count: number };
export type CleanupResult  = { cleaned: number; errors: string[] };

type StaleRow = { id: string; image_storage_path: string };

function cutoffDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0]!;
}

/** Returns how many uploaded images would be cleaned without modifying anything. */
export async function previewOldEventImageCleanup(): Promise<CleanupPreview> {
  const cutoff = cutoffDateString(CLEANUP_DAYS_THRESHOLD);

  const { data, error } = await getSupabaseClient()
    .from("events")
    .select("id")
    .lt("event_date", cutoff)
    .not("image_storage_path", "is", null);

  if (error) throw new Error(`Could not check for old images: ${error.message}`);

  return { count: (data ?? []).length };
}

/**
 * Deletes uploaded images from past events older than CLEANUP_DAYS_THRESHOLD.
 * Returns how many were cleaned and any per-event errors encountered.
 */
export async function cleanupOldEventImages(): Promise<CleanupResult> {
  const cutoff = cutoffDateString(CLEANUP_DAYS_THRESHOLD);

  const { data, error } = await getSupabaseClient()
    .from("events")
    .select("id, image_storage_path")
    .lt("event_date", cutoff)
    .not("image_storage_path", "is", null);

  if (error) throw new Error(`Could not load old events for cleanup: ${error.message}`);

  const rows = (data ?? []) as StaleRow[];
  let cleaned = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      await deleteEventImage(row.image_storage_path);

      const { error: updateError } = await getSupabaseClient()
        .from("events")
        .update({ image_url: null, image_storage_path: null })
        .eq("id", row.id);

      if (updateError) {
        errors.push(`Event ${row.id}: DB clear failed — ${updateError.message}`);
      } else {
        cleaned++;
      }
    } catch (err) {
      errors.push(
        `Event ${row.id}: ${err instanceof Error ? err.message : "unknown error"}`,
      );
    }
  }

  return { cleaned, errors };
}
