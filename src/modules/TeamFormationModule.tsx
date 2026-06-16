import { useState, useEffect } from "react";
import { teamApi } from "../api/team.api";
import type { ITeam } from "../api/team.api";
import { participationApi } from "../api/participation.api";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/Card";
import { Users, UserPlus, CheckCircle2, User, KeyRound, Copy, Clock, Shield } from "lucide-react";
import { Input } from "../components/ui/Input";

interface TeamFormationModuleProps {
  config: any;
  participation: any;
  onAdvanced: (data: any) => void;
}

export default function TeamFormationModule({ config, participation, onAdvanced }: TeamFormationModuleProps) {
  const [myTeam, setMyTeam] = useState<ITeam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [actionReq, setActionReq] = useState<"none" | "create" | "join">("none");
  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [eventTeams, setEventTeams] = useState<ITeam[]>([]);
  const [isJoining, setIsJoining] = useState<string | null>(null);

  const eventId = participation.event?._id || participation.event;
  const userId = participation.user?._id || participation.user;

  // Determine mode from config (defaults to participants_create if not set)
  const teamCreationMode: "organizer_creates" | "participants_create" =
    config?.teamCreationMode || "participants_create";

  const checkTeam = () => {
    setIsLoading(true);
    teamApi.getEventTeams(eventId)
      .then((res) => {
        const found = res.data.data.find((t) =>
          t.members.some((m) => {
            const memberId = typeof m.user === "object" ? (m.user as any)._id : m.user;
            return memberId === userId || memberId?.toString() === userId?.toString();
          })
        );
        setMyTeam(found || null);
      })
      .catch(() => setMyTeam(null))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    checkTeam();
    if (config?.teamCreationMode === "organizer_creates" && config?.allowSelfEnrollment) {
      teamApi.getEventTeams(eventId).then(res => setEventTeams(res.data.data));
    }
  }, [participation, config]);

  const handleAdvance = async () => {
    setIsAdvancing(true);
    try {
      const res = await participationApi.advance(participation._id);
      onAdvanced(res.data.data.participation);
    } catch {
      setError("Failed to advance. Ensure you are part of a team.");
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleJoinSpecificTeam = async (teamId: string) => {
    setIsJoining(teamId);
    setError(null);
    try {
      await teamApi.joinTeam(teamId);
      // Fetch updated participation to get the new workflow state after join auto-advance
      const pRes = await participationApi.getMyParticipation(eventId);
      onAdvanced(pRes.data.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to join team.");
      setIsJoining(null);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;
    setError(null);
    try {
      await teamApi.createParticipantTeam(eventId, teamName.trim());
      setTeamName("");
      setActionReq("none");
      checkTeam();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to create team.");
    }
  };

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) return;
    setError(null);
    try {
      await teamApi.joinTeamViaCode(inviteCode.trim().toUpperCase());
      setInviteCode("");
      setActionReq("none");
      checkTeam();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Invalid invite code.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center text-secondary">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
        Checking team status...
      </div>
    );
  }

  // ── Team found: show team card ──────────────────────────────────────────────
  if (myTeam) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 size={20} />
            <CardTitle className="text-lg">Team Assigned</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-5 rounded-xl border border-primary/10 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xl">{myTeam.name}</h3>
                <p className="text-sm text-secondary">Official Event Team</p>
                {myTeam.inviteCode && (
                  <div className="mt-2 inline-flex items-center gap-2 bg-slate-100 rounded text-xs px-2 py-1 font-mono">
                    <KeyRound size={12} className="text-primary" />
                    Code: {myTeam.inviteCode}
                    <button
                      onClick={() => navigator.clipboard.writeText(myTeam.inviteCode!)}
                      className="ml-1 text-slate-400 hover:text-slate-800"
                      title="Copy invite code"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-secondary uppercase tracking-wider">Members</p>
              <div className="flex flex-wrap gap-2">
                {myTeam.members.map((m, i) => {
                  const memberName = typeof m.user === "object" ? (m.user as any).name : "Member";
                  const isLeader = myTeam.leaderId
                    ? (typeof m.user === "object" ? (m.user as any)._id : m.user)?.toString() ===
                      (typeof myTeam.leaderId === "object"
                        ? (myTeam.leaderId as any)._id || myTeam.leaderId
                        : myTeam.leaderId
                      )?.toString()
                    : false;
                  return (
                    <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${isLeader ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-slate-100"}`}>
                      <User size={14} className="text-secondary" />
                      {memberName}
                      {isLeader && <Shield size={12} className="text-amber-600" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleAdvance} disabled={isAdvancing}>
            {isAdvancing ? "Advancing..." : "Proceed to Next Segment"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // ── No team: organizer_creates mode ─────────────────────────────────────────
  if (teamCreationMode === "organizer_creates") {
    const allowSelfEnrollment = config?.allowSelfEnrollment;

    return (
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-2 text-slate-700">
            {allowSelfEnrollment ? <UserPlus size={20} className="text-primary" /> : <Clock size={20} />}
            <CardTitle className="text-lg">
              {allowSelfEnrollment ? "Choose Your Team" : "Awaiting Team Assignment"}
            </CardTitle>
          </div>
          <p className="text-sm text-secondary">
            {allowSelfEnrollment 
              ? "Select one of the teams below to join the event." 
              : "The organizer is assigning participants to teams manually."}
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          {allowSelfEnrollment ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {eventTeams.length === 0 ? (
                <div className="text-center py-10 text-secondary italic">
                  No teams have been created by the organizer yet.
                </div>
              ) : (
                eventTeams.map((team) => {
                  const currentSize = team.members.length;
                  const maxSize = config?.teamSize || 1;
                  const isFull = currentSize >= maxSize;

                  return (
                    <div key={team._id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-primary/30 transition-all">
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">{team.name}</h4>
                        <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                          <Users size={12} />
                          {currentSize} / {maxSize} members
                        </p>
                      </div>
                      <Button
                        size="sm"
                        disabled={isFull || !!isJoining}
                        onClick={() => handleJoinSpecificTeam(team._id)}
                        className="shrink-0"
                      >
                        {isJoining === team._id ? "Joining..." : isFull ? "Full" : "Join Team"}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-secondary/10">
                <Users size={32} className="text-secondary/40" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Team assignment in progress</h3>
              <p className="text-sm text-secondary mt-2 max-w-xs mx-auto">
                The organizer is assigning participants to teams. You will be automatically advanced once your team is set.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="ghost" className="w-full text-xs text-secondary underline" onClick={checkTeam}>
            Refresh status
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // ── No team: participants_create mode → show create/join UI ────────────────
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="text-primary" />
          Join a Team
        </CardTitle>
        <p className="text-sm text-secondary">
          Create your own team or join an existing one using an invite code.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}
        {actionReq === "none" ? (
          <div className="text-center py-8">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-secondary/10">
              <Users size={32} className="text-secondary/40" />
            </div>
            <p className="text-slate-600 font-medium">You are currently without a team.</p>
            <p className="text-xs text-secondary mt-1">Teams are required for the next operational phase.</p>
          </div>
        ) : actionReq === "create" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Team Name</label>
              <Input
                placeholder="e.g. The Innovators"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
              />
            </div>
            <Button className="w-full" onClick={handleCreateTeam} disabled={!teamName.trim()}>
              Create Team & Get Invite Code
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Invite Code</label>
              <Input
                placeholder="e.g. A1B2C3"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleJoinTeam()}
                className="font-mono uppercase"
              />
            </div>
            <Button className="w-full" onClick={handleJoinTeam} disabled={!inviteCode.trim()}>
              Join Team
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        {actionReq === "none" && (
          <>
            <Button className="w-full" onClick={() => { setActionReq("create"); setError(null); }}>
              Create New Team
            </Button>
            <Button variant="outline" className="w-full" onClick={() => { setActionReq("join"); setError(null); }}>
              Join Existing Team
            </Button>
          </>
        )}
        {actionReq !== "none" && (
          <Button variant="ghost" className="w-full" onClick={() => { setActionReq("none"); setError(null); }}>
            Cancel
          </Button>
        )}
        <Button variant="ghost" className="w-full text-xs text-secondary underline" onClick={checkTeam}>
          Refresh status
        </Button>
      </CardFooter>
    </Card>
  );
}
