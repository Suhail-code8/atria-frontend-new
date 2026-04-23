import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { competitionApi, type ICategory } from "../../../api/competition.api";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Plus, Trash2, Trophy, Star, X, Settings2 } from "lucide-react";

const DEFAULT_PLACE_POINTS = { first: 10, second: 6, third: 2 };
const DEFAULT_GRADE_RANGES = [
  { grade: "A", minPoints: 0, maxPoints: 5 },
  { grade: "B", minPoints: 0, maxPoints: 3 },
  { grade: "C", minPoints: 0, maxPoints: 1 },
];

function ScoringSection({
  label,
  icon,
  fields,
  values,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  fields: { key: string; label: string }[];
  values: Record<string, number>;
  onChange: (key: string, val: number) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-secondary uppercase tracking-wide flex items-center gap-1">
        {icon} {label}
      </label>
      <div className="grid grid-cols-3 gap-2">
        {fields.map((f) => (
          <div key={f.key} className="space-y-1">
            <label className="text-[10px] text-secondary">{f.label}</label>
            <Input
              type="number"
              min={0}
              value={values[f.key] ?? 0}
              onChange={(e) => onChange(f.key, Number(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function GradeRangesSection({
  ranges,
  onChange
}: {
  ranges: { grade: string, minPoints: number, maxPoints: number }[];
  onChange: (ranges: any) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-secondary uppercase tracking-wide flex items-center gap-1">
        <Star size={12} className="text-indigo-500" /> Grade Ranges
      </label>
      <div className="space-y-2">
        {ranges.map((range, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input 
              placeholder="Grade Label (e.g. A)" 
              value={range.grade} 
              onChange={(e) => {
                const newRanges = [...ranges];
                newRanges[i].grade = e.target.value;
                onChange(newRanges);
              }}
              className="h-8 text-sm"
            />
            <Input 
              type="number" 
              placeholder="Min" 
              value={range.minPoints} 
              onChange={(e) => {
                const newRanges = [...ranges];
                newRanges[i].minPoints = Number(e.target.value);
                onChange(newRanges);
              }}
              className="h-8 text-sm w-20"
            />
            <Input 
              type="number" 
              placeholder="Max" 
              value={range.maxPoints} 
              onChange={(e) => {
                const newRanges = [...ranges];
                newRanges[i].maxPoints = Number(e.target.value);
                onChange(newRanges);
              }}
              className="h-8 text-sm w-20"
            />
            <Button variant="ghost" size="sm" className="h-8 px-2 text-danger" onClick={() => {
              const newRanges = ranges.filter((_, idx) => idx !== i);
              onChange(newRanges);
            }}><X size={14}/></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" className="h-8 text-xs w-full" onClick={() => onChange([...ranges, { grade: "", minPoints: 0, maxPoints: 0 }])}>
          <Plus size={12} className="mr-1"/> Add Grade
        </Button>
      </div>
    </div>
  );
}

export function CompetitionsSetup() {
  const { id } = useParams();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New item form
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"INDIVIDUAL" | "GROUP">("INDIVIDUAL");
  const [newMinMembers, setNewMinMembers] = useState(1);
  const [newMaxMembers, setNewMaxMembers] = useState(1);
  const [newPlacePoints, setNewPlacePoints] = useState({ ...DEFAULT_PLACE_POINTS });
  const [newGradeRanges, setNewGradeRanges] = useState([ ...DEFAULT_GRADE_RANGES ]);
  const [newCountsTowardOverallTotal, setNewCountsTowardOverallTotal] = useState(true);
  const [newAllowedCategories, setNewAllowedCategories] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPlacePoints, setEditPlacePoints] = useState({ ...DEFAULT_PLACE_POINTS });
  const [editGradeRanges, setEditGradeRanges] = useState<any[]>([]);
  const [editCountsTowardOverallTotal, setEditCountsTowardOverallTotal] = useState(true);
  const [editAllowedCategories, setEditAllowedCategories] = useState<string[]>([]);
  const [editMaxMembers, setEditMaxMembers] = useState(1);
  const [saving, setSaving] = useState(false);

  const fetchItemsAndCategories = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      competitionApi.getItems(id),
      competitionApi.getCategories(id)
    ])
      .then(([resItems, resCats]) => {
        setItems(resItems.data.data);
        setCategories(resCats.data.data);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItemsAndCategories(); }, [id]);

  const handleCreate = async () => {
    if (!id || !newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await competitionApi.createItem(id, {
        name: newName.trim(),
        type: newType,
        minParticipantsPerTeam: newType === "INDIVIDUAL" ? 1 : newMinMembers,
        maxParticipantsPerTeam: newType === "INDIVIDUAL" ? 1 : newMaxMembers,
        placePoints: newPlacePoints,
        gradeRanges: newGradeRanges,
        countsTowardOverallTotal: newCountsTowardOverallTotal,
        allowedCategories: newAllowedCategories
      });
      setNewName("");
      setNewType("INDIVIDUAL");
      setNewMinMembers(1);
      setNewMaxMembers(1);
      setNewPlacePoints({ ...DEFAULT_PLACE_POINTS });
      setNewGradeRanges([...DEFAULT_GRADE_RANGES]);
      setNewCountsTowardOverallTotal(true);
      setNewAllowedCategories([]);
      setShowForm(false);
      fetchItemsAndCategories();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to create track.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Delete this competition track?")) return;
    try {
      await competitionApi.deleteItem(itemId);
      fetchItemsAndCategories();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to delete track.");
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item._id);
    setEditName(item.name);
    setEditPlacePoints({
      first: item.placePoints?.first ?? 10,
      second: item.placePoints?.second ?? 6,
      third: item.placePoints?.third ?? 2,
    });
    setEditGradeRanges(item.gradeRanges?.length ? item.gradeRanges : [...DEFAULT_GRADE_RANGES]);
    setEditCountsTowardOverallTotal(item.countsTowardOverallTotal ?? true);
    setEditAllowedCategories(item.allowedCategories?.map((c: any) => c._id) || []);
    setEditMaxMembers(item.maxParticipantsPerTeam ?? 1);
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    setError(null);
    try {
      await competitionApi.updateItem(editingId, {
        name: editName.trim(),
        placePoints: editPlacePoints,
        gradeRanges: editGradeRanges,
        countsTowardOverallTotal: editCountsTowardOverallTotal,
        maxParticipantsPerTeam: editMaxMembers,
        allowedCategories: editAllowedCategories
      });
      setEditingId(null);
      fetchItemsAndCategories();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to update track.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Event Tracks / Competitions</h1>
          <p className="text-secondary mt-1">Define competition tracks, scoring, and participation rules.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus size={16} /> Add Track
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex justify-between items-center">
          {error}
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Settings2 size={16}/> Create New Track</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Track Name</label>
                <Input
                  placeholder="e.g. UI Design Sprint"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Participation Type</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-secondary/20 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as "INDIVIDUAL" | "GROUP")}
                >
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="GROUP">Team / Group</option>
                </select>
              </div>
            </div>

            {newType === "GROUP" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Members per Team</label>
                  <Input type="number" min={1} value={newMinMembers} onChange={(e) => setNewMinMembers(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Members per Team</label>
                  <Input type="number" min={1} value={newMaxMembers} onChange={(e) => setNewMaxMembers(Number(e.target.value))} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
                <div className="space-y-2">
                  <label className="text-sm font-medium block">Eligible Participant Categories</label>
                  <select
                    multiple
                    className="w-full h-24 p-2 rounded-md border border-secondary/20 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={newAllowedCategories}
                    onChange={(e) => {
                      const options = Array.from(e.target.selectedOptions);
                      setNewAllowedCategories(options.map(o => o.value));
                    }}
                  >
                    {categories.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  <span className="text-xs text-secondary mt-1 block">Hold Ctrl/Cmd to select multiple. Leave empty to allow everyone.</span>
                </div>
                
                <div className="space-y-2">
                   <label className="text-sm font-medium block">Leaderboard Settings</label>
                   <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newCountsTowardOverallTotal}
                        onChange={(e) => setNewCountsTowardOverallTotal(e.target.checked)}
                        className="rounded border-secondary/20 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Counts Toward Overall Event Total</span>
                   </label>
                   <p className="text-xs text-secondary mt-1">If unchecked, points won't add to cumulative team/individual score.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
              <ScoringSection
                label="Place Points"
                icon={<Trophy size={12} className="text-amber-500" />}
                fields={[
                  { key: "first", label: "1st Place" },
                  { key: "second", label: "2nd Place" },
                  { key: "third", label: "3rd Place" },
                ]}
                values={newPlacePoints}
                onChange={(k, v) => setNewPlacePoints((p) => ({ ...p, [k]: v }))}
              />
              <GradeRangesSection 
                ranges={newGradeRanges}
                onChange={setNewGradeRanges}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
                {creating ? "Creating..." : "Create Track"}
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-secondary">Loading tracks...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-secondary/20 rounded-xl text-secondary">
            No competition tracks created yet. Click "Add Track" to get started.
          </div>
        ) : (
          items.map((item) => {
            const isEditing = editingId === item._id;
            return (
              <Card key={item._id} className={`transition-colors ${isEditing ? "border-primary/30 bg-primary/5" : "hover:border-primary/20"}`}>
                <CardContent className="pt-5 pb-5">
                  {isEditing ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Track Name</label>
                          <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                        </div>
                        {item.type === "GROUP" ? (
                            <div className="space-y-2">
                            <label className="text-sm font-medium">Max Members per Team</label>
                            <Input type="number" min={1} value={editMaxMembers} onChange={(e) => setEditMaxMembers(Number(e.target.value))} />
                            </div>
                        ) : <div/>}
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
                        <div className="space-y-2">
                          <label className="text-sm font-medium block">Eligible Participant Categories</label>
                          <select
                            multiple
                            className="w-full h-24 p-2 rounded-md border border-secondary/20 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            value={editAllowedCategories}
                            onChange={(e) => {
                              const options = Array.from(e.target.selectedOptions);
                              setEditAllowedCategories(options.map(o => o.value));
                            }}
                          >
                            {categories.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium block">Leaderboard Settings</label>
                          <label className="flex items-center gap-2 mt-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={editCountsTowardOverallTotal}
                                onChange={(e) => setEditCountsTowardOverallTotal(e.target.checked)}
                                className="rounded border-secondary/20 text-primary focus:ring-primary"
                              />
                              <span className="text-sm">Counts Toward Overall Event Total</span>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
                        <ScoringSection
                          label="Place Points"
                          icon={<Trophy size={12} className="text-amber-500" />}
                          fields={[
                            { key: "first", label: "1st" },
                            { key: "second", label: "2nd" },
                            { key: "third", label: "3rd" },
                          ]}
                          values={editPlacePoints}
                          onChange={(k, v) => setEditPlacePoints((p) => ({ ...p, [k]: v }))}
                        />
                         <GradeRangesSection 
                          ranges={editGradeRanges}
                          onChange={setEditGradeRanges}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary">{item.type}</Badge>
                          {item.type === "GROUP" && (
                            <Badge variant="secondary">
                              {item.minParticipantsPerTeam}–{item.maxParticipantsPerTeam} members
                            </Badge>
                          )}
                          {!item.countsTowardOverallTotal && (
                              <Badge variant="secondary" className="bg-red-50 text-red-600">Exclusive of Total</Badge>
                          )}
                          {item.allowedCategories && item.allowedCategories.length > 0 && (
                            <Badge variant="secondary">{item.allowedCategories.length} Categories Limited</Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-8 text-sm">
                          {item.placePoints && (
                            <div className="space-y-1 mt-2">
                                <span className="font-semibold text-secondary text-xs flex items-center gap-1"><Trophy size={12}/> Places</span>
                                <div className="text-slate-600">1st: {item.placePoints.first} | 2nd: {item.placePoints.second} | 3rd: {item.placePoints.third}</div>
                            </div>
                          )}
                          {item.gradeRanges && item.gradeRanges.length > 0 && (
                            <div className="space-y-1 mt-2">
                                <span className="font-semibold text-secondary text-xs flex items-center gap-1"><Star size={12}/> Grades</span>
                                <div className="text-slate-600 flex gap-2 flex-wrap">
                                    {item.gradeRanges.map((r: any) => (
                                        <span key={r.grade}>{r.grade}: {r.maxPoints} pts</span>
                                    ))}
                                </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 border-l border-border pl-4">
                        <Button variant="outline" size="sm" onClick={() => startEdit(item)}>
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-danger border-danger/20 hover:bg-danger/10"
                          onClick={() => handleDelete(item._id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
