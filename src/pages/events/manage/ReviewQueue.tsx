import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { submissionsApi } from "../../../api/submissions.api";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { FileText, CheckCircle, XCircle } from "lucide-react";
import { showToast } from "../../../lib/toast";

export function ReviewQueue() {
  const { id } = useParams();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = () => {
    if (!id) return;
    setLoading(true);
    submissionsApi.getEventSubmissions(id)
      .then((res: any) => setSubmissions(res.data.data.filter((s: any) => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW')))
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQueue();
  }, [id]);

  const handleReview = async (subId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await submissionsApi.updateSubmissionStatus(id!, subId, status as any);
      fetchQueue();
    } catch {
      showToast.error("Failed to update submission status.");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Review Queue</h1>
        <p className="text-secondary mt-1">Review pending participant submissions.</p>
      </div>

      {loading ? (
        <div className="text-secondary py-12">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <Card className="text-center py-16 bg-slate-50 border-dashed border-2 px-6">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">You're all caught up!</h3>
          <p className="text-secondary">No submissions are currently pending review.</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {submissions.map((sub) => (
            <Card key={sub._id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <CardTitle>{sub.title}</CardTitle>
                    <Badge variant={sub.status === 'UNDER_REVIEW' ? 'default' : 'secondary'}>{sub.status}</Badge>
                  </div>
                  <p className="text-sm text-secondary">Submitted by: {sub.participant?.user?.name || sub.participant?._id || 'Unknown Participant'}</p>
                </div>
                <div className="bg-primary/5 p-2 rounded-lg text-primary">
                  <FileText size={20} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 whitespace-pre-wrap border border-secondary/10">
                  {sub.content || "No text content provided."}
                </div>
                {sub.file && (
                  <div className="mt-4 pt-4 border-t border-secondary/10">
                    <a href={sub.file.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm font-medium flex items-center gap-2">
                      <FileText size={16} /> View Attached File ({sub.file.originalName})
                    </a>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-slate-50 border-t border-secondary/10 py-3 flex justify-end gap-3 rounded-b-xl pr-6">
                <Button variant="outline" className="gap-2 text-danger border-danger/20 hover:bg-danger/10" onClick={() => handleReview(sub._id, 'REJECTED')}>
                  <XCircle size={16} /> Reject
                </Button>
                <Button className="gap-2 bg-success hover:bg-success/90" onClick={() => handleReview(sub._id, 'ACCEPTED')}>
                  <CheckCircle size={16} /> Accept
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
