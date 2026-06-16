import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { submissionsApi } from "../../../api/submissions.api";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Slider } from "../../../components/ui/Slider";
import { Trophy, Star } from "lucide-react";
import { showToast } from "../../../lib/toast";

export function Scoring() {
  const { id } = useParams();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // For the sake of the UI requested: "Slider based judging UI"
  const [activeSub, setActiveSub] = useState<any | null>(null);
  const [score, setScore] = useState(50);
  const [comment, setComment] = useState("");

  const fetchSubmissions = () => {
    if (!id) return;
    setLoading(true);
    submissionsApi.getEventSubmissions(id)
      .then((res: any) => {
        const subs = res.data.data.filter((s:any) => s.status === 'ACCEPTED' && !s.review);
        setSubmissions(subs);
        if (subs.length > 0 && !activeSub) setActiveSub(subs[0]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubmissions();
  }, [id]);

  const submitScore = async () => {
    if (!activeSub) return;
    try {
      await submissionsApi.reviewSubmission(id!, activeSub._id, { score, comment, status: 'ACCEPTED' as any });
      showToast.success("Score submitted!");
      setScore(50);
      setComment("");
      setActiveSub(null);
      fetchSubmissions();
    } catch {
      showToast.error("Failed to submit score. Please try again.");
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Scoring Console</h1>
        <p className="text-secondary mt-1">Evaluate and grade accepted submissions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 border-r border-secondary/10 pr-4">
          <h3 className="font-semibold text-slate-900 mb-4 px-2 tracking-tight">Requires Grading ({submissions.length})</h3>
          {loading ? (
            <p className="text-secondary px-2">Loading...</p>
          ) : submissions.length === 0 ? (
            <p className="text-secondary px-2">No submissions left to grade.</p>
          ) : (
            <div className="space-y-2">
              {submissions.map((sub) => (
                <div 
                  key={sub._id}
                  onClick={() => { setActiveSub(sub); setScore(50); setComment(""); }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${activeSub?._id === sub._id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-slate-50'}`}
                >
                  <p className="font-medium text-slate-900 text-sm truncate">{sub.title}</p>
                  <p className="text-xs text-secondary truncate mt-1">By Participant: {sub.participant?.user?.name || sub.participant?._id || 'Unknown Participant'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {!activeSub ? (
            <Card className="min-h-[400px] flex items-center justify-center text-secondary border-dashed">
               <div className="text-center">
                 <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
                 <p>Select a submission to grade</p>
               </div>
            </Card>
          ) : (
            <Card className="border-primary/20 shadow-elevated">
              <CardHeader className="bg-slate-50 border-b border-secondary/10 rounded-t-xl pb-6">
                <CardTitle className="text-2xl mb-2">{activeSub.title}</CardTitle>
                <div className="text-sm text-secondary bg-white p-4 justify-between rounded border border-secondary/10 whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {activeSub.content || "No content."}
                </div>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-8">
                <div>
                   <div className="flex justify-between items-center mb-4">
                     <label className="font-semibold text-slate-900 flex items-center gap-2">
                       <Star className="text-primary w-4 h-4" /> Final Score
                     </label>
                     <div className="text-2xl font-bold text-primary">{score} <span className="text-sm text-secondary font-medium">/ 100</span></div>
                   </div>
                   <Slider 
                     min={0} max={100} step={1} 
                     value={score} 
                     onChange={(e) => setScore(parseInt(e.target.value))} 
                   />
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-slate-900">Feedback Comments</label>
                  <textarea 
                    className="w-full min-h-[100px] rounded-lg border border-secondary/20 bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="Provide constructive feedback..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t border-secondary/10 pt-4 justify-end">
                <Button size="lg" className="px-8 shadow-md" onClick={submitScore}>
                  Finalize Score
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
