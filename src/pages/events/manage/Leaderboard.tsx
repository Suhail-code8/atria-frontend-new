import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { participationApi } from "../../../api/participation.api";
import { resultApi } from "../../../api/result.api";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Download, Medal, Trophy } from "lucide-react";
import { io, type Socket } from "socket.io-client";
import { env } from "../../../utils/env";

export function Leaderboard() {
  const { id } = useParams();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [teamLeaderboard, setTeamLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<"individual" | "team">("individual");

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    Promise.all([
      participationApi.getEventLeaderboard(id),
      resultApi.getTeamLeaderboard(id).catch(() => ({ data: { data: [] } }))
    ])
      .then(([indRes, teamRes]: any) => {
        setLeaderboard(indRes?.data?.data || []);
        setTeamLeaderboard(teamRes?.data?.data || []);
      })
      .catch(() => {
        setLeaderboard([]);
        setTeamLeaderboard([]);
      })
      .finally(() => setLoading(false));

    // Setup Socket — use SOCKET_URL which has a fallback, not API_URL which may be undefined
    const socket: Socket = io(env.SOCKET_URL, {
      withCredentials: true
    });
    
    socket.emit("join_event_leaderboard", id);
    
    socket.on("leaderboard:update", (_data) => {
      // For simplicity, we just trigger a refetch of both if we get an update, 
      // or we can just expect indRes directly if socket is only for individuals.
      // Better: refetch to ensure we get team updates too, or wait for distinct socket events.
      participationApi.getEventLeaderboard(id).then((res: any) => setLeaderboard(res.data.data));
      resultApi.getTeamLeaderboard(id).then((res: any) => setTeamLeaderboard(res.data.data));
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const exportCSV = () => {
    const isTeam = viewType === "team";
    const data = isTeam ? teamLeaderboard : leaderboard;
    if (!data.length) return;
    
    let headers: string[];
    let rows: any[][];

    if (isTeam) {
      headers = ["Rank", "Team Name", "Score"];
      rows = data.map((l, i) => [
        i + 1, l.name, l.totalPoints
      ]);
    } else {
      headers = ["Rank", "Name", "Email", "Team", "Score"];
      rows = data.map((l, i) => [
        i + 1, l.name, l.email || "N/A", l.team || "N/A", l.individualPoints
      ]);
    }
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leaderboard_${id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Live Leaderboard</h1>
          <p className="text-secondary mt-1">Real-time scoring updates via Socket.io.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportCSV}>
          <Download size={16} /> Export CSV
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <Button 
          variant={viewType === "individual" ? "primary" : "outline"} 
          onClick={() => setViewType("individual")}
        >
          Top Individuals
        </Button>
        <Button 
          variant={viewType === "team" ? "primary" : "outline"} 
          onClick={() => setViewType("team")}
        >
          Top Teams
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-secondary font-medium border-b border-secondary/10">
                <tr>
                  <th className="px-6 py-4 w-24">Rank</th>
                  {viewType === "individual" ? (
                    <>
                      <th className="px-6 py-4">Participant</th>
                      <th className="px-6 py-4">Team</th>
                    </>
                  ) : (
                    <th className="px-6 py-4">Team Name</th>
                  )}
                  <th className="px-6 py-4 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/10">
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-12 text-secondary">Loading leaderboard...</td></tr>
                ) : (viewType === "individual" ? leaderboard : teamLeaderboard).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-16">
                       <Trophy className="w-12 h-12 text-secondary mx-auto mb-4 opacity-30" />
                       <p className="text-secondary">Leaderboard is empty.</p>
                    </td>
                  </tr>
                ) : (
                  (viewType === "individual" ? leaderboard : teamLeaderboard).map((entry, index) => {
                    const isGold = index === 0;
                    const isSilver = index === 1;
                    const isBronze = index === 2;
                    return (
                      <tr key={index} className={`hover:bg-slate-50/50 transition-colors ${isGold ? 'bg-[#FFD700]/5' : ''}`}>
                        <td className="px-6 py-4 font-bold text-lg">
                          {isGold && <Medal className="inline mr-2 text-[#FFD700]" size={20} />}
                          {isSilver && <Medal className="inline mr-2 text-[#C0C0C0]" size={20} />}
                          {isBronze && <Medal className="inline mr-2 text-[#CD7F32]" size={20} />}
                          <span className={isGold ? 'text-[#FFD700]' : isSilver ? 'text-[#C0C0C0]' : isBronze ? 'text-[#CD7F32]' : 'text-slate-400 pl-7'}>
                            #{index + 1}
                          </span>
                        </td>
                        {viewType === "individual" ? (
                          <>
                            <td className="px-6 py-4">
                              <div className={`font-bold ${isGold ? 'text-slate-900' : 'text-slate-700'}`}>{entry.name}</div>
                              {entry.email && <div className="text-xs text-secondary mt-0.5">{entry.email}</div>}
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant={entry.team && entry.team !== "Unassigned" ? "secondary" : "outline"}>
                                {entry.team || "Unassigned"}
                              </Badge>
                            </td>
                          </>
                        ) : (
                          <td className="px-6 py-4">
                            <div className={`font-bold ${isGold ? 'text-slate-900' : 'text-slate-700'}`}>{entry.name}</div>
                          </td>
                        )}
                        <td className="px-6 py-4 text-right font-mono font-bold text-lg text-primary">
                          {viewType === "individual" ? entry.individualPoints : entry.totalPoints}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
