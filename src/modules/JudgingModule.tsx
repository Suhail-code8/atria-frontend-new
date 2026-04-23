import { useState, useEffect } from "react";
import { submissionsApi } from "../api/submissions.api";
import { participationApi } from "../api/participation.api";
import { judgeApi } from "../api/judge.api";
import { resultApi } from "../api/result.api";
import { competitionApi } from "../api/competition.api";
import { useAuth } from "../auth/AuthContext";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/Card";
import { Gavel, Info, CheckCircle2, Star, MessageSquare, BookOpen, Trophy } from "lucide-react";

interface JudgingModuleProps {
  config: any;
  participation: any;
  isLastStep?: boolean;
  onAdvanced: (data: any) => void;
}

export default function JudgingModule({ config, participation, isLastStep, onAdvanced }: JudgingModuleProps) {
  const { user } = useAuth();
  const isJudge = user?.role === "JUDGE";

  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Judge-specific state
  const [assignedItems, setAssignedItems] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<Record<string, string>>({});
  const [selectedParticipantId, setSelectedParticipantId] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<Record<string, { place?: number; grade?: string }>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const eventId = participation.event?._id || participation.event;

  useEffect(() => {
    if (isJudge) {
      Promise.all([
        judgeApi.getMyAssignment(eventId),
        competitionApi.getEntriesByEvent(eventId)
      ])
        .then(([resAss, resEntries]) => {
          const assignment = resAss.data.data;
          setAssignedItems(assignment?.assignedItems || []);
          setEntries(resEntries.data.data || []);
        })
        .catch(() => {
           setAssignedItems([]);
           setEntries([]);
        })
        .finally(() => setIsLoading(false));
    } else {
      // Participant view: fetch their submission
      submissionsApi.getMySubmission(eventId)
        .then((res) => {
          const data = res.data.data;
          const sub = data && Array.isArray(data) && data.length > 0 ? data[0] : data;
          setSubmission(sub);
        })
        .catch(() => setSubmission(null))
        .finally(() => setIsLoading(false));
    }
  }, [participation, isJudge]);

  if (isLoading) {
    return (
      <div className="p-10 text-center text-secondary">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
        {isJudge ? "Loading your assigned items..." : "Loading results..."}
      </div>
    );
  }

  // ── Judge View ─────────────────────────────────────────────────────────────
  if (isJudge) {
    if (assignedItems.length === 0) {
      return (
        <Card className="border-slate-200">
          <CardContent className="text-center py-12">
            <Gavel size={40} className="mx-auto text-secondary/30 mb-4" />
            <h3 className="font-bold text-slate-900 text-lg">No items assigned</h3>
            <p className="text-sm text-secondary mt-2">
              The organizer has not yet assigned any competition items to you for this event.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Gavel size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-xl">Judge Panel</h2>
            <p className="text-sm text-secondary">You are assigned to evaluate {assignedItems.length} competition item(s).</p>
          </div>
        </div>

        {assignedItems.map((item) => {
          const itemScores = scores[item._id] || {};
          const isItemSubmitted = submitted[item._id];
          const isItemSubmitting = submitting[item._id];

          return (
            <Card key={item._id} className={`border-secondary/10 ${isItemSubmitted ? "bg-green-50/30 border-green-200" : ""}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpen size={16} className="text-primary" />
                    {item.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{item.type}</Badge>
                    {isItemSubmitted && (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 size={12} /> Scored
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isItemSubmitted ? (
                  <div className="text-center py-4 text-green-700 font-medium flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} />
                    Score submitted successfully
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Select Entry / Team</label>
                        <select
                          className="w-full h-10 px-3 rounded-md border border-secondary/20 bg-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                          value={selectedEntryId[item._id] || ""}
                          onChange={(e) => {
                            setSelectedEntryId(prev => ({ ...prev, [item._id]: e.target.value }));
                            setSelectedParticipantId(prev => ({ ...prev, [item._id]: "" }));
                          }}
                        >
                          <option value="">-- Choose Enrollment --</option>
                          {entries.filter(e => (typeof e.item === 'object' ? e.item._id : e.item) === item._id).map(e => {
                             const teamName = e.team ? (typeof e.team === 'object' ? e.team.name : e.team) : "Individual Entry";
                             return (
                                <option key={e._id} value={e._id}>{teamName}</option>
                             );
                          })}
                        </select>
                      </div>

                      {item.type === 'INDIVIDUAL' && selectedEntryId[item._id] && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="text-sm font-semibold text-slate-700">Select Specific Participant</label>
                          <select
                            className="w-full h-10 px-3 rounded-md border border-indigo-200 bg-indigo-50/30 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            value={selectedParticipantId[item._id] || ""}
                            onChange={(e) => setSelectedParticipantId(prev => ({ ...prev, [item._id]: e.target.value }))}
                          >
                            <option value="">-- Choose Member --</option>
                            {(entries.find(e => e._id === selectedEntryId[item._id])?.participants || []).map((p: any) => {
                               const pId = typeof p === 'object' ? p._id : p;
                               const pName = typeof p === 'object' ? p.name : "Member";
                               return (
                                  <option key={pId} value={pId}>{pName}</option>
                               );
                            })}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Place scoring */}
                    {item.placePoints && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold flex items-center gap-1">
                          <Trophy size={14} className="text-amber-500" />
                          Place (1st, 2nd, 3rd)
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3].map((place) => (
                            <button
                              key={place}
                              type="button"
                              onClick={() =>
                                setScores((prev) => ({
                                  ...prev,
                                  [item._id]: {
                                    ...prev[item._id],
                                    place: prev[item._id]?.place === place ? undefined : place,
                                  },
                                }))
                              }
                              className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                                itemScores.place === place
                                  ? "bg-amber-500 text-white border-amber-500"
                                  : "border-secondary/20 hover:border-amber-400 hover:bg-amber-50"
                              }`}
                            >
                              {place === 1 ? "🥇 1st" : place === 2 ? "🥈 2nd" : "🥉 3rd"}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grade scoring */}
                    {item.gradeRanges && item.gradeRanges.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold flex items-center gap-1">
                          <Star size={14} className="text-indigo-500" />
                          Grade
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {item.gradeRanges.map((r: any) => {
                            const grade = r.grade;
                            return (
                            <button
                              key={grade}
                              type="button"
                              onClick={() =>
                                setScores((prev) => ({
                                  ...prev,
                                  [item._id]: {
                                    ...prev[item._id],
                                    grade: prev[item._id]?.grade === grade ? undefined : grade,
                                  },
                                }))
                              }
                              className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-colors ${
                                itemScores.grade === grade
                                  ? "bg-indigo-600 text-white border-indigo-600"
                                  : "border-secondary/20 hover:border-indigo-400 hover:bg-indigo-50"
                              }`}
                            >
                              Grade {grade}
                            </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      disabled={
                        isItemSubmitting || 
                        !selectedEntryId[item._id] || 
                        (item.type === 'INDIVIDUAL' && !selectedParticipantId[item._id]) ||
                        (!itemScores.place && !itemScores.grade)
                      }
                      onClick={async () => {
                        setSubmitting((prev) => ({ ...prev, [item._id]: true }));
                        try {
                          await resultApi.addResult({
                            eventId,
                            itemId: item._id,
                            entryId: selectedEntryId[item._id],
                            participantId: item.type === 'INDIVIDUAL' ? selectedParticipantId[item._id] : undefined,
                            place: itemScores.place,
                            grade: itemScores.grade,
                          });
                          // Reset selection for individual items after success to allow scoring next person
                          if (item.type === 'INDIVIDUAL') {
                             setSelectedParticipantId(prev => ({ ...prev, [item._id]: "" }));
                             setScores(prev => ({ ...prev, [item._id]: {} }));
                             alert("Score saved for participant.");
                          } else {
                             setSubmitted((prev) => ({ ...prev, [item._id]: true }));
                          }
                        } catch (e: any) {
                          alert(e?.response?.data?.message || "Failed to submit score. Ensure entries exist for this item.");
                        } finally {
                          setSubmitting((prev) => ({ ...prev, [item._id]: false }));
                        }
                      }}
                    >
                      {isItemSubmitting ? "Submitting..." : "Submit Score"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  const review = submission?.review;
  const isGraded = !!review;

  const handleProceed = () => {
    participationApi
      .advance(participation._id)
      .then((res) => onAdvanced(res.data.data.participation))
      .catch(() => alert("Waiting for official advancement. Please check back later."));
  };

  return (
    <Card className={`border-slate-200 ${isGraded ? "bg-indigo-50/20" : "bg-slate-50/50"}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 text-slate-800">
            <Gavel size={20} />
            <CardTitle>Judging Phase</CardTitle>
          </div>
          <Badge variant={isGraded ? "success" : "secondary"}>
            {isGraded ? "Graded" : "In Progress"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isGraded ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <Star size={32} fill="currentColor" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">{review.score} / 100</h3>
              <p className="text-sm text-secondary font-medium lowercase tracking-tight">Final Evaluation Score</p>
            </div>

            {review.comment && (
              <div className="bg-white p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2 text-secondary">
                  <MessageSquare size={14} />
                  <span className="text-xs font-bold uppercase tracking-widest">Judge's Feedback</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic">"{review.comment}"</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
              <Info size={32} className="text-indigo-500" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Your work is under review</h3>
            <p className="text-sm text-secondary mt-2 max-w-xs mx-auto">
              The judges are currently evaluating your submission. You'll be notified once the results are published.
            </p>
          </div>
        )}

        <div className="mt-6 space-y-2">
          <p className="text-xs font-bold text-secondary uppercase tracking-widest pl-1">Scoring Rubric</p>
          {config.rubric?.map((item: any, idx: number) => (
            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-100 flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">{item.criteria}</span>
              <span className="text-xs text-secondary">{item.weight}% Weight</span>
            </div>
          )) || (
            <p className="text-xs text-secondary italic pl-1">Standard evaluation criteria apply.</p>
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
