import { Link } from "react-router-dom";

function TornEdge() {
  return (
    <svg
      viewBox="0 0 1200 14"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ position: "absolute", top: -13, left: 0, width: "100%", height: 14 }}
    >
      <path
        d="M0 14 L0 6 L20 4 L42 8 L66 3 L88 7 L112 2 L138 6 L162 4 L188 9 L214 3 L240 7 L266 2 L292 6 L320 4 L348 8 L374 3 L402 7 L428 2 L456 6 L482 4 L510 8 L536 3 L564 7 L590 2 L618 6 L644 4 L672 8 L698 3 L726 7 L752 2 L780 6 L806 4 L834 8 L860 3 L888 7 L914 2 L942 6 L968 4 L996 8 L1022 3 L1050 7 L1076 2 L1104 6 L1130 4 L1158 8 L1184 3 L1200 6 L1200 14 Z"
        fill="#2c1810"
      />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative mt-20 bg-ink text-paper">
      <TornEdge />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-8 pt-14 sm:grid-cols-3 sm:gap-12 sm:px-6">
        <div>
          <p className="font-display text-xl font-black text-posterYellow">
            Cork Community Arts Organisation
          </p>
          <p className="mt-3 font-mono text-xs leading-relaxed tracking-[0.04em] opacity-75">
            A shared listings board, run by volunteers. No ads, no algorithm — just what's on.
          </p>
        </div>
        <div>
          <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-posterYellow">
            On the board
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/events" className="font-mono text-sm text-paper hover:text-posterYellow">
              Listings
            </Link>
            <Link to="/submit" className="font-mono text-sm text-paper hover:text-posterYellow">
              Submit an event
            </Link>
            <Link to="/about" className="font-mono text-sm text-paper hover:text-posterYellow">
              About C&#x2019;CAO
            </Link>
          </div>
        </div>
        <div>
          <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-posterYellow">
            Running the board
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/admin/login" className="font-mono text-sm text-paper hover:text-posterYellow">
              Admin login
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl border-t border-paper/20 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper/60">
            © 2026 C&#x2019;CAO · Pasted in Cork
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper/60">
            Submit an event, keep the board fresh
          </span>
        </div>
      </div>
    </footer>
  );
}
