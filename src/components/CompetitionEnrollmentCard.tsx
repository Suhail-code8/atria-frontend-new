import { useState, useEffect } from "react";
import { competitionApi } from "../api/competition.api";
import { teamApi } from "../api/team.api";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { 
  CheckSquare, 
  Square, 
  Save, 
  AlertCircle, 
  Sparkles, 
  Users, 
  User, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2,
  Trophy,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CompetitionEnrollmentCardProps {
  eventId: string;
  userId: string;
}

export function CompetitionEnrollmentCard({ eventId, userId }: CompetitionEnrollmentCardProps) {
  const [team, setTeam] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedEnrollments, setSelectedEnrollments] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const teamRes = await teamApi.getEventTeams(eventId);
        const myTeam = teamRes.data.data.find((t: any) => 
           t.members.some((m: any) => {
              const mId = typeof m.user === 'object' ? m.user._id : m.user;
              return mId === userId;
           })
        );
        
        if (!myTeam) {
           setLoading(false);
           return;
        }
        
        setTeam(myTeam);

        const itemsRes = await competitionApi.getItems(eventId);
        setItems(itemsRes.data.data);

        const entriesRes = await competitionApi.getEntriesByEvent(eventId);
        const teamEntries = entriesRes.data.data.filter((e: any) => {
            const entryTeamId = typeof e.team === 'object' ? (e.team as any)?._id : e.team;
            return entryTeamId === myTeam._id;
        });
        
        setEntries(teamEntries);
        
        const initialEnrollments: Record<string, string[]> = {};
        teamEntries.forEach((e: any) => {
            const itemId = typeof e.item === 'object' ? (e.item as any)?._id : e.item;
            initialEnrollments[itemId] = e.participants.map((p: any) => typeof p === 'object' ? (p as any)?._id : p);
        });
        setSelectedEnrollments(initialEnrollments);
        
      } catch (err: any) {
        console.error(err);
        setError("Failed to load competition data.");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [eventId, userId]);

  if (loading) return (
    <div className="w-full h-48 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Enrollment...</span>
      </div>
    </div>
  );
  
  if (!team) return null;

  const isLeader = team.leaderId 
    ? (typeof team.leaderId === 'object' ? team.leaderId._id : team.leaderId) === userId
    : false;

  // Non-leaders view
  if (!isLeader) {
    const enrolledItemIds = entries.map(e => typeof e.item === 'object' ? e.item._id : e.item);
    if (enrolledItemIds.length === 0) return null;
    
    return (
      <Card className="border-indigo-100 bg-white overflow-hidden shadow-xl shadow-indigo-100/50">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6">
          <CardTitle className="text-lg flex items-center gap-3 text-white">
            <Trophy size={20} className="text-indigo-200" />
            Team Competitions
          </CardTitle>
          <p className="text-xs text-indigo-100 mt-1 opacity-80">Track the items your team is competing in.</p>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.filter(i => enrolledItemIds.includes(i._id)).map(item => (
              <motion.div 
                key={item._id} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase">{item.type}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSave = async () => {
     setSaving(true);
     setError(null);
     setSuccess(false);
     try {
         const payload = Object.entries(selectedEnrollments).map(([itemId, participantIds]) => ({
             itemId,
             participantIds
         }));
         
         await teamApi.enrollInItems(team._id, payload);
         setSuccess(true);
         setTimeout(() => setSuccess(false), 3000);
     } catch (err: any) {
         setError(err.response?.data?.message || "Failed to update enrollment.");
     } finally {
         setSaving(false);
     }
  };

  const toggleItem = (itemId: string) => {
      setSelectedEnrollments(prev => {
          const newEnrollments = { ...prev };
          if (newEnrollments[itemId]) {
              delete newEnrollments[itemId];
          } else {
              newEnrollments[itemId] = team.members.map((m: any) => 
                  typeof m.user === 'object' ? m.user._id : m.user
              );
              setExpandedItem(itemId);
          }
          return newEnrollments;
      });
  };

  const toggleParticipant = (itemId: string, participantId: string) => {
      setSelectedEnrollments(prev => {
          const participants = prev[itemId] || [];
          const newParticipants = participants.includes(participantId)
              ? participants.filter(id => id !== participantId)
              : [...participants, participantId];
          
          return {
              ...prev,
              [itemId]: newParticipants
          };
      });
  };

  const selectAllMembers = (itemId: string) => {
      const allIds = team.members.map((m: any) => typeof m.user === 'object' ? m.user._id : m.user);
      setSelectedEnrollments(prev => ({ ...prev, [itemId]: allIds }));
  };

  return (
    <Card className="border-none bg-white shadow-2xl shadow-slate-200 overflow-hidden">
      {/* Premium Header */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-violet-900 p-8 relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles size={120} className="rotate-12" />
        </div>
        
        <div className="relative z-10">
          <Badge className="bg-white/10 hover:bg-white/20 text-indigo-100 border-none px-3 py-1 mb-4 flex w-fit gap-2 font-bold tracking-tight text-[10px] uppercase">
            <Activity size={12} />
            Leader Console
          </Badge>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                <Trophy size={24} />
             </div>
             <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Competition Enrollment</h2>
                <p className="text-indigo-100/70 text-sm mt-1 max-w-lg leading-relaxed">
                  As the team leader, select the tracks your team will represent. You can also specify which members will compete in each item.
                </p>
             </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-8">
        {error && (
            <motion.div 
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-red-50 text-red-700 text-xs px-4 py-3 rounded-2xl border border-red-100 flex items-center gap-3 mb-8"
            >
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle size={14} />
                </div>
                <span className="font-bold">{error}</span>
            </motion.div>
        )}
        
        {items.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
              <Trophy size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No team tracks available yet.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-6">
                {items.map((item, idx) => {
                    const isSelected = !!selectedEnrollments[item._id];
                    const enrolledCount = selectedEnrollments[item._id]?.length || 0;
                    const isExpanded = expandedItem === item._id;

                    return (
                        <motion.div 
                          key={item._id} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group"
                        >
                            <div 
                              onClick={() => toggleItem(item._id)}
                              className={`flex items-center justify-between p-6 rounded-3xl border transition-all duration-300 ${
                                isSelected 
                                  ? 'bg-indigo-50/50 border-indigo-200 shadow-lg shadow-indigo-100/50 ring-1 ring-indigo-200' 
                                  : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-slate-100'
                              } cursor-pointer`}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                      isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-300 group-hover:bg-indigo-100 group-hover:text-indigo-400'
                                    }`}>
                                        {isSelected ? <CheckSquare size={24} /> : <Square size={24} />}
                                    </div>
                                    <div>
                                        <h4 className={`text-lg font-black tracking-tight ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                                          {item.name}
                                        </h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <Badge 
                                              variant="secondary" 
                                              className={`text-[9px] uppercase font-black tracking-widest px-2 py-0.5 border-none ${
                                                item.type === 'INDIVIDUAL' 
                                                  ? 'bg-amber-100 text-amber-700' 
                                                  : 'bg-indigo-100 text-indigo-700'
                                              }`}
                                            >
                                              {item.type === 'INDIVIDUAL' ? <User size={8} className="mr-1 inline" /> : <Users size={8} className="mr-1 inline" />}
                                              {item.type}
                                            </Badge>
                                            {isSelected && (
                                                <div className="flex items-center gap-1 text-[10px] font-black text-indigo-500 uppercase tracking-tight">
                                                    <Users size={12} />
                                                    {enrolledCount} {enrolledCount === 1 ? 'member' : 'members'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {isSelected && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className={`h-10 w-10 p-0 rounded-xl transition-colors ${isExpanded ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'}`}
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          setExpandedItem(isExpanded ? null : item._id);
                                      }}
                                    >
                                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </Button>
                                )}
                            </div>

                            <AnimatePresence>
                                {isSelected && isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-6 shadow-inner mx-4">
                                            <div className="flex justify-between items-center px-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Participants</span>
                                                <button 
                                                   onClick={(e) => { e.stopPropagation(); selectAllMembers(item._id); }}
                                                   className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest"
                                                >
                                                   Enroll Entire Team
                                                </button>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {team.members.map((m: any) => {
                                                    const mId = typeof m.user === 'object' ? m.user._id : m.user;
                                                    const mName = typeof m.user === 'object' ? m.user.name : 'Unknown Member';
                                                    const isChecked = selectedEnrollments[item._id]?.includes(mId);
                                                    
                                                    return (
                                                        <motion.div 
                                                            key={mId} 
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={(e) => { e.stopPropagation(); toggleParticipant(item._id, mId); }}
                                                            className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${
                                                              isChecked 
                                                                ? 'bg-white border-indigo-200 shadow-md ring-2 ring-indigo-50' 
                                                                : 'bg-transparent border-slate-100 hover:bg-white hover:border-slate-200'
                                                            }`}
                                                        >
                                                            <div className={`transition-colors ${isChecked ? 'text-indigo-600' : 'text-slate-300'}`}>
                                                                {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${
                                                                  isChecked ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                                                                }`}>
                                                                    {mName.charAt(0)}
                                                                </div>
                                                                <span className={`text-sm font-bold tracking-tight ${isChecked ? 'text-indigo-950' : 'text-slate-600'}`}>
                                                                  {mName}
                                                                </span>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )
                })}
            </div>
        )}
      </CardContent>
      
      {items.length > 0 && (
         <CardFooter className="p-8 pt-0 relative z-10 flex flex-col items-center">
             <div className="w-full h-px bg-slate-100 mb-8" />
             <Button 
                onClick={handleSave} 
                disabled={saving} 
                className={`w-full h-14 rounded-2xl text-white font-black uppercase tracking-widest gap-3 transition-all ${
                  success 
                    ? 'bg-emerald-500 hover:bg-emerald-600' 
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 hover:shadow-indigo-200'
                }`}
             >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving Changes...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 size={20} />
                    Enrollment Updated!
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Enrollment Preferences
                  </>
                )}
             </Button>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">
               Team: {team.name} • {team.members?.length || 0} Members
             </p>
         </CardFooter>
      )}
    </Card>
  );
}
