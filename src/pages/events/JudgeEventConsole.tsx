import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { judgeApi } from "../../api/judge.api";
import { competitionApi } from "../../api/competition.api";
import { resultApi } from "../../api/result.api";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { 
  Gavel, 
  Trophy, 
  Star, 
  CheckCircle2, 
  Users, 
  User, 
  ChevronLeft, 
  AlertCircle,
  Clock,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function JudgeEventConsole() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [activeItem, setActiveItem] = useState<any>(null);
  
  // Selection state per item
  const [selectedEntryId, setSelectedEntryId] = useState<Record<string, string>>({});
  const [selectedParticipantId, setSelectedParticipantId] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<Record<string, { place?: number; grade?: string }>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (!eventId) return;

    setLoading(true);
    Promise.all([
      judgeApi.getMyAssignment(eventId),
      competitionApi.getEntriesByEvent(eventId),
      resultApi.getEventResults(eventId)
    ])
      .then(([resAss, resEntries, resResults]) => {
        const assData = resAss.data.data;
        if (!assData) {
          navigate("/dashboard/assignments");
          return;
        }
        setAssignment(assData);
        setEntries(resEntries.data.data || []);
        setResults(resResults.data.data || []);
        
        if (assData.assignedItems?.length > 0) {
          setActiveItem(assData.assignedItems[0]);
        }
      })
      .catch(err => {
        console.error("Failed to load judging data", err);
        navigate("/dashboard/assignments");
      })
      .finally(() => setLoading(false));
  }, [eventId, navigate]);

  const handleScoreSubmit = async (item: any) => {
    const entryId = selectedEntryId[item._id];
    const participantId = item.type === 'INDIVIDUAL' ? selectedParticipantId[item._id] : undefined;
    const score = scores[item._id] || {};

    if (!entryId || (item.type === 'INDIVIDUAL' && !participantId) || (!score.place && !score.grade)) {
      return;
    }

    setSubmitting(prev => ({ ...prev, [item._id]: true }));
    try {
      await resultApi.addResult({
        eventId: eventId!,
        itemId: item._id,
        entryId,
        participantId,
        place: score.place,
        grade: score.grade
      });
      
      // Refresh results
      const resResults = await resultApi.getEventResults(eventId!);
      setResults(resResults.data.data);
      
      // Reset current selections
      setScores(prev => ({ ...prev, [item._id]: {} }));
      if (item.type === 'INDIVIDUAL') {
        setSelectedParticipantId(prev => ({ ...prev, [item._id]: "" }));
      } else {
        setSelectedEntryId(prev => ({ ...prev, [item._id]: "" }));
      }
      
      // Show mini toast or pulse effect could be added here
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit score");
    } finally {
      setSubmitting(prev => ({ ...prev, [item._id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Initializing Console...</p>
      </div>
    );
  }

  // Filter entries for the active track
  const filteredEntries = entries.filter(e => {
    const trackId = typeof e.item === 'object' ? e.item._id : e.item;
    return trackId === activeItem?._id;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 min-h-screen flex flex-col">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/assignments")} className="rounded-xl px-2">
            <ChevronLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-indigo-600 text-white border-none text-[10px] uppercase font-black px-2 py-0">Judge Console</Badge>
              <span className="text-slate-300">/</span>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">{(assignment.event as any)?.title}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Gavel size={24} className="text-indigo-600" />
              Scoring Workspace
            </h1>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Assignment</p>
              <p className="text-sm font-bold text-slate-900">{assignment.assignedItems?.length} Evaluation Tracks</p>
           </div>
           <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
              <Activity size={20} />
           </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
        {/* Sidebar: Track List */}
        <aside className="lg:col-span-3 space-y-3 order-2 lg:order-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Assigned Tracks</p>
          {assignment.assignedItems?.map((item: any) => (
            <button
              key={item._id}
              onClick={() => setActiveItem(item)}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                activeItem?._id === item._id 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200' 
                  : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              <div className="space-y-0.5">
                <span className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${activeItem?._id === item._id ? 'text-indigo-100' : ''}`}>
                  {item.type}
                </span>
                <p className="font-bold tracking-tight text-sm line-clamp-1">{item.name}</p>
              </div>
              <ChevronRight size={16} className={`${activeItem?._id === item._id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`} />
            </button>
          ))}
        </aside>

        {/* Central Workspace: Scoring */}
        <section className="lg:col-span-9 space-y-6 order-1 lg:order-2">
          {activeItem ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem._id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 flex justify-between items-center">
                    <div>
                      <Badge className="bg-white/10 text-white/80 border-none mb-3 text-[9px] font-black uppercase tracking-widest">Now Evaluating</Badge>
                      <h2 className="text-3xl font-black text-white tracking-tighter">{activeItem.name}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                       <Badge variant="outline" className="border-white/20 text-white/60 text-[10px] font-black">{activeItem.type}</Badge>
                       <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50">
                          <BookOpen size={24} />
                       </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    {/* Selection Flow */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {/* 1. Entry Selection */}
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <Users size={14} /> 1. Select Team / Entry
                          </label>
                          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                             {filteredEntries.length === 0 ? (
                               <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                  <AlertCircle size={24} className="text-slate-300 mx-auto mb-2" />
                                  <p className="text-xs font-bold text-slate-400 uppercase">No entries for this track</p>
                               </div>
                             ) : (
                               filteredEntries.map(entry => {
                                 const isSelected = selectedEntryId[activeItem._id] === entry._id;
                                 const teamMatch = entry.team && (typeof entry.team === 'object' ? entry.team.name : 'Team');
                                 return (
                                   <button
                                     key={entry._id}
                                     onClick={() => setSelectedEntryId(prev => ({ ...prev, [activeItem._id]: entry._id }))}
                                     className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                       isSelected 
                                         ? 'bg-indigo-50 border-indigo-600 shadow-md ring-4 ring-indigo-50/50' 
                                         : 'bg-white border-slate-100 hover:border-indigo-200'
                                     }`}
                                   >
                                      <div className="flex items-center gap-3">
                                         <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            {(teamMatch || 'E').charAt(0).toUpperCase()}
                                         </div>
                                         <span className={`text-sm font-bold tracking-tight ${isSelected ? 'text-indigo-950' : 'text-slate-600'}`}>
                                           {teamMatch || 'Entry'}
                                         </span>
                                      </div>
                                      {isSelected && <CheckCircle2 size={16} className="text-indigo-600" />}
                                   </button>
                                 );
                               })
                             )}
                          </div>
                       </div>

                       {/* 2. Participant (Optional for Indiv) */}
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <User size={14} /> 2. Target Participant
                          </label>
                          {activeItem.type !== 'INDIVIDUAL' ? (
                            <div className="h-full min-h-[120px] bg-indigo-50/30 rounded-3xl border border-indigo-100 flex flex-col items-center justify-center p-6 text-center">
                               <Sparkles size={24} className="text-indigo-300 mb-2" />
                               <p className="text-xs font-bold text-indigo-900 uppercase tracking-tight mb-1">Group Track</p>
                               <p className="text-[10px] text-indigo-500 font-medium leading-relaxed">Scores apply to the collective effort of the entire team entry.</p>
                            </div>
                          ) : !selectedEntryId[activeItem._id] ? (
                            <div className="h-full min-h-[120px] bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center p-6 grayscale">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select a team first</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                               {(entries.find(e => e._id === selectedEntryId[activeItem._id])?.participants || []).map((p: any) => {
                                 const pId = typeof p === 'object' ? p._id : p;
                                 const pName = typeof p === 'object' ? p.name : 'Unknown';
                                 const isSelected = selectedParticipantId[activeItem._id] === pId;
                                 return (
                                   <button
                                     key={pId}
                                     onClick={() => setSelectedParticipantId(prev => ({ ...prev, [activeItem._id]: pId }))}
                                     className={`flex items-center p-3 rounded-2xl border transition-all gap-3 ${
                                       isSelected ? 'bg-indigo-50 border-indigo-600 shadow-md opacity-100' : 'bg-white border-slate-100 hover:border-indigo-100'
                                     }`}
                                   >
                                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                         {pName.charAt(0)}
                                      </div>
                                      <span className={`text-xs font-bold tracking-tight ${isSelected ? 'text-indigo-950' : 'text-slate-600'}`}>{pName}</span>
                                   </button>
                                 );
                               })}
                            </div>
                          )}
                       </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Scoring Area */}
                    <div className="space-y-6">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Star size={14} /> 3. Evaluate Performance
                       </label>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Place Select */}
                          {activeItem.placePoints && (
                            <div className="space-y-3">
                               <p className="text-xs font-bold text-slate-700">Podium Recognition</p>
                               <div className="flex gap-2">
                                  {[1, 2, 3].map(pos => {
                                    const isSel = (scores[activeItem._id]?.place) === pos;
                                    return (
                                      <button 
                                        key={pos}
                                        onClick={() => setScores(prev => ({ ...prev, [activeItem._id]: { ...prev[activeItem._id], place: isSel ? undefined : pos } }))}
                                        className={`flex-1 flex flex-col items-center gap-1 p-4 rounded-2xl border transition-all ${
                                          isSel 
                                            ? 'bg-amber-500 border-amber-600 text-white shadow-lg lg:scale-105' 
                                            : 'bg-white border-slate-100 hover:bg-amber-50 hover:border-amber-200 text-slate-400'
                                        }`}
                                      >
                                         <span className="text-xl">{pos === 1 ? '🥇' : pos === 2 ? '🥈' : '🥉'}</span>
                                         <span className="text-[10px] font-black uppercase tracking-widest">{pos === 1 ? '1st' : pos === 2 ? '2nd' : '3rd'}</span>
                                      </button>
                                    );
                                  })}
                               </div>
                            </div>
                          )}

                          {/* Grade Select */}
                          {(activeItem.gradeRanges?.length > 0 || (activeItem.gradePoints && Object.keys(activeItem.gradePoints).length > 0)) && (
                            <div className="space-y-3">
                               <p className="text-xs font-bold text-slate-700">Standards Rating</p>
                               <div className="flex flex-wrap gap-2">
                                  {/* Use gradeRanges if available */}
                                  {activeItem.gradeRanges?.length > 0 ? (
                                    activeItem.gradeRanges.map((g: any) => {
                                      const isSel = (scores[activeItem._id]?.grade) === g.grade;
                                      return (
                                        <button 
                                          key={g.grade}
                                          onClick={() => setScores(prev => ({ ...prev, [activeItem._id]: { ...prev[activeItem._id], grade: isSel ? undefined : g.grade } }))}
                                          className={`px-6 py-3 rounded-2xl border transition-all font-black text-sm ${
                                            isSel 
                                              ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg' 
                                              : 'bg-white border-slate-100 hover:bg-indigo-50 hover:border-indigo-300 text-slate-500'
                                          }`}
                                        >
                                           Grade {g.grade}
                                        </button>
                                      );
                                    })
                                  ) : (
                                    /* Fallback to gradePoints keys if gradeRanges is missing */
                                    Object.keys(activeItem.gradePoints || {}).map((gradeKey: string) => {
                                      const isSel = (scores[activeItem._id]?.grade) === gradeKey;
                                      return (
                                        <button 
                                          key={gradeKey}
                                          onClick={() => setScores(prev => ({ ...prev, [activeItem._id]: { ...prev[activeItem._id], grade: isSel ? undefined : gradeKey } }))}
                                          className={`px-6 py-3 rounded-2xl border transition-all font-black text-sm ${
                                            isSel 
                                              ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg' 
                                              : 'bg-white border-slate-100 hover:bg-indigo-50 hover:border-indigo-300 text-slate-500'
                                          }`}
                                        >
                                           Grade {gradeKey.toUpperCase()}
                                        </button>
                                      );
                                    })
                                  )}
                               </div>
                            </div>
                          )}
                       </div>
                    </div>

                    <Button
                      size="lg"
                      onClick={() => handleScoreSubmit(activeItem)}
                      disabled={
                        submitting[activeItem._id] || 
                        !selectedEntryId[activeItem._id] || 
                        (activeItem.type === 'INDIVIDUAL' && !selectedParticipantId[activeItem._id]) ||
                        (!scores[activeItem._id]?.place && !scores[activeItem._id]?.grade)
                      }
                      className="w-full h-16 rounded-3xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.01]"
                    >
                      {submitting[activeItem._id] ? (
                        <div className="flex items-center gap-3">
                           <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                           Validating Standings...
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                           <Gavel size={20} />
                           Commit Score Final
                        </div>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Score History / Preview */}
                <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Clock size={20} className="text-indigo-400" />
                        Scoring Log
                      </h3>
                      <Badge variant="outline" className="text-[10px] font-black py-0.5">Track: {activeItem.name}</Badge>
                   </div>
                   
                   <div className="space-y-3">
                      {results.filter(r => (typeof r.item === 'object' ? r.item._id : r.item) === activeItem._id).length === 0 ? (
                        <div className="p-12 text-center border-2 border-dashed border-slate-50 rounded-3xl">
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No results committed yet for this track.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                             <thead>
                                <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                                   <th className="pb-3 pl-2">Participant / Team</th>
                                   <th className="pb-3">Place</th>
                                   <th className="pb-3 text-right pr-2">Grade</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-50">
                                {results.filter(r => (typeof r.item === 'object' ? r.item._id : r.item) === activeItem._id).map((r, i) => {
                                  const name = r.participant ? (typeof r.participant === 'object' ? r.participant.name : 'Participant') : (r.team ? (typeof r.team === 'object' ? r.team.name : 'Team') : 'Unknown');
                                  return (
                                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                       <td className="py-4 pl-2 font-bold text-sm text-slate-800">{name}</td>
                                       <td className="py-4">
                                          {r.place ? (
                                            <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[10px]">{r.place === 1 ? '1st' : r.place === 2 ? '2nd' : '3rd'}</Badge>
                                          ) : '—'}
                                       </td>
                                       <td className="py-4 text-right pr-2">
                                          {r.grade ? (
                                            <Badge className="bg-indigo-100 text-indigo-700 border-none font-black text-[10px]">Grade {r.grade}</Badge>
                                          ) : '—'}
                                       </td>
                                    </tr>
                                  );
                                })}
                             </tbody>
                          </table>
                        </div>
                      )}
                   </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-[40px] border border-dashed border-slate-200">
               <Gavel size={64} className="text-slate-100 mb-6" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Select a track from the sidebar to begin judging.</p>
            </div>
          )}
        </section>
      </main>
      
      {/* Sticky Bottom Summary (Mobile Only) */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
         {/* Could add a mobile quick-switch for tracks here */}
      </div>
    </div>
  );
}

// Internal icons helper since they're not all in scope
function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}

function BookOpen(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    )
}

function ChevronRight(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    )
}
