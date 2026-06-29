import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eventsApi } from "../api/events.api";
import { type Event, EventStatus } from "../types";
import { Calendar, Users, Loader2, ArrowRight, Sparkles, MapPin } from "lucide-react";

export function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await eventsApi.listEvents("PUBLISHED");
        setEvents(response.data.data || []);
      } catch (err: any) {
        console.error("Failed to fetch events:", err);
        setError("Unable to load events at this time. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const getStatusConfig = (status: EventStatus) => {
    switch (status) {
      case EventStatus.REGISTRATION_OPEN:
        return { label: "Registration Open", color: "#10b981", bg: "rgba(16,185,129,0.1)" };
      case EventStatus.ONGOING:
        return { label: "Live Now", color: "#ef4444", bg: "rgba(239,68,68,0.1)" };
      case EventStatus.PUBLISHED:
        return { label: "Upcoming", color: "#6366f1", bg: "rgba(99,102,241,0.1)" };
      case EventStatus.COMPLETED:
        return { label: "Completed", color: "#64748b", bg: "rgba(100,116,139,0.1)" };
      default:
        return { label: status, color: "#64748b", bg: "rgba(100,116,139,0.1)" };
    }
  };

  return (
    <div>
      {/* ── Hero Section ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1a3e 40%, #302b63 100%)" }}
      >
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-96 h-96 rounded-full opacity-20 float-animation"
            style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)", top: "-10%", right: "-5%" }}
          />
          <div
            className="absolute w-72 h-72 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #a855f7, transparent 70%)", bottom: "-10%", left: "-5%", animation: "float 5s ease-in-out infinite reverse" }}
          />
          <div
            className="absolute w-48 h-48 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #ec4899, transparent 70%)", top: "40%", left: "30%", animation: "float 6s ease-in-out infinite 1s" }}
          />
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-6"
              style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc" }}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE EVENT PLATFORM FOR BUILDERS</span>
            </div>

            <h1 className="fade-in-up text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6"
              style={{ animationDelay: "0.1s" }}>
              Discover & Join{" "}
              <span style={{ background: "linear-gradient(135deg, #818cf8, #c084fc, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Amazing Events
              </span>
            </h1>

            <p className="fade-in-up text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
              style={{ animationDelay: "0.2s" }}>
              Hackathons, conferences, and competitions — all in one place.
              Your next big challenge starts here.
            </p>

            <div className="fade-in-up flex flex-col sm:flex-row gap-3 justify-center" style={{ animationDelay: "0.3s" }}>
              <a
                href="#events"
                className="btn-premium inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-base font-bold shadow-lg"
              >
                Browse Events
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold border border-slate-600 text-slate-300 hover:bg-white/5 hover:border-slate-400 transition-all"
              >
                Get Started Free
              </Link>
            </div>

            {/* Stats bar */}
            <div className="fade-in-up mt-14 flex flex-wrap justify-center gap-8 md:gap-12" style={{ animationDelay: "0.4s" }}>
              {[
                { value: "500+", label: "Participants" },
                { value: "50+", label: "Events Hosted" },
                { value: "20+", label: "Organizers" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-extrabold text-white">{s.value}</p>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80V40C240 -5 480 75 720 40C960 5 1200 75 1440 40V80H0Z" fill="#f8f9fc" />
          </svg>
        </div>
      </section>

      {/* ── Events Section ── */}
      <section id="events" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Upcoming Events
            </h2>
            <p className="text-slate-500 mt-2 text-base">
              Browse the latest hackathons, competitions, and programs
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.1)" }}>
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            </div>
            <p className="text-slate-500 font-medium">Fetching the latest events...</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="rounded-2xl p-10 text-center border border-red-200" style={{ background: "rgba(239,68,68,0.04)" }}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)" }}>
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-red-600 font-semibold text-lg mb-2">Something went wrong</p>
            <p className="text-red-400 text-sm mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-full text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && events.length === 0 && (
          <div className="rounded-3xl p-16 text-center border border-slate-200" style={{ background: "rgba(99,102,241,0.02)" }}>
            <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(99,102,241,0.1)" }}>
              <Calendar className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No events available right now</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Check back soon or explore our past events. We're constantly adding new opportunities.
            </p>
          </div>
        )}

        {/* Event Cards Grid */}
        {!isLoading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {events.map((event, i) => {
              const statusConfig = getStatusConfig(event.status);
              return (
                <div
                  key={event._id}
                  className="fade-in-up group relative bg-white rounded-2xl overflow-hidden card-hover border border-slate-100"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {/* Poster */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    {event.posterUrl ? (
                      <img
                        src={event.posterUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #eef2ff, #e0e7ff)" }}
                      >
                        <Calendar className="w-12 h-12 text-indigo-300" />
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md"
                        style={{ background: "rgba(255,255,255,0.9)", color: statusConfig.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusConfig.color }} />
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Type badge */}
                    {event.eventType && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-md"
                          style={{ background: "rgba(0,0,0,0.4)" }}>
                          {event.eventType}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 mb-1.5 line-clamp-1 group-hover:text-indigo-600 transition-colors duration-200">
                      {event.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed min-h-[2.5rem]">
                      {event.description || "No description provided."}
                    </p>

                    <div className="space-y-2 mb-5">
                      <div className="flex items-center text-sm text-slate-600 gap-2">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        <span className="font-medium">{formatDate(event.startDate)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center text-sm text-slate-600 gap-2">
                          <MapPin className="w-4 h-4 text-indigo-400" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.availableSeats !== undefined && (
                        <div className="flex items-center text-sm text-slate-600 gap-2">
                          <Users className="w-4 h-4 text-indigo-400" />
                          <span>{event.availableSeats} seats remaining</span>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <Link to={`/events/${event._id}`} className="block">
                      <button
                        className="w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group-hover:shadow-lg"
                        style={{
                          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          color: "white",
                          boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
                        }}
                      >
                        <span className="flex items-center justify-center gap-2">
                          View Details
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
