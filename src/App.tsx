import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { AppLayout } from "./layout/AppLayout";
import { EventLayout } from "./layout/EventLayout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { MyRegistrations } from "./pages/dashboards/MyRegistrations";
import { MyEvents } from "./pages/dashboards/MyEvents";
import { EventHub } from "./pages/events/EventHub";
import { Analytics } from "./pages/events/manage/Analytics";
import { Settings } from "./pages/events/manage/Settings";
import { Promotion } from "./pages/events/manage/Promotion";
import { Announcements } from "./pages/events/manage/Announcements";
import { Teams } from "./pages/events/manage/Teams";
import { Participants } from "./pages/events/manage/Participants";
import { ReviewQueue } from "./pages/events/manage/ReviewQueue";
import { Scoring } from "./pages/events/manage/Scoring";
import { Leaderboard } from "./pages/events/manage/Leaderboard";
import { WorkflowBuilder } from "./pages/events/manage/WorkflowBuilder";
import { CreateEvent } from "./pages/events/manage/CreateEvent";
import { ParticipantDashboard } from "./pages/events/ParticipantDashboard";
import { CompetitionsSetup } from "./pages/events/manage/CompetitionsSetup";
import { ManualResults } from "./pages/events/manage/ManualResults";
import { Judges } from "./pages/events/manage/Judges";
import { JudgeAssignments } from "./pages/dashboards/JudgeAssignments";
import { JudgeEventConsole } from "./pages/events/JudgeEventConsole";
import { useEffect, useState } from "react";
import { judgeApi } from "./api/judge.api";

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'rgba(99,102,241,0.2)', borderTopColor: '#6366f1' }} />
      <p className="text-slate-500 text-sm font-medium animate-pulse">Verifying session...</p>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

const JudgeProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [isAssigned, setIsAssigned] = useState<boolean | null>(null);

  useEffect(() => {
    if (user && id && user.role === 'JUDGE') {
      judgeApi.getMyAssignment(id)
        .then(res => setIsAssigned(!!res.data.data))
        .catch(() => setIsAssigned(false));
    } else if (user && id && user.role !== 'JUDGE') {
      setIsAssigned(false);
    }
  }, [user, id]);

  if (isLoading || isAssigned === null) return <div className="p-20 text-center font-bold animate-pulse uppercase tracking-[0.2em] text-slate-400">Verifying Judge Credentials...</div>;
  if (!user || user.role !== 'JUDGE') return <Navigate to="/login" replace />;
  if (!isAssigned) return <Navigate to="/dashboard/assignments" replace />;

  return <>{children}</>;
};

const ParticipantDashboardGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (user?.role === 'JUDGE') return <Navigate to="/dashboard/assignments" replace />;
  return <>{children}</>;
};

const DashboardEventRedirect = () => {
  const { id, "*": subPath } = useParams();
  const { user } = useAuth();
  
  if (user?.role === 'ORGANIZER') {
    const target = subPath ? `/events/${id}/${subPath}` : `/events/${id}/analytics`;
    return <Navigate to={target} replace />;
  }
  
  return <Navigate to={`/events/${id}/dashboard`} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<AppLayout />}>
            {/* Public Routes */}
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Protected Routes - Participant & Dashboards */}
            <Route path="dashboard/registrations" element={<ProtectedRoute roles={['PARTICIPANT']}><MyRegistrations /></ProtectedRoute>} />
            <Route path="dashboard/events" element={<ProtectedRoute roles={['ORGANIZER']}><MyEvents /></ProtectedRoute>} />
            <Route path="dashboard/events/:id/*" element={<ProtectedRoute roles={['ORGANIZER']}><DashboardEventRedirect /></ProtectedRoute>} />
            <Route path="dashboard/assignments" element={<ProtectedRoute roles={['JUDGE']}><JudgeAssignments /></ProtectedRoute>} />
            
            {/* Event Hub Public view */}
            <Route path="events/:id" element={<EventHub />} />

            {/* Event Management (Organizer) */}
            <Route path="events/:id" element={<ProtectedRoute roles={['ORGANIZER']}><EventLayout /></ProtectedRoute>}>
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="promotion" element={<Promotion />} />
              <Route path="announcements" element={<Announcements />} />
              <Route path="competitions" element={<CompetitionsSetup />} />
              <Route path="teams" element={<Teams />} />
              <Route path="judges" element={<Judges />} />
              <Route path="builder" element={<WorkflowBuilder />} />
              <Route path="participants" element={<Participants />} />
              <Route path="review" element={<ReviewQueue />} />
              <Route path="scoring" element={<Scoring />} />
              <Route path="manual-results" element={<ManualResults />} />
              <Route path="leaderboard" element={<Leaderboard />} />
            </Route>
            
            {/* Participant Event Dashboard */}
            <Route path="events/:id/dashboard" element={<ProtectedRoute><ParticipantDashboardGuard><ParticipantDashboard /></ParticipantDashboardGuard></ProtectedRoute>} />
            
            {/* Judge Event Console */}
            <Route path="events/:id/judge" element={<JudgeProtectedRoute><JudgeEventConsole /></JudgeProtectedRoute>} />

            <Route path="events/create" element={<ProtectedRoute roles={['ORGANIZER']}><CreateEvent /></ProtectedRoute>} />
          </Route>
        </Routes>
    </BrowserRouter>
  );
}

export default App;
