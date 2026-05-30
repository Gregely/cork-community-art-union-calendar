import { getSupabaseClient } from "./supabaseClient";

// ── Constants ──────────────────────────────────────────────────────────────

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const BUCKET = "event-images";

// ── Validation ─────────────────────────────────────────────────────────────

export type ImageValidationResult =
  | { valid: true }
  | { valid: false; message: string };

export function isValidEventImageFile(file: File): ImageValidationResult {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return {
      valid: false,
      message: "File type not supported. Please upload a JPEG, PNG, or WebP image.",
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      message: `Image is too large (${sizeMb} MB). Maximum file size is 2 MB.`,
    };
  }

  return { valid: true };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function mimeToExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png":  "png",
    "image/webp": "webp",
  };
  return map[mimeType] ?? "jpg";
}

function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ── Upload ─────────────────────────────────────────────────────────────────

export async function uploadEventImage(
  file: File,
): Promise<{ publicUrl: string; path: string }> {
  const ext  = mimeToExtension(file.type);
  const ts   = Date.now();
  const rand = randomHex(3); // 6 hex chars
  const path = `pending-events/${ts}-${rand}.${ext}`;

  const client = getSupabaseClient();

  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    throw new Error(`Could not upload image: ${uploadError.message}`);
  }

  const { data: urlData } = client.storage.from(BUCKET).getPublicUrl(path);

  return { publicUrl: urlData.publicUrl, path };
}

// ── Delete ─────────────────────────────────────────────────────────────────

/** Delete a file from Supabase Storage by its storage path. */
export async function deleteEventImage(path: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .storage
    .from(BUCKET)
    .remove([path]);

  if (error) {
    throw new Error(`Could not delete image from storage: ${error.message}`);
  }
}
