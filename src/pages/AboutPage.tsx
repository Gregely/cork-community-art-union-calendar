import { Link } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";

export function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title="A shared board for Cork culture"
      intro="Cork Community Art Union Calendar is an MVP for a simple public listings board where arts groups, venues, and DIY organisers can share what is happening in the city."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {[
          ["Public first", "Anyone can browse approved listings without creating an account."],
          ["Open submissions", "Organisers can send an event quickly, then moderators review it."],
          ["Small on purpose", "No comments, ticketing, feeds, or social machinery. Just the useful bits."],
        ].map(([title, body]) => (
          <section key={title} className="rounded-2xl border-2 border-ink bg-white p-5 shadow-poster">
            <h2 className="font-display text-2xl font-black">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-stone-700">{body}</p>
          </section>
        ))}
      </div>
      <Link to="/submit" className="button-primary mt-8 w-full bg-corkRed text-white sm:w-auto">
        Submit an event
      </Link>
    </PageShell>
  );
}
