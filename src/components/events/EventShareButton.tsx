import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { ShareCard } from "./ShareCard";
import type { Event } from "../../types/event";

const CARD_SIZE = 540;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

type EventShareButtonProps = {
  event: Event;
};

export function EventShareButton({ event }: EventShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareError, setShareError] = useState("");
  const [scale, setScale] = useState(1);

  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function measure() {
      if (containerRef.current) {
        setScale(Math.min(1, containerRef.current.offsetWidth / CARD_SIZE));
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const generateImage = useCallback(async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    setIsGenerating(true);
    setGenerateError("");
    try {
      const options = { pixelRatio: 2, cacheBust: true };
      await toPng(cardRef.current, options);
      const dataUrl = await toPng(cardRef.current, options);
      setPngDataUrl(dataUrl);
      return dataUrl;
    } catch {
      setGenerateError("Could not generate the image. Please try again.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    void generateImage();
  }, [isOpen, generateImage]);

  function handleOpen() {
    setPngDataUrl(null);
    setGenerateError("");
    setShareError("");
    setShareCopied(false);
    setLinkCopied(false);
    setIsOpen(true);
  }

  async function handleShare() {
    setShareError("");
    setShareCopied(false);

    const dataUrl = pngDataUrl ?? (await generateImage());
    const pageUrl = window.location.href;

    if (dataUrl && typeof navigator.canShare === "function") {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File(
          [blob],
          `${slugify(event.title)}-cork-culture-board.png`,
          { type: "image/png" },
        );
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: event.title, url: pageUrl });
          return;
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: event.title, url: pageUrl });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(pageUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      setShareError("Could not share. Copy the link from your browser's address bar.");
    }
  }

  async function handleDownload() {
    const dataUrl = pngDataUrl ?? (await generateImage());
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = `${slugify(event.title)}-cork-culture-board.png`;
    link.href = dataUrl;
    link.click();
  }

  async function handleCopyLink() {
    setShareError("");
    setLinkCopied(false);
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setShareError("Could not copy the link. Please copy it from your browser's address bar.");
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) setIsOpen(false);
  }

  return (
    <>
      {/* Off-screen card for image capture */}
      {isOpen ? (
        <div
          style={{ position: "fixed", left: -9999, top: 0, width: CARD_SIZE, pointerEvents: "none" }}
        >
          <div ref={cardRef}>
            <ShareCard event={event} />
          </div>
        </div>
      ) : null}

      {/* Modal */}
      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6"
          style={{ background: "rgba(44, 24, 16, 0.6)", backdropFilter: "blur(2px)" }}
          onClick={handleBackdropClick}
        >
          <div className="relative flex w-full max-w-[600px] flex-col gap-5 border-2 border-ink bg-creamLight p-5 shadow-poster sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b border-dashed border-cacao pb-4">
              <div>
                <h2 className="font-display text-2xl font-black text-ink">Share this event</h2>
                <p className="mt-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-cacao">
                  1080 × 1080 px · ready for Instagram
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex min-h-10 items-center border-2 border-ink bg-creamLight px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.1em] shadow-paste transition-[transform,box-shadow] hover:-translate-y-px hover:bg-posterYellow hover:shadow-poster focus:outline-none focus:ring-4 focus:ring-posterYellow"
              >
                Close
              </button>
            </div>

            {/* Card preview */}
            <div ref={containerRef} style={{ width: "100%" }}>
              <div
                style={{
                  width: "100%",
                  height: scale * CARD_SIZE,
                  overflow: "hidden",
                  border: "2px solid #2c1810",
                }}
              >
                <div
                  style={{
                    width: CARD_SIZE,
                    height: CARD_SIZE,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                  }}
                >
                  <ShareCard event={event} />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => void handleShare()}
                  disabled={isGenerating}
                  className="inline-flex min-h-11 flex-1 items-center justify-center border-2 border-ink bg-ink px-5 py-3 font-mono text-sm font-bold uppercase tracking-[0.1em] text-creamLight shadow-paste transition-[transform,box-shadow] hover:-translate-y-px hover:bg-cacaoMid hover:shadow-poster focus:outline-none focus:ring-4 focus:ring-posterYellow disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {shareCopied ? "Link copied!" : "Share card"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDownload()}
                  disabled={isGenerating}
                  className="inline-flex min-h-11 flex-1 items-center justify-center border-2 border-ink bg-creamLight px-5 py-3 font-mono text-sm font-bold uppercase tracking-[0.1em] shadow-paste transition-[transform,box-shadow] hover:-translate-y-px hover:bg-posterYellow hover:shadow-poster focus:outline-none focus:ring-4 focus:ring-posterYellow disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isGenerating ? "Generating…" : "Download Instagram card"}
                </button>
              </div>
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                className="inline-flex min-h-11 items-center justify-center border-2 border-dashed border-cacao bg-creamLight px-5 py-3 font-mono text-sm font-bold uppercase tracking-[0.1em] transition-[background-color,transform] hover:-translate-y-px hover:bg-posterYellow focus:outline-none focus:ring-4 focus:ring-posterYellow"
              >
                {linkCopied ? "Copied!" : "Copy event link"}
              </button>
            </div>

            <p className="font-mono text-xs text-cacao">
              Choose Instagram from your phone's share menu, or download the card and upload it to
              your story.
            </p>

            {generateError ? (
              <p className="border-2 border-corkRed bg-creamLight px-4 py-3 font-mono text-sm font-bold text-corkRed">
                {generateError}
              </p>
            ) : null}
            {shareError ? (
              <p className="border-2 border-corkRed bg-creamLight px-4 py-3 font-mono text-sm font-bold text-corkRed">
                {shareError}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleOpen}
        className="button-primary bg-corkRed text-creamLight"
      >
        Share event
      </button>
    </>
  );
}
