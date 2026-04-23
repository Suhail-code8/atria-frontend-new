import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { eventsApi } from "../../api/events.api";
import { participationApi } from "../../api/participation.api";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Calendar, MapPin, Users, IndianRupee } from "lucide-react";

export function EventHub() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [participationStatus, setParticipationStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    
    eventsApi.getEvent(id)
      .then((res: any) => setEvent(res.data.data))
      .catch((err: any) => console.error("Failed to load event:", err))
      .finally(() => setLoading(false));

    if (user) {
      participationApi.getMyParticipation(id)
        .then((res: any) => {
          if (res.data.data) setParticipationStatus(res.data.data.status);
        })
        .catch(() => setParticipationStatus(null));
    }
  }, [id, user]);

  const handleRegisterClick = async () => {
    if (!id) return;
    
    setIsRegistering(true);
    try {
      await participationApi.register(id);
      // Redirect to Participant Dashboard
      navigate(`/events/${id}/dashboard`);
    } catch (err: any) {
      console.error("Registration failed:", err);
      const message = err.response?.data?.message || "Failed to register for the event. Please try again.";
      alert(message);
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading event details...</div>;
  if (!event) return <div className="text-center py-20 text-danger">Event not found.</div>;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Hero Banner */}
      <div className="relative w-full h-[400px] rounded-2xl overflow-hidden mb-8 shadow-elevated">
        <div className="absolute inset-0 bg-slate-900/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
        <img 
          src={event.posterUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2000"} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 p-8 z-20 text-white w-full">
          <div className="flex gap-2 mb-3">
            <Badge variant="success">{event.status}</Badge>
            {event.isCompetition && <Badge variant="default">Competition</Badge>}
            {event.isPaid && <Badge variant="secondary">Paid Event</Badge>}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 text-white">{event.title}</h1>
          <p className="text-lg text-slate-200 line-clamp-2 max-w-3xl">{event.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-surface p-6 rounded-xl shadow-card border border-secondary/10">
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">About the Event</h2>
            <div className="prose text-secondary whitespace-pre-wrap">
              {event.description}
            </div>
          </section>
        </div>

        {/* Sidebar Info Card */}
        <div className="space-y-6">
          <div className="bg-surface p-6 rounded-xl shadow-card border border-secondary/10 sticky top-24">
            <div className="space-y-4 mb-8 text-slate-900">
              <div className="flex items-center gap-3">
                <Calendar className="text-primary w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Date & Time</p>
                  <p className="text-sm text-secondary">{new Date(event.startDate).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="text-primary w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-secondary">Virtual / TBA</p>
                </div>
              </div>

              {event.totalSeats && (
                <div className="flex items-center gap-3">
                  <Users className="text-primary w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Capacity</p>
                    <p className="text-sm text-secondary">{event.availableSeats || 0} / {event.totalSeats} seats</p>
                  </div>
                </div>
              )}

              {event.isPaid && (
                <div className="flex items-center gap-3">
                  <IndianRupee className="text-primary w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Price</p>
                    <p className="text-sm text-secondary">₹{event.price}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-secondary/10">
              {!user ? (
                <Link to="/login" className="block w-full">
                  <Button className="w-full text-lg h-12">Login to Register</Button>
                </Link>
              ) : participationStatus ? (
                <Link to={`/events/${id}/dashboard`} className="block w-full">
                  <Button className="w-full text-lg h-12" variant="secondary">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Button 
                  className="w-full text-lg h-12" 
                  onClick={handleRegisterClick}
                  disabled={isRegistering}
                >
                  {isRegistering ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Registering...</span>
                    </div>
                  ) : (
                    "Register Now"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
