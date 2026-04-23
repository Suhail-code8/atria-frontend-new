import { useState, useEffect } from "react";
import { competitionApi } from "../api/competition.api";
import { teamApi } from "../api/team.api";
import { participationApi } from "../api/participation.api";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/Card";
import { Map, Trophy, CheckCircle } from "lucide-react";

interface CompetitionOptInModuleProps {
  config: any;
  participation: any;
  onAdvanced: (data: any) => void;
}

export default function CompetitionOptInModule({ config, participation, onAdvanced }: CompetitionOptInModuleProps) {
  const [items, setItems] = useState<any[]>([]);
  const [myTeam, setMyTeam] = useState<any>(null);
  const [enrolledItemIds, setEnrolledItemIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isAdvancing, setIsAdvancing] = useState(false);

  useEffect(() => {
    const fetchEverything = async () => {
      try {
        const eventId = participation.event._id || participation.event;
        const [itemsRes, teamsRes, entriesRes] = await Promise.all([
          competitionApi.getItems(eventId),
          teamApi.getEventTeams(eventId),
          competitionApi.getEntriesByEvent(eventId)
        ]);

        const team = teamsRes.data.data.find(t => 
          t.members.some(m => m.user._id === participation.user._id || m.user === participation.user._id)
        );
        
        setItems(itemsRes.data.data);
        setMyTeam(team || null);

        // Find which tracks my team is enrolled in
        if (team) {
           const teamEntries = entriesRes.data.data.filter((e: any) => e.team?._id === team._id || e.team === team._id);
           setEnrolledItemIds(new Set(teamEntries.map((e: any) => e.item._id || e.item)));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEverything();
  }, [participation]);

  const handleOptIn = async (itemId: string) => {
    if (!myTeam) {
       alert("You must be part of a team to opt in to a competition.");
       return;
    }
    try {
      // Opting in all members of the team for simplicity in this workflow
      const participantsToEnroll = myTeam.members.map(m => m.user._id || m.user);
      await competitionApi.syncEntry({
         event: participation.event._id || participation.event,
         item: itemId,
         team: myTeam._id,
         participants: participantsToEnroll
      });
      setEnrolledItemIds(prev => new Set([...prev, itemId]));
    } catch (err) {
      alert("Failed to opt in to this track. Please check team capacity rules.");
    }
  };

  const handleAdvance = async () => {
    if (enrolledItemIds.size === 0 && config.requireOneItem) {
       alert("You must opt into at least one track to proceed.");
       return;
    }
    setIsAdvancing(true);
    try {
      const res = await participationApi.advance(participation._id);
      onAdvanced(res.data.data.participation);
    } catch {
      alert("Failed to advance.");
    } finally {
      setIsAdvancing(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center text-secondary">Loading tracks...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="text-primary" />
          Choose Your Tracks
        </CardTitle>
        <p className="text-sm text-secondary">
          {config.requireOneItem ? "You must select at least one competition track for your team." : "Select the categories or tracks you wish to compete in."}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8">
             <Trophy size={32} className="text-secondary/40 mx-auto mb-4" />
             <p className="text-slate-600 font-medium">No tracks available yet.</p>
          </div>
        ) : (
          items.map(item => {
             const isEnrolled = enrolledItemIds.has(item._id);
             return (
               <div key={item._id} className={`p-4 border rounded-xl flex items-center justify-between transition-colors ${isEnrolled ? "border-emerald-500 bg-emerald-50/30" : "border-secondary/20 hover:border-primary/50"}`}>
                  <div>
                     <h3 className="font-bold text-slate-900">{item.name}</h3>
                     <p className="text-xs text-secondary mt-1">{item.type} • Max Attendees: {item.maxParticipantsPerTeam}</p>
                  </div>
                  <div>
                    {isEnrolled ? (
                       <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-100/50 px-3 py-1.5 rounded-lg text-sm">
                          <CheckCircle size={16} /> Enrolled
                       </div>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleOptIn(item._id)}>
                         Opt In
                      </Button>
                    )}
                  </div>
               </div>
             )
          })
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleAdvance} disabled={isAdvancing}>
          {isAdvancing ? "Advancing..." : "Proceed to Next Segment"}
        </Button>
      </CardFooter>
    </Card>
  );
}
