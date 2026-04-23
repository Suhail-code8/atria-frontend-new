import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { teamApi } from "../../../api/team.api";
import { eventsApi } from "../../../api/events.api";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Search, Plus, UserPlus, Shield, User, X } from "lucide-react";

export function Teams() {
  const { id } = useParams();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [workflowConfig, setWorkflowConfig] = useState<any>(null);

  // Create team form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);

  // Assign member state per team
  const [assignEmail, setAssignEmail] = useState<Record<string, string>>({});
  const [assigningFor, setAssigningFor] = useState<string | null>(null);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);

  const fetchTeams = () => {
    if (!id) return;
    teamApi.getEventTeams(id)
      .then((res: any) => setTeams(res.data.data))
      .catch(() => setTeams([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!id) return;
    fetchTeams();
    // Load event workflow to detect teamCreationMode and teamLeaderSelection
    eventsApi.getEvent(id)
      .then((res: any) => {
        const workflow = res.data.data?.workflow;
        const teamNode = workflow?.nodes?.find((n: any) => n.type === "TEAM_FORMATION");
        setWorkflowConfig(teamNode?.config || teamNode?.data?.config || null);
      })
      .catch(() => {});
  }, [id]);

  const teamCreationMode = workflowConfig?.teamCreationMode || "participants_create";
  const teamLeaderSelection = workflowConfig?.teamLeaderSelection || "creator_is_leader";
  const isOrganizerCreatesMode = teamCreationMode === "organizer_creates";
  const isOrganizerSelectsLeader = teamLeaderSelection === "organizer_selects";

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTeam = async () => {
    if (!id || !newTeamName.trim()) return;
    setCreatingTeam(true);
    setActionError(null);
    try {
      await teamApi.createOrganizerTeam(id, newTeamName.trim());
      setNewTeamName("");
      setShowCreateForm(false);
      fetchTeams();
    } catch (e: any) {
      setActionError(e?.response?.data?.message || "Failed to create team.");
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleAssignMember = async (teamId: string) => {
    const email = assignEmail[teamId]?.trim();
    if (!id || !email) return;
    setAssigningFor(teamId);
    setActionError(null);
    try {
      await teamApi.assignMemberByOrganizer(teamId, email, id);
      setAssignEmail((prev) => ({ ...prev, [teamId]: "" }));
      fetchTeams();
    } catch (e: any) {
      setActionError(e?.response?.data?.message || "Failed to assign member.");
    } finally {
      setAssigningFor(null);
    }
  };

  const handleSetLeader = async (teamId: string, leaderId: string) => {
    setActionError(null);
    try {
      await teamApi.setLeader(teamId, leaderId);
      fetchTeams();
    } catch (e: any) {
      setActionError(e?.response?.data?.message || "Failed to set leader.");
    }
  };

  const getLeaderName = (team: any) => {
    if (!team.leaderId) return null;
    const leaderId = typeof team.leaderId === "object" ? team.leaderId._id || team.leaderId : team.leaderId;
    const leaderMember = team.members.find((m: any) => {
      const memberId = typeof m.user === "object" ? m.user._id : m.user;
      return memberId?.toString() === leaderId?.toString();
    });
    return leaderMember?.user?.name || "Unknown";
  };

  // Auto-detect leader in creator_is_leader mode: first member with MANAGER role
  const getAutoLeader = (team: any) => {
    const manager = team.members.find((m: any) => m.role === "MANAGER");
    return manager?.user?.name || team.members[0]?.user?.name || "—";
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Teams Hub</h1>
          <p className="text-secondary mt-1">
            {isOrganizerCreatesMode
              ? "Organizer-managed teams — create teams and assign participants below."
              : "Participant-organized teams — participants form their own teams."}
          </p>
        </div>
        {isOrganizerCreatesMode && (
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="gap-2">
            <Plus size={16} /> Create Team
          </Button>
        )}
      </div>

      {/* Mode badge */}
      <div className="flex gap-3">
        <Badge variant={isOrganizerCreatesMode ? "default" : "secondary"} className="px-3 py-1">
          {isOrganizerCreatesMode ? "⚙ Organizer-Creates Mode" : "👥 Participant-Self-Organize Mode"}
        </Badge>
        <Badge variant={isOrganizerSelectsLeader ? "default" : "secondary"} className="px-3 py-1">
          {isOrganizerSelectsLeader ? "🏅 Organizer Selects Leader" : "🔑 Auto-Assign Leader"}
        </Badge>
      </div>

      {/* Error banner */}
      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex justify-between items-center">
          {actionError}
          <button onClick={() => setActionError(null)}><X size={14} /></button>
        </div>
      )}

      {/* Create Team Form (organizer_creates mode) */}
      {isOrganizerCreatesMode && showCreateForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Team Name</label>
                <Input
                  placeholder="e.g. Team Alpha"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
                />
              </div>
              <Button onClick={handleCreateTeam} disabled={creatingTeam || !newTeamName.trim()}>
                {creatingTeam ? "Creating..." : "Create"}
              </Button>
              <Button variant="ghost" onClick={() => { setShowCreateForm(false); setNewTeamName(""); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teams Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-secondary/10 pb-4">
          <CardTitle>Registered Teams ({teams.length})</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
            <input
              type="text"
              placeholder="Search teams..."
              className="w-full h-9 pl-9 pr-4 rounded-md border border-secondary/20 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-secondary font-medium border-b border-secondary/10">
                <tr>
                  <th className="px-6 py-4">Team Name</th>
                  <th className="px-6 py-4">Members</th>
                  <th className="px-6 py-4">Leader</th>
                  {isOrganizerCreatesMode && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/10">
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-8 text-secondary">Loading teams...</td></tr>
                ) : filteredTeams.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-secondary">
                    {isOrganizerCreatesMode ? "No teams yet. Create your first team above." : "No teams formed yet by participants."}
                  </td></tr>
                ) : (
                  filteredTeams.map((team) => {
                    const leaderName = isOrganizerSelectsLeader
                      ? (getLeaderName(team) || <span className="text-secondary italic text-xs">Not set</span>)
                      : getAutoLeader(team);
                    const isExpanded = expandedTeam === team._id;

                    return (
                      <>
                        <tr key={team._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-2">
                              {team.name}
                              {team.inviteCode && (
                                <span className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-secondary">
                                  {team.inviteCode}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1 flex-wrap">
                              {team.members.map((m: any, index: number) => {
                                const name = typeof m.user === "object" ? m.user?.name : "Unknown";
                                const memberId = typeof m.user === "object" ? m.user?._id : m.user;
                                const teamLeaderId = typeof team.leaderId === "object"
                                  ? team.leaderId?._id || team.leaderId
                                  : team.leaderId;
                                const isLeader = teamLeaderId && memberId?.toString() === teamLeaderId?.toString();
                                return (
                                  <Badge
                                    key={memberId || index}
                                    variant={isLeader ? "default" : "secondary"}
                                    className={`font-normal gap-1 ${isLeader ? "bg-amber-100 text-amber-800 border-amber-200" : ""}`}
                                  >
                                    {isLeader && <Shield size={10} />}
                                    {name || "Unknown User"}
                                  </Badge>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium">
                            {isOrganizerSelectsLeader ? (
                              <select
                                className="h-8 rounded border border-secondary/20 bg-surface text-sm px-2 focus:outline-none focus:ring-1 focus:ring-primary"
                                value={(() => {
                                  const lid = typeof team.leaderId === "object"
                                    ? team.leaderId?._id || team.leaderId
                                    : team.leaderId;
                                  return lid?.toString() || "";
                                })()}
                                onChange={(e) => handleSetLeader(team._id, e.target.value)}
                              >
                                <option value="">-- Select Leader --</option>
                                {team.members.map((m: any) => {
                                  const memberId = typeof m.user === "object" ? m.user?._id : m.user;
                                  const name = typeof m.user === "object" ? m.user?.name : "Unknown";
                                  return (
                                    <option key={memberId} value={memberId?.toString()}>
                                      {name}
                                    </option>
                                  );
                                })}
                              </select>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                <Shield size={13} className="text-amber-500" />
                                {leaderName}
                              </span>
                            )}
                          </td>
                          {isOrganizerCreatesMode && (
                            <td className="px-6 py-4 text-right">
                              <button
                                className="text-primary hover:text-primary-hover font-medium text-sm flex items-center gap-1 ml-auto"
                                onClick={() => setExpandedTeam(isExpanded ? null : team._id)}
                              >
                                <UserPlus size={14} />
                                {isExpanded ? "Close" : "Assign Member"}
                              </button>
                            </td>
                          )}
                        </tr>
                        {/* Expanded assign member row */}
                        {isOrganizerCreatesMode && isExpanded && (
                          <tr key={`${team._id}-assign`} className="bg-primary/5">
                            <td colSpan={4} className="px-6 py-4">
                              <div className="flex gap-3 items-end max-w-lg">
                                <div className="flex-1 space-y-1">
                                  <label className="text-xs font-semibold text-secondary uppercase tracking-wide">
                                    Assign by Email
                                  </label>
                                  <Input
                                    type="email"
                                    placeholder="participant@example.com"
                                    value={assignEmail[team._id] || ""}
                                    onChange={(e) =>
                                      setAssignEmail((prev) => ({ ...prev, [team._id]: e.target.value }))
                                    }
                                    onKeyDown={(e) => e.key === "Enter" && handleAssignMember(team._id)}
                                  />
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleAssignMember(team._id)}
                                  disabled={assigningFor === team._id || !assignEmail[team._id]?.trim()}
                                >
                                  {assigningFor === team._id ? "Assigning..." : "Assign"}
                                </Button>
                              </div>
                              <p className="text-xs text-secondary mt-2">
                                If no account exists for this email, a placeholder account will be created and they will be auto-advanced past the team formation step.
                              </p>
                            </td>
                          </tr>
                        )}
                      </>
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
