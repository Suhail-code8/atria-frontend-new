import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy, Star, Users, Upload, Megaphone, CheckCircle2, Lock,
  Clock, ExternalLink, User, Gavel, FileText,
  LayoutGrid, Bell
} from "lucide-react";
import { participationApi } from "../../api/participation.api";
import { submissionsApi } from "../../api/submissions.api";
import { announcementApi } from "../../api/announcement.api";
import { resultApi } from "../../api/result.api";
import { teamApi } from "../../api/team.api";
import { competitionApi } from "../../api/competition.api";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

interface PersistentDashboardProps {
  event: any;
  participation: any;
  featureModules?: {
    leaderboard?:     { enabled: boolean; config?: any };
    judgingFeedback?: { enabled: boolean; config?: any };
    teamHub?:         { enabled: boolean; config?: any };
    announcements?:   { enabled: boolean; config?: any };
  };
}

// ─── Animation helpers ────────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as any }
  })
};

// ─── Sub-widgets ──────────────────────────────────────────────────────────────

function TeamHubCard({ team, loading, nodeConfig }: { eventId: string; userId: string; team: any; loading: boolean; nodeConfig?: any; featureConfig?: any }) {
  if (loading) return <WidgetSkeleton />;

  return (
    <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-violet-50">
        <div className="flex items-center gap-2 text-violet-700">
          <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
            <Users size={16} />
          </div>
          <span className="font-bold text-sm">Team Hub</span>
        </div>
        {team && <Badge variant="secondary" className="bg-violet-100 text-violet-700 text-[10px]">Active</Badge>}
      </div>
      <div className="p-5">
        {team ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-violet-200">
                {team.name?.charAt(0)?.toUpperCase() || "T"}
              </div>
              <div>
                <p className="font-bold text-slate-900">{team.name}</p>
                <p className="text-xs text-slate-500">{team.members?.length || 0} member{team.members?.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="space-y-2">
              {(team.members || []).slice(0, 4).map((m: any, i: number) => {
                const u = typeof m.user === 'object' ? m.user : { name: "Member" };
                return (
                  <div key={i} className="flex items-center gap-2 py-1.5">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                      <User size={12} className="text-slate-500" />
                    </div>
                    <span className="text-xs text-slate-700 font-medium truncate">{u.name || "Member"}</span>
                    {m.role === 'leader' && (
                      <span className="ml-auto text-[9px] font-bold uppercase text-violet-600 tracking-wide">Leader</span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <Users size={28} className="mx-auto text-violet-200 mb-2" />
            <p className="text-sm text-slate-500">You're not in a team yet.</p>
            {nodeConfig?.teamCreationMode === 'participants_create' ? (
              <Button size="sm" className="mt-3 bg-violet-600 hover:bg-violet-700 text-white">Create or Join Team</Button>
            ) : (
              <p className="text-xs text-slate-400 mt-1">Contact your organizer to be assigned.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LeaderboardCard({ eventId, config }: { eventId: string; config?: any }) {
  const [individual, setIndividual] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [tab, setTab] = useState<'individual' | 'team'>('individual');
  const [loading, setLoading] = useState(true);
  const displayType = config?.displayType || 'individual';

  useEffect(() => {
    const fetches: Promise<any>[] = [];
    if (displayType !== 'team') {
      fetches.push(
        participationApi.getEventLeaderboard(eventId)
          .then(r => setIndividual(r.data.data || []))
          .catch(() => setIndividual([]))
      );
    }
    if (displayType !== 'individual') {
      fetches.push(
        resultApi.getTeamLeaderboard(eventId)
          .then(r => setTeam(r.data.data || []))
          .catch(() => setTeam([]))
      );
    }
    Promise.all(fetches).finally(() => setLoading(false));
  }, [eventId, displayType]);

  if (loading) return <WidgetSkeleton />;

  const visibleTo = config?.visibleTo || 'public';
  if (visibleTo === 'organizers_only') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
        <Lock size={28} className="mx-auto text-slate-200 mb-2" />
        <p className="text-sm font-bold text-slate-700">Leaderboard Not Yet Public</p>
        <p className="text-xs text-slate-400 mt-1">The organizer hasn't released results yet.</p>
      </div>
    );
  }

  const data = tab === 'individual' ? individual : team;
  const rankColor = (i: number) =>
    i === 0 ? "bg-amber-400 text-white" :
    i === 1 ? "bg-slate-300 text-white" :
    i === 2 ? "bg-orange-400 text-white" :
    "bg-slate-100 text-secondary";

  return (
    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-amber-50">
        <div className="flex items-center gap-2 text-amber-600">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <Trophy size={16} />
          </div>
          <span className="font-bold text-sm">Leaderboard</span>
        </div>
        <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px]">Live</Badge>
      </div>

      {displayType === 'both' && (
        <div className="flex gap-1.5 px-5 pt-3">
          {(['individual', 'team'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                tab === t ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              {t === 'individual' ? 'Individuals' : 'Teams'}
            </button>
          ))}
        </div>
      )}

      <div className="p-5 space-y-2">
        {data.length === 0 ? (
          <div className="text-center py-6">
            <Trophy size={32} className="mx-auto text-amber-100 mb-2" />
            <p className="text-xs text-slate-400 italic">No scores recorded yet.</p>
          </div>
        ) : data.slice(0, 5).map((entry: any, i: number) => (
          <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg border ${i === 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${rankColor(i)}`}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{entry.name}</p>
              {entry.team && entry.team !== 'Unassigned' && (
                <p className="text-[9px] text-slate-400 truncate">{entry.team}</p>
              )}
            </div>
            <div className="flex items-center gap-1 text-amber-600 font-bold text-xs shrink-0">
              <Star size={10} fill="currentColor" />
              {entry.individualPoints ?? entry.totalPoints ?? 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubmissionsCard({ eventId }: { eventId: string }) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    submissionsApi.getMySubmission(eventId)
      .then(res => {
        const d = res.data.data;
        setSubmissions(Array.isArray(d) ? d : d ? [d] : []);
      })
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <WidgetSkeleton />;

  const statusColors: Record<string, string> = {
    SUBMITTED:    'bg-blue-100 text-blue-700',
    UNDER_REVIEW: 'bg-amber-100 text-amber-700',
    ACCEPTED:     'bg-emerald-100 text-emerald-700',
    REJECTED:     'bg-red-100 text-red-700',
    DRAFT:        'bg-slate-100 text-slate-600',
  };

  return (
    <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-indigo-50">
        <div className="flex items-center gap-2 text-indigo-600">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Upload size={16} />
          </div>
          <span className="font-bold text-sm">My Submissions</span>
        </div>
        <span className="text-xs text-slate-400 font-medium">{submissions.length} item{submissions.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="p-5">
        {submissions.length === 0 ? (
          <div className="text-center py-4">
            <FileText size={28} className="mx-auto text-indigo-100 mb-2" />
            <p className="text-xs text-slate-400 italic">No submissions yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub: any) => (
              <div key={sub._id} className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={14} className="text-indigo-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{sub.title || "Submission"}</p>
                    <p className="text-[10px] text-slate-400">{new Date(sub.createdAt || sub.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${statusColors[sub.status] || 'bg-slate-100 text-slate-600'}`}>
                  {sub.status?.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function JudgingFeedbackCard({ eventId, config }: { eventId: string; config?: any }) {
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    submissionsApi.getMySubmission(eventId)
      .then(res => {
        const d = res.data.data;
        const s = Array.isArray(d) && d.length > 0 ? d[0] : d;
        setSubmission(s || null);
      })
      .catch(() => setSubmission(null))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <WidgetSkeleton />;

  const review = submission?.review;
  const visibleTo = config?.visibleTo || 'public';
  const showRubricBreakdown = config?.showRubricBreakdown !== false;

  if (visibleTo === 'organizers_only') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
        <Lock size={28} className="mx-auto text-slate-200 mb-2" />
        <p className="text-sm font-bold text-slate-700">Feedback Hidden</p>
        <p className="text-xs text-slate-400 mt-1">The organizer has restricted visibility.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-rose-50">
        <div className="flex items-center gap-2 text-rose-600">
          <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
            <Gavel size={16} />
          </div>
          <span className="font-bold text-sm">Judging Feedback</span>
        </div>
        <Badge variant="secondary" className={`text-[10px] ${review ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {review ? 'Graded' : 'Pending'}
        </Badge>
      </div>
      <div className="p-5">
        {review ? (
          <div className="space-y-3">
            <div className="text-center py-4 bg-rose-50 rounded-xl border border-rose-100">
              <div className="text-3xl font-black text-slate-900 mb-0.5">{review.score}<span className="text-base font-medium text-slate-400"> / 100</span></div>
              <p className="text-[11px] text-rose-600 font-semibold uppercase tracking-widest">Final Score</p>
            </div>
            {review.comment && showRubricBreakdown && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1.5">Judge's Comment</p>
                <p className="text-xs text-slate-700 leading-relaxed italic">"{review.comment}"</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <Gavel size={28} className="mx-auto text-rose-100 mb-2" />
            <p className="text-sm font-bold text-slate-700">Under Review</p>
            <p className="text-xs text-slate-400 mt-1">Judges are evaluating your submission. You'll be notified when results are published.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AnnouncementsCard({ eventId }: { eventId: string; config?: any }) {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    announcementApi.getForEvent(eventId)
      .then(res => setAnnouncements(res.data.data || []))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <WidgetSkeleton />;

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-blue-50">
        <div className="flex items-center gap-2 text-blue-600">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Bell size={16} />
          </div>
          <span className="font-bold text-sm">Announcements</span>
        </div>
        {announcements.length > 0 && (
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
        )}
      </div>
      <div className="p-5 space-y-3 max-h-64 overflow-y-auto no-scrollbar">
        {announcements.length === 0 ? (
          <div className="text-center py-4">
            <Megaphone size={28} className="mx-auto text-blue-100 mb-2" />
            <p className="text-xs text-slate-400 italic">No announcements yet.</p>
          </div>
        ) : (
          announcements.slice(0, 5).map((ann: any) => (
            <div key={ann._id} className="border-l-2 border-blue-300 pl-3 py-0.5">
              <p className="text-xs font-bold text-slate-900 line-clamp-1">{ann.title}</p>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{ann.content}</p>
              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400">
                <Clock size={10} />
                {new Date(ann.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CompetitionEntriesCard({ eventId, team, userId }: { eventId: string; team: any; userId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const isLeader = team?.leaderId?._id === userId || team?.leaderId === userId;

  const refreshData = async () => {
    try {
      const [itemsRes, enrollRes] = await Promise.all([
        competitionApi.getItems(eventId),
        teamApi.getTeamEnrollments(team._id)
      ]);
      setItems(itemsRes.data.data || []);
      setEnrollments(enrollRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch competition data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (team?._id) refreshData();
  }, [eventId, team?._id]);

  if (!team?._id) return null;
  if (loading) return <WidgetSkeleton />;

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-50">
        <div className="flex items-center gap-2 text-emerald-700">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Trophy size={16} />
          </div>
          <span className="font-bold text-sm">Competition Entries</span>
        </div>
      </div>
      <div className="p-5 space-y-4">
        {items.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">No competition tracks available for this event.</p>
        ) : (
          items.map((item) => {
            const entry = enrollments.find(e => 
              (typeof e.item === 'object' ? e.item._id : e.item) === item._id
            );
            const enrolledMembers = entry?.participants || [];

            return (
              <div key={item._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">{item.type} Enrollment</p>
                  <div className="flex -space-x-1.5 mt-2 overflow-hidden">
                    {enrolledMembers.length > 0 ? (
                      enrolledMembers.map((m: any, idx: number) => (
                        <div key={idx} className="w-5 h-5 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-[8px] text-white font-bold" title={m.name}>
                          {m.name?.charAt(0)}
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-400 italic font-normal">No members assigned</p>
                    )}
                  </div>
                </div>
                {isLeader && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-[10px] border-emerald-100 text-emerald-700 hover:bg-emerald-50 shrink-0"
                    onClick={() => setSelectedItem(item)}
                  >
                    Manage
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>

      {selectedItem && (
        <MemberAssignmentModal
          item={selectedItem}
          team={team}
          enrollment={enrollments.find(e => (typeof e.item === 'object' ? e.item._id : e.item) === selectedItem._id)}
          onClose={() => setSelectedItem(null)}
          onUpdate={() => {
            setSelectedItem(null);
            refreshData();
          }}
        />
      )}
    </div>
  );
}

function MemberAssignmentModal({ item, team, enrollment, onClose, onUpdate }: any) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    enrollment?.participants?.map((p: any) => typeof p === 'object' ? p._id : p) || []
  );
  const [saving, setSaving] = useState(false);

  const toggleMember = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      // Check limits
      if (item.maxParticipantsPerTeam && selectedIds.length >= item.maxParticipantsPerTeam) return;
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await teamApi.updateItemMembers(team._id, item._id, selectedIds);
      onUpdate();
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900">Manage Enrollment</h3>
            <p className="text-xs text-slate-500 mt-0.5">{item.name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full w-8 h-8 p-0">✕</Button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
            Select team members who will participate in this track. 
            {item.maxParticipantsPerTeam && ` Limit: ${item.maxParticipantsPerTeam} members.`}
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 no-scrollbar">
            {team.members.map((m: any) => {
              const u = typeof m.user === 'object' ? m.user : { name: "Unknown" };
              const id = u._id;
              const isSelected = selectedIds.includes(id);

              return (
                <div 
                  key={id} 
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-100 hover:border-slate-200"
                  }`}
                  onClick={() => toggleMember(id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isSelected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {u.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{u.name}</p>
                      <p className="text-[10px] text-slate-500">{u.email}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? "bg-emerald-500 border-emerald-500" : "border-slate-200"
                  }`}>
                    {isSelected && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Cancel</Button>
          <Button 
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-100" 
            onClick={handleSave} 
            disabled={saving}
          >
            {saving ? "Saving..." : "Update Entry"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function WidgetSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3 animate-pulse">
      <div className="h-4 bg-slate-100 rounded w-1/3" />
      <div className="h-3 bg-slate-100 rounded w-2/3" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PersistentDashboard({ event, participation, featureModules = {} }: PersistentDashboardProps) {
  const eventId = event._id;
  const userId = typeof participation.user === 'object' ? participation.user._id : participation.user;
  const fm = featureModules;
  const showLeaderboard     = fm.leaderboard?.enabled;
  const showJudgingFeedback = fm.judgingFeedback?.enabled;
  const showTeamHub         = fm.teamHub?.enabled;
  const showAnnouncements   = fm.announcements?.enabled;

  const [team, setTeam] = useState<any>(null);
  const [loadingTeam, setLoadingTeam] = useState(true);

  useEffect(() => {
    teamApi.getEventTeams(eventId)
      .then(res => {
        const teams: any[] = res.data.data || [];
        const myTeam = teams.find(t =>
          (t.members || []).some((m: any) => {
            const uid = typeof m.user === 'object' ? m.user._id : m.user;
            return uid === userId || uid?.toString() === userId;
          })
        );
        setTeam(myTeam || null);
      })
      .catch(() => setTeam(null))
      .finally(() => setLoadingTeam(false));
  }, [eventId, userId]);

  const teamNode = event.workflow?.nodes?.find((n: any) => n.type === 'TEAM_FORMATION');
  
  // All active widgets
  const widgets = [
    showTeamHub         && { key: 'teamHub',         node: <TeamHubCard eventId={eventId} userId={userId} team={team} loading={loadingTeam} nodeConfig={teamNode?.config} featureConfig={fm.teamHub?.config} /> },
    team                && { key: 'entries',         node: <CompetitionEntriesCard eventId={eventId} team={team} userId={userId} /> },
    showLeaderboard     && { key: 'leaderboard',     node: <LeaderboardCard eventId={eventId} config={fm.leaderboard?.config} /> },
    { key: 'submissions', node: <SubmissionsCard eventId={eventId} /> },
    showJudgingFeedback && { key: 'judging',         node: <JudgingFeedbackCard eventId={eventId} config={fm.judgingFeedback?.config} /> },
    showAnnouncements   && { key: 'announcements',   node: <AnnouncementsCard eventId={eventId} config={fm.announcements?.config} /> },
  ].filter(Boolean) as { key: string; node: React.ReactNode }[];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* ── Hero Banner ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl shadow-emerald-100 relative overflow-hidden"
      >
        {/* Decorative rings */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -right-4 -bottom-16 w-48 h-48 bg-white/5 rounded-full" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Onboarding Complete</p>
              <h1 className="text-2xl font-black">{event.title}</h1>
            </div>
          </div>
          <p className="text-emerald-50/90 text-sm max-w-lg leading-relaxed">
            You've completed all onboarding steps. Welcome to your event dashboard — explore the features below.
          </p>

          {/* Quick stats row */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <p className="text-[10px] text-emerald-100 uppercase font-bold tracking-widest">Role</p>
              <p className="font-bold text-sm">{participation.role}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <p className="text-[10px] text-emerald-100 uppercase font-bold tracking-widest">Status</p>
              <p className="font-bold text-sm">{participation.status}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <p className="text-[10px] text-emerald-100 uppercase font-bold tracking-widest">Joined</p>
              <p className="font-bold text-sm">{new Date(participation.registeredAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Section Header ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LayoutGrid size={18} className="text-slate-400" />
          <h2 className="text-lg font-bold text-slate-900">Your Dashboard</h2>
        </div>
        <Link to={`/events/${eventId}`}>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <ExternalLink size={12} />
            Event Page
          </Button>
        </Link>
      </div>

      {/* ── Widget Grid ────────────────────────────────────────────────────── */}
      {widgets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LayoutGrid size={28} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">Dashboard Awaiting Setup</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            The event organizer hasn't enabled any dashboard features yet. Check back later!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {widgets.map(({ key, node }, i) => (
            <motion.div
              key={key}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className={
                // Announcements spans full width if it's the last odd item
                key === 'announcements' && widgets.length % 2 !== 0 && i === widgets.length - 1
                  ? 'md:col-span-2'
                  : ''
              }
            >
              {node}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Help Footer ───────────────────────────────────────────────────── */}
      <div className="mt-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg mb-1 text-indigo-100">Need Help?</h3>
          <p className="text-indigo-50/80 text-xs leading-relaxed max-w-md">
            Stuck or experiencing technical difficulties? Reach out to event organizers via the official communication channels.
          </p>
        </div>
        <Button className="bg-white text-indigo-700 hover:bg-indigo-50 border-none font-bold shadow-sm shrink-0" size="sm">
          Get Support
        </Button>
      </div>
    </div>
  );
}
