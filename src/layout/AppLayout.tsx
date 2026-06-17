import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { NotificationBell } from "../components/notifications/NotificationBell";
import { useState, useEffect } from "react";

export function AppLayout() {
  const { user, setUser, setAccessToken } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const handleLogout = () => {
    setUser(null);
    setAccessToken(null);
  };

  const NavLink = ({ to, id, children }: { to: string; id?: string; children: React.ReactNode }) => (
    <Link
      to={to}
      id={id}
      className="px-3 py-1.5 rounded-full text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
    >
      {children}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f8f9fc" }}>
      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: scrolled ? "1px solid rgba(226,232,240,0.8)" : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.06)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-105 transition-transform"
              style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
            >
              A
            </div>
            <span
              className="font-extrabold text-xl tracking-tight"
              style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              Atria
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                <NavLink to="/" id="nav-events">Events</NavLink>

                {user.role === "PARTICIPANT" && (
                  <NavLink to="/dashboard/registrations" id="nav-my-registrations">My Registrations</NavLink>
                )}
                {user.role === "ORGANIZER" && (
                  <>
                    <NavLink to="/dashboard/events" id="nav-my-events">My Events</NavLink>
                    <Link
                      to="/events/create"
                      id="nav-create-event"
                      className="ml-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
                      style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
                    >
                      + Create Event
                    </Link>
                  </>
                )}
                {user.role === "JUDGE" && (
                  <NavLink to="/dashboard/assignments" id="nav-my-assignments">My Assignments</NavLink>
                )}

                <div className="mx-1">
                  <NotificationBell />
                </div>

                <div className="flex items-center gap-2 ml-2 pl-3 border-l border-slate-200">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow"
                    style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
                  >
                    {(user.name || "U")[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 hidden lg:block">{user.name || "User"}</span>
                  <button
                    onClick={handleLogout}
                    className="ml-1 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 border border-slate-200 transition-all duration-200"
                  >
                    Log out
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/" id="nav-events-public">Events</NavLink>
                <NavLink to="/login" id="nav-login">Log in</NavLink>
                <Link
                  to="/register"
                  id="nav-register"
                  className="ml-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-1 shadow-lg">
            <Link to="/" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Events</Link>
            {user ? (
              <>
                {user.role === "PARTICIPANT" && <Link to="/dashboard/registrations" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">My Registrations</Link>}
                {user.role === "ORGANIZER" && (
                  <>
                    <Link to="/dashboard/events" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">My Events</Link>
                    <Link to="/events/create" className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-600 bg-indigo-50 transition-colors">+ Create Event</Link>
                  </>
                )}
                {user.role === "JUDGE" && <Link to="/dashboard/assignments" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">My Assignments</Link>}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">{user.name || "User"}</span>
                  <button onClick={handleLogout} className="text-xs font-semibold text-red-500 hover:underline">Log out</button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Log in</Link>
                <Link to="/register" className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-center text-white rounded-xl transition-colors" style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}>Sign up</Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* ── Main ── */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: "#0f0c29" }} className="text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg"
                style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
              >
                A
              </div>
              <div>
                <p className="font-bold text-white text-lg leading-none">Atria</p>
                <p className="text-xs text-slate-500 mt-0.5">Event Management Platform</p>
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/" className="hover:text-white transition-colors">Events</Link>
              <Link to="/login" className="hover:text-white transition-colors">Log in</Link>
              <Link to="/register" className="hover:text-white transition-colors">Sign up</Link>
            </div>
            <p className="text-xs text-slate-600">© {new Date().getFullYear()} Atria. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
