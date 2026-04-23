import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eventsApi } from "../api/events.api";
import { type Event, EventStatus } from "../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Calendar, Users, Loader2 } from "lucide-react";

export function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await eventsApi.listEvents("PUBLISHED");
        setEvents(response.data.data);
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
        return { label: "Registration Open", variant: "success" as const };
      case EventStatus.ONGOING:
        return { label: "Live Now", variant: "default" as const };
      case EventStatus.PUBLISHED:
        return { label: "Upcoming", variant: "secondary" as const };
      case EventStatus.COMPLETED:
        return { label: "Completed", variant: "outline" as const };
      default:
        return { label: status, variant: "outline" as const };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="mb-12 text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
          Discover Events
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl">
          Browse and join amazing hackathons, conferences, and competitions. 
          Your next big challenge starts here.
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-slate-500 font-medium">Fetching the latest events...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && events.length === 0 && (
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-16 text-center">
          <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No events available right now</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Check back soon or explore our past events. We're constantly adding new opportunities.
          </p>
        </div>
      )}

      {/* Events Grid */}
      {!isLoading && !error && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => {
            const statusConfig = getStatusConfig(event.status);
            return (
              <Card key={event._id} className="group flex flex-col h-full border-slate-200 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 overflow-hidden rounded-2xl">
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  {event.posterUrl ? (
                    <img 
                      src={event.posterUrl} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                      <Calendar className="w-12 h-12 opacity-20" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge variant={statusConfig.variant} className="shadow-lg backdrop-blur-md bg-white/90">
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                      {event.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-slate-500 line-clamp-2 min-h-[2.5rem]">
                    {event.description || "No description provided."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow pt-2">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-slate-600 gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    {event.availableSeats !== undefined && (
                      <div className="flex items-center text-sm text-slate-600 gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{event.availableSeats} seats remaining</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-6 border-t border-slate-50">
                  <Link to={`/events/${event._id}`} className="w-full">
                    <Button className="w-full font-bold group-hover:translate-y-[-2px] transition-transform shadow-md">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
