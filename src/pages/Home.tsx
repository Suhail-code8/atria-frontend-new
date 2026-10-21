import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eventsApi } from "../api/events.api";
import { type Event, EventStatus } from "../types";
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";

function formatDate(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date to be announced";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function statusLabel(status: EventStatus) {
  switch (status) {
    case EventStatus.REGISTRATION_OPEN:
      return { label: "Registration open", tone: "bg-emerald-50 text-emerald-700" };
    case EventStatus.ONGOING:
      return { label: "Live now", tone: "bg-rose-50 text-rose-700" };
    case EventStatus.COMPLETED:
      return { label: "Completed", tone: "bg-slate-100 text-slate-600" };
    default:
      return { label: "Upcoming", tone: "bg-indigo-50 text-indigo-700" };
  }
}

function EventArtwork({ event }: { event?: Event }) {
  if (event?.posterUrl) {
    return (
      <img
        src={event.posterUrl}
        alt={event.title}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="relative flex h-full min-h-64 items-end overflow-hidden bg-[#172554] p-7 sm:p-9">
      <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full border border-white/15" />
      <div className="absolute -right-2 -top-6 h-44 w-44 rounded-full border border-white/15" />
      <div className="absolute right-10 top-10 h-24 w-24 rounded-full bg-indigo-400/20 blur-2xl" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-200">Atria events</p>
        <p className="mt-3 max-w-xs font-serif text-3xl leading-tight text-white sm:text-4xl">
          Make room for your next big idea.
        </p>
      </div>
    </div>
  );
}

function FeaturedEvent({ event, isLoading }: { event?: Event; isLoading: boolean }) {
  if (!event) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.35)]">
        <div className="relative">
          <EventArtwork />
          {isLoading && (
            <div className="absolute inset-0 animate-pulse bg-white/10" aria-label="Loading featured event" />
          )}
        </div>
        <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <div>
            <p className="text-sm font-semibold text-slate-900">Built around real events</p>
            <p className="mt-1 text-sm text-slate-500">Explore what’s happening in your community.</p>
          </div>
          <CalendarDays className="h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
        </div>
      </div>
    );
  }

  const status = statusLabel(event.status);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.35)]">
      <div className="relative h-64 bg-slate-100 sm:h-72">
        <EventArtwork event={event} />
        <span className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-semibold ${status.tone}`}>
          {status.label}
        </span>
      </div>
      <div className="p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">Featured event</p>
        <h2 className="mt-2 line-clamp-2 text-xl font-bold text-slate-950">{event.title}</h2>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-indigo-600" aria-hidden="true" />
            {formatDate(event.startDate)}
          </span>
          {event.location && (
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-600" aria-hidden="true" />
              {event.location}
            </span>
          )}
        </div>
        <Link
          to={`/events/${event._id}`}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
        >
          Explore event <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const fetchEvents = async () => {
      try {
        const response = await eventsApi.listEvents("PUBLISHED");
        if (isActive) setEvents(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        if (isActive) setError("We couldn’t load events just now. Please try again.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchEvents();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[#f7f8fc]">
        <div className="pointer-events-none absolute -right-48 -top-56 h-[34rem] w-[34rem] rounded-full border border-indigo-100" />
        <div className="pointer-events-none absolute -right-28 -top-36 h-[25rem] w-[25rem] rounded-full border border-indigo-100" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-10 lg:py-24">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-indigo-700">
              <span className="h-px w-8 bg-indigo-700" />
              Events for people who build
            </p>
            <h1 className="mt-6 font-serif text-5xl leading-[1.04] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Bring your next idea <span className="text-indigo-700">to life.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Find hackathons, conferences, and competitions. Or bring people together and run an event of your own.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#events"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-indigo-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
              >
                Browse events <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link
                to="/register"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-indigo-300 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
              >
                Create an account
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-500">For participants, organizers, and judges.</p>
          </div>

          <div className="mx-auto w-full max-w-xl lg:ml-auto">
            <FeaturedEvent event={events[0]} isLoading={isLoading} />
          </div>
        </div>
      </section>

      <section id="events" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-14 sm:px-8 sm:py-18 lg:px-10 lg:py-20">
        <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-700">Find your next opportunity</p>
            <h2 className="mt-3 font-serif text-3xl text-slate-950 sm:text-4xl">Upcoming events</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              Discover programs, competitions, and gatherings from the Atria community.
            </p>
          </div>
          <span className="text-sm font-medium text-slate-500">
            {!isLoading && !error ? events.length + (events.length === 1 ? " event" : " events") : "Open to explore"}
          </span>
        </div>

        {isLoading && (
          <div className="grid gap-5 py-8 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading events">
            {[0, 1, 2].map((item) => (
              <div key={item} className="overflow-hidden rounded-xl border border-slate-200">
                <div className="h-48 animate-pulse bg-slate-100" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && !isLoading && (
          <div className="my-8 rounded-xl border border-rose-200 bg-rose-50 p-6 sm:p-8" role="alert">
            <p className="font-semibold text-rose-900">Events are temporarily unavailable</p>
            <p className="mt-2 text-sm text-rose-800">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-900 transition hover:bg-white"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !error && events.length === 0 && (
          <div className="my-8 rounded-xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-indigo-600" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No upcoming events yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Check back soon for new opportunities, or create an account to stay connected.
            </p>
            <Link
              to="/register"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-800"
            >
              Get started
            </Link>
          </div>
        )}

        {!isLoading && !error && events.length > 0 && (
          <div className="grid gap-5 py-8 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const status = statusLabel(event.status);
              return (
                <article
                  key={event._id}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_18px_45px_-30px_rgba(30,41,59,0.4)]"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <EventArtwork event={event} />
                    <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${status.tone}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">
                        {event.eventType.toLowerCase()}
                      </span>
                      {event.isPaid && (
                        <span className="text-xs font-medium text-slate-500">
                          {event.price ? `Paid · ${event.price}` : "Paid event"}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 line-clamp-2 text-lg font-bold text-slate-950">{event.title}</h3>
                    <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-600">
                      {event.description || "More details will be shared by the organizer."}
                    </p>
                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                      <span className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
                        {formatDate(event.startDate)}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
                          <span className="line-clamp-1">{event.location}</span>
                        </span>
                      )}
                      {event.availableSeats !== undefined && (
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
                          {event.availableSeats} seats remaining
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/events/${event._id}`}
                      className="mt-5 inline-flex min-h-11 items-center justify-between rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 transition group-hover:border-indigo-700 group-hover:bg-indigo-700 group-hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
                    >
                      View event <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
