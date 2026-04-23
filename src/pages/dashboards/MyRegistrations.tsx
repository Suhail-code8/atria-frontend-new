import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { participationApi } from "../../api/participation.api";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Calendar } from "lucide-react";

export function MyRegistrations() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    participationApi.getMyRegistrations()
      .then((res: any) => setRegistrations(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Registrations</h2>
        <p className="text-secondary mt-1">Events and competitions you are participating in.</p>
      </div>

      {registrations.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-secondary mb-4">You haven't registered for any events yet.</p>
            <Link to="/">
              <Button>Discover Events</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registrations.map((participation) => (
            <Card key={participation._id} className="flex flex-col h-full hover:shadow-elevated transition-shadow">
              {participation.event?.bannerUrl && (
                <div className="h-32 w-full overflow-hidden rounded-t-xl">
                  <img src={participation.event.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                </div>
              )}
              <CardHeader className="flex-none">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <CardTitle className="line-clamp-2">{participation.event?.title || 'Unknown Event'}</CardTitle>
                  <Badge variant={participation.status === 'CONFIRMED' ? 'success' : 'secondary'}>
                    {participation.status}
                  </Badge>
                </div>
                <div className="flex items-center text-xs text-secondary gap-1">
                  <Calendar size={14} />
                  <span>{participation.event ? new Date(participation.event.startDate).toLocaleDateString() : 'Date TBD'}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-secondary line-clamp-3">{participation.event?.description || 'This event profile is no longer available.'}</p>
              </CardContent>
              <CardFooter className="pt-4 border-t border-secondary/10">
                {participation.event ? (
                  <Link to={`/events/${participation.event._id}/dashboard`} className="w-full">
                    <Button variant="outline" className="w-full">Go to Dashboard</Button>
                  </Link>
                ) : (
                  <Button variant="ghost" disabled className="w-full italic">Unavailable</Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
