import { Outlet, Link, useParams, useLocation } from "react-router-dom";
import { 
  BarChart, 
  Settings, 
  Image, 
  Megaphone, 
  Users, 
  PenTool, 
  Trophy, 
  UserSquare2, 
  CheckSquare,
  ListPlus,
  Award,
  Gavel
} from "lucide-react";
import { cn } from "../utils/cn";

export function EventLayout() {
  const { id } = useParams();
  const location = useLocation();

  const links = [
    { name: "Analytics", path: "analytics", icon: <BarChart size={18} /> },
    { name: "Settings", path: "settings", icon: <Settings size={18} /> },
    { name: "Promotion", path: "promotion", icon: <Image size={18} /> },
    { name: "Announcements", path: "announcements", icon: <Megaphone size={18} /> },
    { name: "Event Tracks", path: "competitions", icon: <ListPlus size={18} /> },
    { name: "Teams Hub", path: "teams", icon: <Users size={18} /> },
    { name: "Judges", path: "judges", icon: <Gavel size={18} /> },
    { name: "Workflow Builder", path: "builder", icon: <PenTool size={18} /> },
    { name: "Participants", path: "participants", icon: <UserSquare2 size={18} /> },
    { name: "Review Queue", path: "review", icon: <CheckSquare size={18} /> },
    { name: "Scoring Console", path: "scoring", icon: <Trophy size={18} /> },
    // { name: "Manual Results", path: "manual-results", icon: <Award size={18} /> },
    { name: "Leaderboard", path: "leaderboard", icon: <Trophy size={18} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex bg-background rounded-xl overflow-hidden min-h-[80vh] border border-secondary/10 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-secondary/10 flex flex-col p-4">
        <div className="mb-6 px-3">
          <h2 className="text-xs font-bold tracking-wider text-secondary uppercase">Event Management</h2>
        </div>
        <nav className="flex-1 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname.includes(`/events/${id}/${link.path}`);
            return (
              <Link
                key={link.name}
                to={`/events/${id}/${link.path}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors font-medium",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-secondary hover:bg-secondary/10 hover:text-slate-900"
                )}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto bg-background">
        <Outlet />
      </main>
    </div>
    </div>
  );
}
