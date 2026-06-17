import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eventsApi } from "../../api/events.api";
import { useAuth } from "../../auth/AuthContext";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { PlusCircle, Settings, Users } from "lucide-react";

export function MyEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.getMyEvents()
      .then((res: any) => setEvents(res.data.data))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Managed Events</h2>
          <p className="text-secondary mt-1">Manage events you've created.</p>
        </div>
        {/* Placeholder link for creation, usually handled in settings or new wizard */}
        <Link to="/events/create">
          <Button className="gap-2"><PlusCircle size={18} /> Create Event</Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-secondary mb-4">You aren't managing any events.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event._id} className="flex flex-col h-full hover:shadow-elevated transition-shadow">
              <CardHeader className="flex-none">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                  <Badge variant={event.status === 'PUBLISHED' ? 'success' : 'secondary'}>
                    {event.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2 text-sm text-secondary">
                  <div className="flex justify-between">
                    <span>Visibility:</span>
                    <span className="font-medium text-slate-900">{event.isPublic ? 'Public' : 'Private'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium text-slate-900">{event.isCompetition ? 'Competition' : 'General'}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t border-secondary/10 flex gap-2">
                <Link to={`/events/${event._id}/analytics`} className="flex-1">
                  <Button variant="outline" className="w-full gap-2">
                    <Settings size={16} /> Manage
                  </Button>
                </Link>
                <Link to={`/events/${event._id}/participants`} className="flex-1">
                  <Button variant="secondary" className="w-full gap-2">
                    <Users size={16} /> Users
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
