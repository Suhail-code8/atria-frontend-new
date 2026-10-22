import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { eventsApi } from "../api/events.api";
import { type Event, EventStatus } from "../types";
import {
  ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, MapPin, Sparkles, Users,
} from "lucide-react";

function formatDate(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date to be announced";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function statusLabel(status: EventStatus) {
  switch (status) {
    case EventStatus.REGISTRATION_OPEN:
      return { label: "Registration open", tone: "bg-lime-300 text-[#17231b]" };
    case EventStatus.ONGOING:
      return { label: "Happening now", tone: "bg-[#ff705c] text-white" };
    case EventStatus.COMPLETED:
      return { label: "Completed", tone: "bg-white/15 text-white/75" };
    default:
      return { label: "Coming up", tone: "bg-white/15 text-white" };
  }
}

function EventArtwork({ event, className = "" }: { event?: Event; className?: string }) {
  if (event?.posterUrl) {
    return <img src={event.posterUrl} alt={event.title} className={`h-full w-full object-cover transition duration-700 group-hover:scale-[1.04] ${className}`} />;
  }

  return (
    <div className={`relative isolate flex h-full min-h-64 items-end overflow-hidden bg-[#312060] p-6 sm:p-8 ${className}`}>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_25%,rgba(255,115,92,.9),transparent_32%),radial-gradient(ellipse_at_20%_100%,rgba(145,118,255,.8),transparent_40%),linear-gradient(140deg,#312060,#17132a_72%)]" />
      <div className="absolute -right-10 -top-20 -z-10 h-72 w-72 rounded-full border border-white/25" />
      <div className="absolute -right-1 -top-11 -z-10 h-52 w-52 rounded-full border border-white/20" />
      <div className="absolute right-10 top-10 -z-10 h-28 w-28 rounded-full border border-white/20 bg-white/10 shadow-[0_0_80px_30px_rgba(255,161,131,.22)] backdrop-blur-sm" />
      <div className="relative max-w-xs text-white">
        <p className="text-[10px] font-bold uppercase tracking-[.28em] text-lime-200">Atria / gathering ideas</p>
        <p className="mt-3 font-serif text-3xl leading-[1.05] sm:text-4xl">{event?.title || "Make a little room for wonder."}</p>
      </div>
      <Sparkles className="absolute right-7 top-7 h-5 w-5 text-lime-200" aria-hidden="true" />
    </div>
  );
}

function FeaturedEvent({ event, isLoading }: { event?: Event; isLoading: boolean }) {
  const status = event ? statusLabel(event.status) : null;
  return (
    <motion.article
      initial={{ opacity: 0, y: 24, rotate: 1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.75, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="group relative mx-auto w-full max-w-[470px] rotate-0"
    >
      <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-[#f2bb80]/20 via-transparent to-[#8e77ff]/20 blur-xl" />
      <div className="relative overflow-hidden rounded-[1.6rem] border border-white/15 bg-[#1c1830] p-2 shadow-[0_35px_100px_-32px_rgba(0,0,0,.8)]">
        <div className="relative h-[310px] overflow-hidden rounded-[1.2rem] sm:h-[360px]">
          <EventArtwork event={event} />
          {status && <span className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-[11px] font-bold ${status.tone}`}>{status.label}</span>}
          {!event && isLoading && <div className="absolute inset-0 animate-pulse bg-white/10" aria-label="Loading featured event" />}
          <span className="absolute bottom-4 right-4 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.18em] text-white/85 backdrop-blur-md">Atria recommends</span>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-4 text-white sm:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#c1b5ff]">{event ? "Featured gathering" : "A place to begin"}</p>
            <h2 className="mt-1 truncate text-lg font-semibold">{event?.title || "Find your people."}</h2>
            {event && <p className="mt-1 flex items-center gap-2 text-xs text-white/55"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{formatDate(event.startDate)}</p>}
          </div>
          {event ? (
            <Link to={`/events/${event._id}`} aria-label={`Explore ${event.title}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-lime-300 text-[#17231b] transition hover:rotate-45 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><ArrowUpRight className="h-5 w-5" aria-hidden="true" /></Link>
          ) : <CalendarDays className="h-5 w-5 shrink-0 text-lime-200" aria-hidden="true" />}
        </div>
      </div>
      <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-white/15 bg-[#29213f]/90 px-4 py-3 text-white shadow-xl backdrop-blur-md sm:block">
        <span className="text-[10px] font-bold uppercase tracking-[.18em] text-white/50">Good things happen</span>
        <p className="mt-1 text-sm font-medium">when we show up.</p>
      </div>
    </motion.article>
  );
}

export function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

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
    return () => { isActive = false; };
  }, []);

  const intro = reduceMotion ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <div className="overflow-hidden bg-[#f7f5ef] text-[#211b2a]">
      <section className="relative isolate min-h-[680px] overflow-hidden bg-[#171324] text-white sm:min-h-[740px]">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_76%_46%,rgba(107,80,179,.28),transparent_36%),radial-gradient(ellipse_at_20%_100%,rgba(222,130,93,.12),transparent_38%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[.12] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="pointer-events-none absolute -right-56 top-8 -z-10 h-[560px] w-[560px] rounded-full border border-white/[.08] sm:right-[4%] sm:top-12" />
        <div className="pointer-events-none absolute -right-32 top-32 -z-10 h-[390px] w-[390px] rounded-full border border-white/[.07] sm:right-[11%] sm:top-36" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-20 sm:px-8 sm:pb-24 sm:pt-24 lg:min-h-[740px] lg:grid-cols-[1.02fr_.98fr] lg:gap-8 lg:px-10 lg:py-20">
          <motion.div {...intro} className="relative z-10 max-w-[650px]">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.04] px-3 py-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#d6cef8] sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-300 shadow-[0_0_12px_3px_rgba(190,242,100,.4)]" />
              Atria · Find your kind of people
            </p>
            <h1 className="mt-7 max-w-[700px] font-serif text-[3.65rem] leading-[.94] tracking-[-.055em] text-white sm:text-7xl lg:text-[5.8rem]">
              Life happens <span className="italic text-[#c1b5ff]">in the</span> <span className="relative inline-block">gathering<span className="absolute -bottom-1 left-1 h-2 w-[92%] -rotate-2 rounded-full bg-[#ff8068] sm:-bottom-2 sm:h-3" /></span><span className="text-[#ff8068]">.</span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
              Find the rooms where ideas spark, new skills take shape, and your next chapter begins. Or bring your people together and make something happen.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#events" className="group inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-lime-300 px-6 py-3 text-sm font-bold text-[#17231b] transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_10px_40px_-10px_rgba(190,242,100,.65)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200">
                Find your next event <ArrowDown className="h-4 w-4 transition group-hover:translate-y-1" aria-hidden="true" />
              </a>
              <Link to="/register" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                Host an event <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-7 text-xs tracking-wide text-white/40">For curious minds, bold builders, and the people bringing them together.</p>
          </motion.div>

          <div className="relative z-10 mx-auto w-full max-w-[540px] lg:ml-auto">
            <FeaturedEvent event={events[0]} isLoading={isLoading} />
            <div className="pointer-events-none absolute -right-3 top-0 hidden -translate-y-1/2 rounded-full border border-[#ff8068]/25 bg-[#ff8068]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#ffb9a8] md:block">Make it memorable ↗</div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-white/[.025]">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 text-[10px] font-semibold uppercase tracking-[.2em] text-white/40 sm:px-8 lg:px-10">
            <span>Ideas deserve an audience</span><span className="hidden text-[#c1b5ff] sm:inline">Discover · Connect · Create</span><span>Scroll to explore ↓</span>
          </div>
        </div>
      </section>

      <section id="events" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <motion.div {...(reduceMotion ? {} : { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.35 }, transition: { duration: 0.55 } })} className="flex flex-col justify-between gap-6 border-b border-[#211b2a]/15 pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.24em] text-[#6d55bf]"><span className="h-px w-7 bg-[#6d55bf]" />The good stuff starts here</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight tracking-[-.04em] text-[#211b2a] sm:text-5xl">Find your next <span className="italic text-[#7964c5]">yes.</span></h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#625d67] sm:text-base">Workshops, competitions, and gatherings worth showing up for.</p>
          </div>
          <span className="rounded-full border border-[#211b2a]/15 px-4 py-2 text-xs font-semibold text-[#625d67]">
            {!isLoading && !error ? `${events.length} ${events.length === 1 ? "event" : "events"}` : "Explore the calendar"}
          </span>
        </motion.div>

        {isLoading && <div className="grid gap-5 py-9 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading events">{[0, 1, 2].map((item) => <div key={item} className="overflow-hidden rounded-2xl border border-[#211b2a]/10 bg-white"><div className="h-52 animate-pulse bg-[#eae7e1]" /><div className="space-y-3 p-5"><div className="h-4 w-2/3 animate-pulse rounded bg-[#eae7e1]" /><div className="h-3 w-full animate-pulse rounded bg-[#eae7e1]" /><div className="h-3 w-1/2 animate-pulse rounded bg-[#eae7e1]" /></div></div>)}</div>}

        {error && !isLoading && <div className="my-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:p-8" role="alert"><p className="font-semibold text-rose-900">Events are temporarily unavailable</p><p className="mt-2 text-sm text-rose-800">{error}</p><button onClick={() => window.location.reload()} className="mt-4 rounded-full border border-rose-300 px-5 py-2.5 text-sm font-semibold text-rose-900 transition hover:bg-white">Try again</button></div>}

        {!isLoading && !error && events.length === 0 && <div className="my-8 rounded-2xl border border-[#211b2a]/10 bg-white px-6 py-14 text-center"><CalendarDays className="mx-auto h-8 w-8 text-[#7964c5]" aria-hidden="true" /><h3 className="mt-4 text-lg font-semibold">The calendar is taking a breath.</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#625d67]">New opportunities are on their way. Check back soon or join Atria to stay connected.</p><Link to="/register" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[#211b2a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#493765]">Join Atria <ArrowRight className="ml-2 h-4 w-4" /></Link></div>}

        {!isLoading && !error && events.length > 0 && <div className="grid gap-5 py-9 sm:grid-cols-2 lg:grid-cols-3">{events.map((event, index) => {
          const status = statusLabel(event.status);
          return <motion.article key={event._id} initial={reduceMotion ? false : { opacity: 0, y: 22 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.5, delay: index * 0.07 }} className="group flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-[#211b2a]/10 bg-white transition duration-300 hover:-translate-y-1.5 hover:border-[#7964c5]/35 hover:shadow-[0_24px_50px_-35px_rgba(33,27,42,.45)]">
            <div className="relative h-52 overflow-hidden bg-[#312060]"><EventArtwork event={event} /><span className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-[10px] font-bold ${status.tone}`}>{status.label}</span><span className="absolute bottom-3 right-3 rounded-full bg-black/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.14em] text-white backdrop-blur">{event.eventType.toLowerCase()}</span></div>
            <div className="flex flex-1 flex-col p-5 sm:p-6"><h3 className="line-clamp-2 text-xl font-semibold tracking-tight text-[#211b2a]">{event.title}</h3><p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[#625d67]">{event.description || "A new opportunity to learn, meet people, and make something happen."}</p><div className="mt-4 space-y-2.5 border-t border-[#211b2a]/10 pt-4 text-xs font-medium text-[#625d67]"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0 text-[#7964c5]" aria-hidden="true" />{formatDate(event.startDate)}</span>{event.location && <span className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-[#7964c5]" aria-hidden="true" /><span className="line-clamp-1">{event.location}</span></span>}{event.availableSeats !== undefined && <span className="flex items-center gap-2"><Users className="h-4 w-4 shrink-0 text-[#7964c5]" aria-hidden="true" />{event.availableSeats} seats remaining</span>}</div><Link to={`/events/${event._id}`} className="mt-5 inline-flex min-h-11 items-center justify-between rounded-full bg-[#f3f0ea] px-4 py-2.5 text-sm font-semibold text-[#211b2a] transition group-hover:bg-[#211b2a] group-hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7964c5]">Explore event <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" /></Link></div>
          </motion.article>;
        })}</div>}
      </section>
      <div className="border-y border-[#211b2a]/10 bg-[#eeeae2]"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 py-5 text-[10px] font-bold uppercase tracking-[.2em] text-[#625d67] sm:gap-x-12 sm:text-xs"><span>Come curious</span><span className="text-[#ff8068]">✳</span><span>Leave connected</span><span className="text-[#7964c5]">✳</span><span>Make it count</span></div></div>
    </div>
  );
}

