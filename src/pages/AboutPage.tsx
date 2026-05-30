import { Link } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";

const cards = [
  {
    no: "01",
    title: "Public first",
    body: "Anyone can browse listings without creating an account.",
    tilt: -0.5,
  },
  {
    no: "02",
    title: "Open submissions",
    body: "Organisers can send an event quickly, then moderators review it.",
    tilt: 0.6,
  },
  {
    no: "03",
    title: "Small on purpose",
    body: "No comments, ticketing, feeds, or social machinery. Just the useful bits.",
    tilt: -0.4,
  },
];

export function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title="Cork Culture Board"
      intro="A free listings board where arts groups, venues, and organisers can share what's happening across Cork city. A Cork Community Arts Organisation project."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map(({ no, title, body, tilt }) => (
          <section
            key={title}
            className="border-2 border-ink bg-creamLight p-6 shadow-paste"
            style={{ transform: `rotate(${tilt}deg)` }}
          >
            <p className="font-display text-4xl font-black italic text-corkRed">{no}</p>
            <h2 className="mt-2 font-display text-2xl font-black text-ink">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-cacaoMid">{body}</p>
          </section>
        ))}
      </div>

      <div className="mt-8 border-2 border-ink bg-ink p-8 text-center shadow-poster">
        <h2 className="font-display text-3xl font-black text-posterYellow sm:text-4xl">
          Add your event
        </h2>
        <p className="mx-auto mt-3 max-w-xl font-mono text-xs uppercase tracking-[0.08em] text-paper/80">
          Free to list · reviewed before it goes public
        </p>
        <Link to="/submit" className="button-primary mt-6 bg-corkRed text-creamLight">
          Submit an event
        </Link>
      </div>
    </PageShell>
  );
}
