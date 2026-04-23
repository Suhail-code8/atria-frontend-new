import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { judgeApi, type IEventJudge } from "../../../api/judge.api";
import { competitionApi } from "../../../api/competition.api";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Gavel, Plus, Trash2, X, UserCheck, BookOpen } from "lucide-react";

export function Judges() {
  const { id } = useParams();
  const [judges, setJudges] = useState<IEventJudge[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite form state
  const [email, setEmail] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Edit state
  const [editingJudge, setEditingJudge] = useState<string | null>(null);
  const [editItems, setEditItems] = useState<string[]>([]);

  const fetchAll = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      judgeApi.getEventJudges(id),
      competitionApi.getItems(id),
    ])
      .then(([judgesRes, itemsRes]) => {
        setJudges(judgesRes.data.data || []);
        setItems(itemsRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  const handleInvite = async () => {
    if (!id || !email.trim()) return;
    setInviting(true);
    setError(null);
    try {
      await judgeApi.assignJudge(id, email.trim().toLowerCase(), selectedItems);
      setEmail("");
      setSelectedItems([]);
      setShowForm(false);
      fetchAll();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to assign judge.");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (judgeId: string) => {
    if (!confirm("Remove this judge from the event?")) return;
    try {
      await judgeApi.removeJudge(judgeId);
      fetchAll();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to remove judge.");
    }
  };

  const startEdit = (judge: IEventJudge) => {
    setEditingJudge(judge._id);
    setEditItems(judge.assignedItems.map((i) => i._id));
  };

  const handleUpdateItems = async (judgeId: string) => {
    try {
      await judgeApi.updateJudgeItems(judgeId, editItems);
      setEditingJudge(null);
      fetchAll();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to update assigned items.");
    }
  };

  const toggleItem = (itemId: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(itemId) ? list.filter((i) => i !== itemId) : [...list, itemId]);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Gavel className="text-primary" size={28} />
            Judge Management
          </h1>
          <p className="text-secondary mt-1">
            Assign judges to this event and specify which competition items they evaluate.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus size={16} /> Invite Judge
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex justify-between items-center">
          {error}
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {/* Invite Form */}
      {showForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck size={18} className="text-primary" />
              Invite a Judge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Judge Email</label>
              <Input
                type="email"
                placeholder="judge@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-secondary">
                A JUDGE account will be created if one doesn't exist. The judge can log in with their email.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <BookOpen size={14} />
                Assign Competition Items (the items this judge will evaluate)
              </label>
              {items.length === 0 ? (
                <p className="text-xs text-secondary italic">
                  No competition items found. Create items in Event Tracks first.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => toggleItem(item._id, selectedItems, setSelectedItems)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        selectedItems.includes(item._id)
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-slate-600 border-secondary/20 hover:border-primary/40"
                      }`}
                    >
                      {item.name}
                      <Badge variant="secondary" className="ml-2 text-xs py-0">
                        {item.type}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleInvite} disabled={inviting || !email.trim()} className="gap-2">
                {inviting ? "Assigning..." : "Assign Judge"}
              </Button>
              <Button variant="ghost" onClick={() => { setShowForm(false); setEmail(""); setSelectedItems([]); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Judges List */}
      {loading ? (
        <div className="text-center py-12 text-secondary">Loading judges...</div>
      ) : judges.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Gavel size={40} className="mx-auto text-secondary/30 mb-4" />
            <p className="text-secondary">No judges assigned yet.</p>
            <p className="text-xs text-secondary mt-1">Use the "Invite Judge" button to add judges and assign them to competition items.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {judges.map((judge) => (
            <Card key={judge._id} className="border-secondary/10">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {judge.user?.name?.charAt(0).toUpperCase() || "J"}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{judge.user?.name || "Unknown"}</p>
                        <p className="text-xs text-secondary">{judge.user?.email}</p>
                      </div>
                      <Badge variant="secondary" className="ml-2">JUDGE</Badge>
                    </div>

                    {/* Assigned Items */}
                    {editingJudge === judge._id ? (
                      <div className="space-y-3 mt-3">
                        <label className="text-xs font-semibold text-secondary uppercase tracking-wide">
                          Edit Assigned Items
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {items.map((item) => (
                            <button
                              key={item._id}
                              type="button"
                              onClick={() => toggleItem(item._id, editItems, setEditItems)}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                editItems.includes(item._id)
                                  ? "bg-primary text-white border-primary"
                                  : "bg-white text-slate-600 border-secondary/20 hover:border-primary/40"
                              }`}
                            >
                              {item.name}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateItems(judge._id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingJudge(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {judge.assignedItems?.length > 0 ? (
                          judge.assignedItems.map((item) => (
                            <Badge key={item._id} variant="secondary" className="gap-1">
                              <BookOpen size={11} />
                              {item.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-secondary italic">No items assigned</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {editingJudge !== judge._id && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(judge)}
                        className="gap-1"
                      >
                        Edit Items
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-danger border-danger/20 hover:bg-danger/5 gap-1"
                        onClick={() => handleRemove(judge._id)}
                      >
                        <Trash2 size={13} /> Remove
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
