import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EventCard } from "../components/events/EventCard";
import { EmptyState } from "../components/shared/EmptyState";
import { ErrorState } from "../components/shared/ErrorState";
import { LoadingState } from "../components/shared/LoadingState";
import { getUpcomingApprovedEvents } from "../lib/eventQueries";
import type { Event } from "../types/event";

export function HomePage() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadEvents() {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const events = await getUpcomingApprovedEvents(3);

        if (isCurrent) {
          setUpcomingEvents(events);
        }
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load upcoming events.");
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadEvents();

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <main>
      <section className="border-b-2 border-ink bg-paper">
        <div className="mx-auto grid max-w-6xl gap-8 px-3 py-9 min-[360px]:px-4 sm:px-6 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-16">
          <div className="min-w-0">
            <p className="mb-4 w-fit max-w-full rotate-[-1deg] rounded-full border-2 border-ink bg-posterYellow px-3 py-2 text-xs font-black uppercase min-[360px]:px-4 min-[360px]:text-sm">
              Cork city arts noticeboard
            </p>
            <h1 className="font-display text-4xl font-black leading-none min-[360px]:text-5xl sm:text-7xl">
              Cork Community Art Union Calendar
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-stone-700 sm:text-lg sm:leading-8">
              A shared public calendar for exhibitions, gigs, workshops, screenings, readings, talks,
              and handmade culture across Cork city.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="button-primary bg-corkRed text-white" to="/events">
                Browse events
              </Link>
              <Link className="button-primary bg-leeBlue text-white" to="/submit">
                Submit an event
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border-2 border-ink bg-white p-4 shadow-poster sm:p-5">
            <div className="grid grid-cols-2 gap-3">
              {["Print", "Poetry", "Film", "Music", "Talks", "DIY"].map((word, index) => (
                <div
                  key={word}
                  className={`rounded-2xl border-2 border-ink p-3 text-center font-display text-xl font-black min-[360px]:text-2xl sm:p-4 ${
                    [
                      "bg-posterYellow",
                      "bg-pinkPunch text-white",
                      "bg-grass text-white",
                      "bg-leeBlue text-white",
                      "bg-corkRed text-white",
                      "bg-paper",
                    ][index]
                  }`}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-3 py-10 min-[360px]:px-4 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase text-corkRed">Coming up</p>
            <h2 className="font-display text-3xl font-black">Next approved events</h2>
          </div>
          <Link to="/events" className="inline-flex min-h-11 items-center text-sm font-black underline sm:block sm:min-h-0">
            See all
          </Link>
        </div>
        {isLoading ? <LoadingState message="Loading upcoming events..." /> : null}
        {!isLoading && errorMessage ? <ErrorState message={errorMessage} /> : null}
        {!isLoading && !errorMessage && upcomingEvents.length === 0 ? (
          <EmptyState
            title="No upcoming approved events yet"
            message="Once moderators approve new listings, the next Cork events will appear here."
          />
        ) : null}
        {!isLoading && !errorMessage && upcomingEvents.length > 0 ? (
          <div className="space-y-5">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} compact />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
