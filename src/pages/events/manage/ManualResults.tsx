import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { competitionApi } from "../../../api/competition.api";
import { teamApi } from "../../../api/team.api";
import { resultApi } from "../../../api/result.api";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Award, Trophy } from "lucide-react";
import { showToast } from "../../../lib/toast";

export function ManualResults() {
  const { id } = useParams();
  const [items, setItems] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState("");
  const [place, setPlace] = useState("");
  const [grade, setGrade] = useState("");

  const fetchData = async () => {
    if (!id) return;
    try {
      const [itemsRes, teamsRes, entriesRes] = await Promise.all([
        competitionApi.getItems(id),
        teamApi.getEventTeams(id),
        competitionApi.getEntriesByEvent(id)
      ]);
      setItems(itemsRes.data.data);
      setTeams(teamsRes.data.data);
      setEntries(entriesRes.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSubmit = async () => {
    if (!id || !selectedItem || !selectedTeam) return;
    if (!place && !grade) {
      showToast.warning("Please provide either a Place (e.g. 1, 2, 3) or a Grade (e.g. A, B, C).");
      return;
    }
    
    try {
      const item = items.find(i => i._id === selectedItem);
      
      await resultApi.submitResult({
        eventId: id,
        itemId: selectedItem,
        teamId: selectedTeam,
        participantId: item?.type === 'INDIVIDUAL' ? selectedParticipant : undefined,
        place: place ? parseInt(place) : undefined,
        grade: grade || undefined
      });
      showToast.success("Result submitted! Leaderboard updated.");
      setPlace("");
      setGrade("");
      if (item?.type !== 'INDIVIDUAL') {
        setSelectedTeam("");
      } else {
        setSelectedParticipant("");
      }
    } catch (err) {
      showToast.error("Failed to submit result. Please try again.");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manual Results Entry</h1>
        <p className="text-secondary mt-1">Assign places or grades for offline tracks, which automatically awards points to teams.</p>
      </div>

      <Card>
        <CardHeader className="bg-slate-50 border-b border-secondary/10 rounded-t-xl">
          <CardTitle className="flex items-center gap-2">
            <Award className="text-primary w-5 h-5" /> Submit Offline Result
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Select Track / Competition</label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-secondary/20 bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedItem}
                onChange={(e) => {
                  setSelectedItem(e.target.value);
                  setSelectedTeam("");
                }}
              >
                <option value="">-- Choose Track --</option>
                {items.map(item => (
                  <option key={item._id} value={item._id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Select Team</label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-secondary/20 bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                {teams
                  .filter(team => {
                     if (!selectedItem) return true;
                     return entries.some(e => {
                        const eItemId = typeof e.item === 'object' ? e.item._id : e.item;
                        const eTeamId = typeof e.team === 'object' ? e.team._id : e.team;
                        return eItemId === selectedItem && eTeamId === team._id;
                     });
                  })
                  .map(team => (
                  <option key={team._id} value={team._id}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedItem && selectedTeam && items.find(i => i._id === selectedItem)?.type === 'INDIVIDUAL' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-medium text-slate-700">Select Specific Participant</label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-indigo-200 bg-indigo-50/30 focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedParticipant}
                onChange={(e) => setSelectedParticipant(e.target.value)}
              >
                <option value="">-- Choose Member --</option>
                {(() => {
                   const entry = entries.find(e => {
                      const eItemId = typeof e.item === 'object' ? e.item._id : e.item;
                      const eTeamId = typeof e.team === 'object' ? e.team._id : e.team;
                      return eItemId === selectedItem && eTeamId === selectedTeam;
                   });
                   return (entry?.participants || []).map((p: any) => {
                      const pId = typeof p === 'object' ? p._id : p;
                      const pName = typeof p === 'object' ? p.name : "Member";
                      return (
                         <option key={pId} value={pId}>{pName}</option>
                      );
                   });
                })()}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-secondary/10">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Place (Number)</label>
              <Input 
                type="number"
                placeholder="e.g., 1 for 1st Place" 
                value={place}
                onChange={(e) => setPlace(e.target.value)}
              />
              <p className="text-xs text-secondary">First, Second, or Third place.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Grade (Letter)</label>
              <Input 
                placeholder="e.g., A, B, C" 
                value={grade}
                onChange={(e) => setGrade(e.target.value.toUpperCase())}
              />
              <p className="text-xs text-secondary">Alternative grading system.</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
               size="lg" 
               className="px-8 shadow-md" 
               onClick={handleSubmit} 
               disabled={!selectedItem || !selectedTeam || (items.find(i => i._id === selectedItem)?.type === 'INDIVIDUAL' && !selectedParticipant)}
            >
              Submit to Leaderboard
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-sm text-primary">
        <strong>How it works:</strong> When you submit a result, the system reads the Points Configuration set in the 
        "Event Tracks" menu for this specific track. If a team gets 1st place, they might get 10 points added to their 
        Team Profile automatically, which immediately updates their ranking on the Leaderboard.
      </div>
    </div>
  );
}
