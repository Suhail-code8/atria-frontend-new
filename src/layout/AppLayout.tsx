import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/ui/Button";
import { NotificationBell } from "../components/notifications/NotificationBell";


export function AppLayout() {
  const { user, setUser, setAccessToken } = useAuth();

  const handleLogout = () => {
    setUser(null);
    setAccessToken(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="bg-surface shadow-[0_2px_8px_rgba(0,0,0,0.05)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-primary font-bold text-xl tracking-tight">
            atria
          </Link>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Events link — shown to all authenticated users */}
                <Link to="/" id="nav-events">
                  <Button variant="ghost" size="sm">Events</Button>
                </Link>

                {/* Participant links */}
                {user.role === 'PARTICIPANT' && (
                  <Link to="/dashboard/registrations" id="nav-my-registrations">
                    <Button variant="ghost" size="sm">My Registrations</Button>
                  </Link>
                )}

                {/* Organizer links */}
                {user.role === 'ORGANIZER' && (
                  <>
                    <Link to="/dashboard/events" id="nav-my-events">
                      <Button variant="ghost" size="sm">My Events</Button>
                    </Link>
                    <Link to="/events/create" id="nav-create-event">
                      <Button size="sm">+ Create Event</Button>
                    </Link>
                  </>
                )}

                {/* Judge links — only shown if route exists */}
                {user.role === 'JUDGE' && (
                  <Link to="/dashboard/assignments" id="nav-my-assignments">
                    <Button variant="ghost" size="sm">My Assignments</Button>
                  </Link>
                )}

                <div className="mx-2">
                  <NotificationBell />
                </div>
                <div className="flex items-center gap-3 ml-2 border-l border-secondary/20 pl-4">
                  <span className="text-sm font-medium text-slate-900">{user.name || "User"}</span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>Log out</Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/" id="nav-events-public">
                  <Button variant="ghost" size="sm">Events</Button>
                </Link>
                <Link to="/login" id="nav-login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link to="/register" id="nav-register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      
      <footer className="bg-surface border-t border-secondary/10 py-8 text-center text-sm text-secondary">
        <p>&copy; {new Date().getFullYear()} Atria. All rights reserved.</p>
      </footer>
    </div>
  );
}
