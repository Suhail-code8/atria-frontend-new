import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { participationApi } from "../../../api/participation.api";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Search } from "lucide-react";
import { showToast } from "../../../lib/toast";

export function Participants() {
  const { id } = useParams();
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchParticipants = () => {
    if (!id) return;
    setLoading(true);
    participationApi.listParticipants(id)
      .then((res: any) => setParticipants(res.data.data || []))
      .catch(() => setParticipants([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchParticipants();
  }, [id]);

  const handleStatusUpdate = async (participationId: string, status: string) => {
    setUpdatingId(participationId);
    try {
      await participationApi.updateParticipationStatus(participationId, status as any);
      fetchParticipants();
    } catch {
      showToast.error("Failed to update participant status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = participants.filter(p => 
    p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Participants</h1>
        <p className="text-secondary mt-1">Manage attendees and review custom registration answers.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-secondary/10 pb-4">
          <CardTitle>All Participants ({participants.length})</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
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
                  <th className="px-6 py-4">Participant</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Registered On</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/10">
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-8 text-secondary">Loading participants...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-secondary">No participants found.</td></tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{p.user?.name}</div>
                        <div className="text-xs text-secondary">{p.user?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={p.status === 'APPROVED' || p.status === 'REGISTERED' ? 'success' : 'secondary'}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-secondary">
                        {new Date(p.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button 
                          className="text-primary hover:text-primary-hover font-medium disabled:opacity-50"
                          onClick={() => handleStatusUpdate(p._id, 'APPROVED')}
                          disabled={updatingId === p._id}
                        >
                          {updatingId === p._id ? "..." : "Approve"}
                        </button>
                        <button 
                          className="text-danger hover:text-danger/80 font-medium disabled:opacity-50"
                          onClick={() => handleStatusUpdate(p._id, 'REJECTED')}
                          disabled={updatingId === p._id}
                        >
                          {updatingId === p._id ? "..." : "Reject"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
