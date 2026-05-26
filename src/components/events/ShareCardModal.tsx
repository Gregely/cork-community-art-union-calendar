import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { CalendarEvent } from "../../types/event";
import { ShareCard } from "./ShareCard";

const CARD_SIZE = 540;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

type ShareCardModalProps = {
  event: CalendarEvent;
  onClose: () => void;
};

export function ShareCardModal({ event, onClose }: ShareCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  // Scale the preview to fit the modal width
  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const availableWidth = containerRef.current.offsetWidth;
        setScale(Math.min(1, availableWidth / CARD_SIZE));
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloadError("");
    setIsDownloading(true);
    try {
      const options = { pixelRatio: 2, cacheBust: true };
      // Run twice: first pass embeds fonts, second produces the final image
      await toPng(cardRef.current, options);
      const dataUrl = await toPng(cardRef.current, options);
      const link = document.createElement("a");
      link.download = `${slugify(event.title)}-cork-culture-board.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      setDownloadError("Could not generate the image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:items-center sm:p-6"
      onClick={handleBackdropClick}
    >
      <div className="relative flex w-full max-w-[600px] flex-col gap-5 rounded-2xl border-2 border-ink bg-paper p-5 shadow-poster sm:p-6">
        {/* Modal header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-black">Share card</h2>
            <p className="mt-0.5 text-xs font-bold text-stone-500">
              1080 × 1080 px — ready for Instagram
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 items-center rounded-full border-2 border-ink bg-white px-4 py-2 text-sm font-black hover:bg-posterYellow focus:outline-none focus:ring-4 focus:ring-posterYellow"
          >
            Close
          </button>
        </div>

        {/* Card preview */}
        <div ref={containerRef} style={{ width: "100%" }}>
          {/* Outer: takes up scaled height in layout */}
          <div
            style={{
              width: "100%",
              height: scale * CARD_SIZE,
              overflow: "hidden",
              borderRadius: 8,
            }}
          >
            {/* Inner: full-size card, scaled down visually */}
            <div
              style={{
                width: CARD_SIZE,
                height: CARD_SIZE,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <div ref={cardRef}>
                <ShareCard event={event} />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-bold text-stone-500">
            Tip: long-press the card on mobile to save.
          </p>
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={isDownloading}
            className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-ink bg-ink px-6 py-3 text-sm font-black text-paper hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-posterYellow disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDownloading ? "Generating…" : "Download PNG"}
          </button>
        </div>

        {downloadError ? (
          <p className="rounded-xl border-2 border-corkRed bg-red-50 px-4 py-3 text-sm font-bold text-corkRed">
            {downloadError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
