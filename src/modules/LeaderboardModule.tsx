import { useState, useEffect, useCallback } from "react";
import { participationApi } from "../api/participation.api";
import { resultApi } from "../api/result.api";
import { useAuth } from "../auth/AuthContext";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/Card";
import { Trophy, Star, Users, User, Lock } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

interface LeaderboardModuleProps {
  config: any;
  participation: any;
  isLastStep?: boolean;
  onAdvanced: (data: any) => void;
}

type ViewType = "individual" | "team";

const RankBadge = ({ index }: { index: number }) => {
  const base = "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm";
  if (index === 0) return <div className={`${base} bg-amber-400 text-white`}>1</div>;
  if (index === 1) return <div className={`${base} bg-slate-300 text-white`}>2</div>;
  if (index === 2) return <div className={`${base} bg-orange-400 text-white`}>3</div>;
  return <div className={`${base} bg-slate-100 text-secondary`}>{index + 1}</div>;
};

export default function LeaderboardModule({
  config,
  participation,
  isLastStep,
  onAdvanced,
}: LeaderboardModuleProps) {
  const { user } = useAuth();
  const isParticipant = user?.role === "PARTICIPANT" || !user;
  const isOrganizer = user?.role === "ORGANIZER";

  // Config-driven settings
  const displayType: "team" | "individual" | "both" = config?.displayType || "individual";
  const visibleTo: "public" | "participants" | "organizers_only" =
    config?.visibleTo || "public";

  // Determine initial view tab based on displayType
  const defaultView: ViewType = displayType === "team" ? "team" : "individual";
  const [activeView, setActiveView] = useState<ViewType>(defaultView);

  const [individualData, setIndividualData] = useState<any[]>([]);
  const [teamData, setTeamData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const eventId = participation.event?._id || participation.event;

  const fetchLeaderboard = useCallback(() => {
    if (!eventId) return;
    setIsLoading(true);

    const fetches: Promise<any>[] = [];

    if (displayType === "individual" || displayType === "both") {
      fetches.push(
        participationApi
          .getEventLeaderboard(eventId)
          .then((res) => setIndividualData(res.data.data || []))
          .catch(() => setIndividualData([]))
      );
    }

    if (displayType === "team" || displayType === "both") {
      fetches.push(
        resultApi
          .getTeamLeaderboard(eventId)
          .then((res) => setTeamData(res.data.data || []))
          .catch(() => setTeamData([]))
      );
    }

    Promise.all(fetches).finally(() => setIsLoading(false));
  }, [eventId, displayType]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleProceed = () => {
    participationApi
      .advance(participation._id)
      .then((res) => onAdvanced(res.data.data.participation))
      .catch(() => alert("Could not advance. Please try again later."));
  };

  // ── Visibility gate: organizers_only ──────────────────────────────────────
  if (visibleTo === "organizers_only" && isParticipant) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-2 text-slate-500">
            <Lock size={20} />
            <CardTitle className="text-lg">Leaderboard Not Yet Public</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-secondary/10">
              <Lock size={32} className="text-secondary/40" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Results pending release</h3>
            <p className="text-sm text-secondary mt-2 max-w-xs mx-auto">
              The organizer has not yet made the leaderboard public. Standby for an announcement.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleProceed}>
            Proceed
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-10 text-center text-secondary">
        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
        Fetching standings...
      </div>
    );
  }

  const currentData = activeView === "individual" ? individualData : teamData;
  const displayType_ = displayType; // alias to avoid shadowing

  return (
    <Card className="border-amber-100 bg-amber-50/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-amber-600">
            <Trophy size={20} />
            <CardTitle>Event Standings</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
            {config?.visibleTo === "organizers_only" && isOrganizer ? "Organizer View" : "Live"}
          </Badge>
        </div>
        <p className="text-xs text-secondary mt-1">
          {visibleTo === "public"
            ? "Public standings — visible to all."
            : visibleTo === "organizers_only"
            ? "Organizer preview — not yet visible to participants."
            : "Participant standings — judging in progress."}
        </p>
      </CardHeader>

      {/* Tab switcher — only shown when displayType is 'both' */}
      {displayType_ === "both" && (
        <div className="px-6 pb-2 flex gap-2">
          <button
            onClick={() => setActiveView("individual")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeView === "individual"
                ? "bg-amber-500 text-white"
                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
            }`}
          >
            <User size={12} /> Individuals
          </button>
          <button
            onClick={() => setActiveView("team")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeView === "team"
                ? "bg-amber-500 text-white"
                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
            }`}
          >
            <Users size={12} /> Teams
          </button>
        </div>
      )}

      <CardContent className="pt-2">
        <div className="space-y-2">
          {currentData.length === 0 ? (
            <div className="text-center py-8">
              <Trophy size={36} className="mx-auto text-amber-200 mb-3" />
              <p className="text-sm text-secondary italic">No scores recorded yet.</p>
            </div>
          ) : (
            currentData.slice(0, 10).map((entry: any, index: number) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border shadow-sm transition-all ${
                  index === 0
                    ? "bg-amber-50 border-amber-200"
                    : "bg-white border-amber-100"
                }`}
              >
                <div className="flex items-center gap-4">
                  <RankBadge index={index} />
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {activeView === "team" ? entry.name : entry.name}
                    </p>
                    {activeView === "individual" && entry.team && (
                      <p className="text-[10px] text-secondary uppercase font-bold tracking-tighter">
                        {entry.team !== "Unassigned" ? entry.team : ""}
                      </p>
                    )}
                    {activeView === "team" && (
                      <p className="text-[10px] text-secondary">
                        {entry.members?.length
                          ? `${entry.members.length} member${entry.members.length > 1 ? "s" : ""}`
                          : ""}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star size={12} fill="currentColor" />
                  <span className="text-sm">
                    {activeView === "individual"
                      ? (entry.individualPoints ?? entry.totalPoints ?? 0)
                      : entry.totalPoints ?? 0}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={handleProceed}
        >
          Proceed
        </Button>
      </CardFooter>
    </Card>
  );
}
