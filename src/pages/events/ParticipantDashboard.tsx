import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { participationApi } from "../../api/participation.api";
import { eventsApi } from "../../api/events.api";
import { ModuleRenderers } from "../../modules/ModuleRegistry";
import { Progress } from "../../components/ui/Progress";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  AlertCircle, ChevronRight, LayoutDashboard, Sparkles, Map,
  Megaphone, Clock, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CompetitionEnrollmentCard } from "../../components/CompetitionEnrollmentCard";
import { announcementApi } from "../../api/announcement.api";
import { PersistentDashboard } from "./PersistentDashboard";

export function ParticipantDashboard() {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [participation, setParticipation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRegressing, setIsRegressing] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const fetchData = async () => {
    if (!id) return;
    try {
      const [evRes, partRes, annRes] = await Promise.all([
        eventsApi.getEvent(id),
        participationApi.getMyParticipation(id),
        announcementApi.getForEvent(id)
      ]);
      setEvent(evRes.data.data);
      setParticipation(partRes.data.data);
      setAnnouncements(annRes.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdvance = async () => {
    if (!participation || isAdvancing) return;
    setIsAdvancing(true);
    try {
      const res = await participationApi.advance(participation._id);
      setParticipation(res.data.data.participation);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to advance");
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleRegress = async () => {
    if (!participation || isRegressing) return;
    setIsRegressing(true);
    try {
      const res = await participationApi.regress(participation._id);
      setParticipation(res.data.data.participation);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to move back");
    } finally {
      setIsRegressing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-secondary font-medium animate-pulse">Syncing your journey...</p>
    </div>
  );

  if (error || !participation) return (
    <div className="max-w-md mx-auto py-20 text-center">
      <div className="bg-danger/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-danger/20">
        <AlertCircle className="text-danger" size={32} />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
      <p className="text-secondary mb-8">{error || "You must be registered for this event to view the dashboard."}</p>
      <Link to={`/events/${id}`}>
        <Button className="w-full">Return to Event Hub</Button>
      </Link>
    </div>
  );

  // ─── Waitlist View ────────────────────────────────────────────────────────
  if (participation.status === "WAITLISTED") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
           <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-12 text-center text-white">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <Sparkles size={40} />
              </div>
              <h1 className="text-4xl font-black mb-4">You're on the Waitlist!</h1>
              <p className="text-amber-50 text-lg max-w-xl mx-auto opacity-90">
                This event is currently at full capacity. You've been placed in the queue and we'll notify you as soon as a spot opens up.
              </p>
           </div>
           
           <div className="p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Status</h3>
                    <p className="text-amber-600 font-bold text-xl uppercase">Queued</p>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Priority</h3>
                    <p className="text-slate-900 font-bold text-xl uppercase">Standard</p>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Queue ID</h3>
                    <p className="text-slate-900 font-bold text-xl uppercase">#{participation._id.slice(-4).toUpperCase()}</p>
                 </div>
              </div>
              
              <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-slate-100">
                 <p className="text-secondary text-sm">Want to look around at other events? Check the hub.</p>
                 <div className="flex gap-4">
                    <Link to="/events"><Button variant="outline">Browse Events</Button></Link>
                    <Link to="/dashboard"><Button>My Dashboard</Button></Link>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }
  // ─── Pending Approval View ────────────────────────────────────────────────
  if (participation.status === "PENDING_APPROVAL") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
           <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-12 text-center text-white">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <Clock size={40} />
              </div>
              <h1 className="text-4xl font-black mb-4">Awaiting Approval</h1>
              <p className="text-blue-50 text-lg max-w-xl mx-auto opacity-90">
                The organizer is currently reviewing your registration. We'll notify you as soon as you're approved to proceed.
              </p>
           </div>
           
           <div className="p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Status</h3>
                    <p className="text-blue-600 font-bold text-xl uppercase">Pending</p>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Role</h3>
                    <p className="text-slate-900 font-bold text-xl uppercase">{participation.role}</p>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Joined</h3>
                    <p className="text-slate-900 font-bold text-xl uppercase">{new Date(participation.registeredAt).toLocaleDateString()}</p>
                 </div>
              </div>
              
              <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-slate-100">
                 <p className="text-secondary text-sm">You'll receive an email once an organizer takes action.</p>
                 <div className="flex gap-4">
                    <Link to="/events"><Button variant="outline">Browse Events</Button></Link>
                    <Link to="/dashboard"><Button>My Dashboard</Button></Link>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  const workflow = event?.workflow || { nodes: [], edges: [] };
  const allNodes = workflow.nodes || [];

  // ─── Empty Workflow ───────────────────────────────────────────────────────
  if (allNodes.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="bg-slate-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-12">
          <Map className="text-secondary" size={36} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Under Construction</h2>
        <p className="text-secondary text-lg mb-8">The event organizer hasn't set up the journey yet. Please check back later!</p>
        <Link to="/dashboard/registrations"><Button variant="outline">Back to My Registrations</Button></Link>
      </div>
    );
  }

  // ─── Onboarding Complete — switch to Persistent Dashboard ────────────────
  const isOnboardingComplete =
    participation.workflowState === 'ONBOARDING_COMPLETE' ||
    (!participation.currentWorkflowNodeId && participation.workflowState === 'ONBOARDING_COMPLETE');

  if (isOnboardingComplete) {
    return (
      <PersistentDashboard
        event={event}
        participation={participation}
        featureModules={workflow.featureModules}
      />
    );
  }

  // ─── Sequential Onboarding Flow ───────────────────────────────────────────
  // Separate progress-bar nodes (onboarding steps only) from terminal node
  const progressNodes = allNodes.filter((n: any) => n.type !== 'ONBOARDING_COMPLETE');
  const terminalNode   = allNodes.find((n: any) => n.type === 'ONBOARDING_COMPLETE');

  const currentNodeIndex = progressNodes.findIndex((n: any) => n.id === participation.currentWorkflowNodeId);
  const currentNode = currentNodeIndex !== -1 ? progressNodes[currentNodeIndex] : progressNodes[0];
  const isLastStep = currentNodeIndex === progressNodes.length - 1;

  // Progress calculation: treat ONBOARDING_COMPLETE as the final milestone (+1 for it)
  const totalSteps = progressNodes.length + (terminalNode ? 1 : 0);
  const progress = ((currentNodeIndex + 1) / totalSteps) * 100;

  const lastVisitedNodeId = participation.history?.[participation.history.length - 1]?.nodeId;
  const lastVisitedIndex = progressNodes.findIndex((n: any) => n.id === lastVisitedNodeId);
  const canAdvanceManually = currentNodeIndex < lastVisitedIndex;

  const ActiveModule = ModuleRenderers[currentNode?.type] || (() => <div>Unknown component type: {currentNode?.type}</div>);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-primary font-bold tracking-tight uppercase text-xs">
            <LayoutDashboard size={14} />
            <span>Participant Dashboard</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{event.title}</h1>
          <p className="text-secondary mt-2 flex items-center gap-2 font-medium">
            <Sparkles size={16} className="text-amber-500" />
            Active Step: <span className="text-slate-900">{currentNode?.label || currentNode?.data?.label || currentNode?.type?.replace(/_/g, ' ')}</span>
          </p>
        </div>
        <div className="hidden md:block">
           <Badge variant="outline" className="px-4 py-1.5 border-slate-200 text-slate-600 bg-white shadow-sm">
             ID: {participation._id.slice(-6).toUpperCase()}
           </Badge>
        </div>
      </header>

      {/* Workflow Progress Bar */}
      <div className="mb-12 space-y-4">
        <div className="flex justify-between items-center text-sm font-bold px-1">
          <span className="text-secondary uppercase tracking-widest text-[10px]">Your Progress</span>
          <span className="text-primary">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-3 bg-slate-100" />

        {/* Step indicators */}
        <div className="flex justify-between overflow-x-auto pb-2 gap-4 no-scrollbar">
          {/* Onboarding steps */}
          {progressNodes.map((node: any, idx: number) => {
            const isVisited = participation.history?.some((h: any) => h.nodeId === node.id);
            const isActive = idx === currentNodeIndex;

            return (
              <button
                key={node.id}
                disabled={!isVisited || isActive || isRegressing}
                onClick={() => {
                  const stepsBack = currentNodeIndex - idx;
                  if (stepsBack > 0) handleRegress();
                }}
                className={`flex flex-col items-center min-w-[80px] group transition-all ${
                  isVisited && !isActive ? "cursor-pointer hover:scale-105" : "cursor-default"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isActive     ? "bg-primary text-white shadow-md shadow-primary/20 scale-110" :
                  isVisited    ? "bg-emerald-500 text-white shadow-sm" :
                                 "bg-white border-2 border-slate-200 text-secondary"
                }`}>
                  {idx < currentNodeIndex ? "✓" : idx + 1}
                </div>
                <span className={`text-[10px] mt-2 font-bold uppercase tracking-tight text-center ${
                  isActive ? "text-primary" : "text-secondary opacity-60"
                }`}>
                  {node.label || node.data?.label || node.type?.split('_')[0]}
                </span>
              </button>
            );
          })}

          {/* Onboarding Complete milestone (terminal) */}
          {terminalNode && (
            <div className="flex flex-col items-center min-w-[80px] cursor-default opacity-50">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-dashed border-emerald-300 text-emerald-500 bg-emerald-50">
                <CheckCircle2 size={14} />
              </div>
              <span className="text-[10px] mt-2 font-bold uppercase tracking-tight text-center text-emerald-600 opacity-70">
                Done!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Active Module Container */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
           <AnimatePresence mode="wait">
             <motion.div
               key={currentNode?.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.4, ease: "easeOut" }}
             >
                <ActiveModule
                  config={currentNode?.config || currentNode?.data?.config || {}}
                  participation={participation}
                  registrationForm={event.registrationForm}
                  isLastStep={isLastStep}
                  onAdvanced={(updatedParticipation: any) => {
                    setParticipation(updatedParticipation);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />

                {/* Workflow Navigation Controls */}
                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={handleRegress}
                     disabled={currentNodeIndex === 0 || isRegressing}
                     className="text-secondary hover:text-slate-900 gap-2"
                   >
                     {isRegressing ? "Moving back..." : "← Previous Step"}
                   </Button>

                   <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest hidden sm:block">
                     Step {currentNodeIndex + 1} of {progressNodes.length}
                   </p>

                   {canAdvanceManually && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAdvance}
                        disabled={isAdvancing}
                        className="text-primary hover:text-primary/80 gap-2 font-bold"
                      >
                        {isAdvancing ? "Moving forward..." : "Next Step →"}
                      </Button>
                   )}
                </div>
             </motion.div>
           </AnimatePresence>

           {id && participation.user && (
             <div className="mt-12 bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
               <CompetitionEnrollmentCard eventId={id} userId={participation.user._id || participation.user} />
             </div>
           )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
           <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ChevronRight size={18} className="text-primary" />
                Quick Info
              </h3>
              <div className="space-y-4 text-sm">
                 <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-secondary">Role</span>
                    <span className="font-bold text-slate-900">{participation.role}</span>
                 </div>
                 <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-secondary">Status</span>
                    <span className="font-bold text-primary">{participation.status}</span>
                 </div>
                 <div className="flex justify-between py-2">
                    <span className="text-secondary">Joined On</span>
                    <span className="font-bold text-slate-900">{new Date(participation.registeredAt).toLocaleDateString()}</span>
                 </div>
              </div>
              <div className="mt-6">
                 <Link to={`/events/${id}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs transition-all hover:bg-slate-50">View Original Event Description</Button>
                 </Link>
              </div>
           </div>

           {/* Announcements Sidebar Widget */}
           <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Megaphone size={18} className="text-blue-500" />
                  Latest Updates
                </h3>
                {announcements.length > 0 && (
                  <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                )}
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                 {announcements.length === 0 ? (
                    <div className="text-center py-6">
                       <p className="text-xs text-slate-400 italic">No announcements yet.</p>
                    </div>
                 ) : (
                    announcements.slice(0, 3).map((ann, idx) => (
                       <div key={ann._id} className="group relative">
                          <div className="flex items-start gap-3">
                             <div className="mt-1 w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                             <div>
                                <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors cursor-default">
                                   {ann.title}
                                </h4>
                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                                   {ann.content}
                                </p>
                                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-medium">
                                   <Clock size={10} />
                                   {new Date(ann.createdAt).toLocaleDateString()}
                                </div>
                             </div>
                          </div>
                          {idx !== Math.min(announcements.length, 3) - 1 && (
                             <div className="absolute left-[3px] top-3 bottom-0 w-[1px] bg-slate-100" />
                          )}
                       </div>
                    ))
                 )}
              </div>

              {announcements.length > 3 && (
                 <div className="mt-4 pt-4 border-t border-slate-50 text-center">
                    <button className="text-[11px] font-bold text-primary uppercase tracking-widest hover:underline">
                       View All {announcements.length} Announcements
                    </button>
                 </div>
              )}
           </div>

           <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-indigo-100">
                Help & Support
              </h3>
              <p className="text-indigo-50 text-xs leading-relaxed opacity-80">
                Stuck on a step or experiencing technical difficulties? Reach out to the event organizers via the official discord or email.
              </p>
              <Button className="mt-4 w-full bg-white text-indigo-700 hover:bg-indigo-50 border-none font-bold shadow-sm" size="sm">
                Get Help
              </Button>
           </div>
        </aside>
      </main>
    </div>
  );
}
