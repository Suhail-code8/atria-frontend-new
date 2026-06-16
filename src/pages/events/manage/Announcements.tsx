import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { announcementApi } from "../../../api/announcement.api";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Megaphone, Trash2 } from "lucide-react";
import { showToast } from "../../../lib/toast";

export function Announcements() {
  const { id } = useParams();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const fetchAnnouncements = () => {
    if (!id) return;
    setLoading(true);
    announcementApi.getForEvent(id)
      .then((res: any) => setAnnouncements(res.data.data))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [id]);

  const onSubmit = async (data: any) => {
    try {
      await announcementApi.create(id!, { ...data, sendEmail: true });
      reset();
      fetchAnnouncements();
    } catch {
      showToast.error("Failed to broadcast announcement.");
    }
  };

  const handleDelete = async (announcementId: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await announcementApi.delete(announcementId);
      fetchAnnouncements();
    } catch {
      showToast.error("Failed to delete announcement.");
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Announcements</h1>
        <p className="text-secondary mt-1">Broadcast messages to all event participants.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Megaphone className="text-primary" /> New Broadcast</CardTitle>
          <CardDescription>Submitting will immediately send an email and platform notification to all participants.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="broadcast-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input placeholder="Important Update" {...register("title", { required: true })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex-col flex h-full">
                  Priority
                  <select 
                    {...register("priority")}
                    className="flex h-10 w-full rounded-lg border border-secondary/20 bg-surface px-3 py-2 text-sm mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="INFO">Info</option>
                    <option value="WARNING">Warning</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message Body</label>
              <textarea 
                placeholder="Write your announcement here..."
                required
                className="w-full min-h-[120px] rounded-lg border border-secondary/20 bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                {...register("content", { required: true })} 
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="justify-end border-t border-secondary/10 mt-4">
          <Button type="submit" form="broadcast-form" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Broadcast Now"}
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">History</h3>
        {loading ? <p className="text-secondary">Loading...</p> : announcements.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-secondary/20 rounded-xl bg-slate-50 text-secondary">
            No announcements broadcasted yet.
          </div>
        ) : (
          announcements.map((ann) => (
            <Card key={ann._id} className="overflow-hidden">
              <div className="p-4 flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                  <Megaphone size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-slate-900">{ann.title}</h4>
                      <p className="text-xs text-secondary mb-2">{new Date(ann.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={ann.priority === 'WARNING' || ann.priority === 'URGENT' ? 'danger' : 'secondary'}>
                        {ann.priority}
                      </Badge>
                      <button onClick={() => handleDelete(ann._id)} className="text-secondary hover:text-danger p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{ann.content}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
