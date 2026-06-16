import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { eventsApi } from "../../../api/events.api";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { EventStatus, type Event } from "../../../types";
import { Loader2, Rocket, RotateCcw, Play, CheckCircle2, Archive, XCircle } from "lucide-react";
import { showToast } from "../../../lib/toast";

const displayDate = (d: string | Date | undefined) => {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 16);
};

const settingsSchema = z.object({
  title: z.string().min(3, "Title is too short"),
  description: z.string().min(10, "Description is too short"),
  startDate: z.string(),
  endDate: z.string(),
  isPublic: z.boolean(),
  isPaid: z.boolean(),
  price: z.number().min(0).optional(),
  totalSeats: z.number().min(1).optional()
});

export function Settings() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [transitioning, setTransitioning] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm({
    resolver: zodResolver(settingsSchema),
  });

  const fetchEvent = async () => {
    if (!id) return;
    try {
      const res = await eventsApi.getEvent(id);
      const ev = res.data.data;
      setEvent(ev);
      reset({
        title: ev.title,
        description: ev.description,
        startDate: displayDate(ev.startDate),
        endDate: displayDate(ev.endDate),
        isPublic: ev.isPublic,
        isPaid: !!ev.isPaid,
        price: ev.price || 0,
        totalSeats: ev.totalSeats || 100
      });
    } catch (err) {
      console.error("Failed to fetch event", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id, reset]);

  const onTransition = async (target: EventStatus) => {
    if (!id) return;
    setTransitioning(target);
    try {
      await eventsApi.transitionEvent(id, target);
      showToast.success(`Event status updated to ${target}`);
      await fetchEvent();
    } catch (err: any) {
      showToast.error(err.response?.data?.message || "Failed to transition event.");
    } finally {
      setTransitioning(null);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      await eventsApi.updateEvent(id!, data);
      showToast.success("Settings saved!");
      await fetchEvent();
    } catch {
      showToast.error("Failed to save settings.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-secondary">Loading event settings...</p>
    </div>
  );

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case EventStatus.DRAFT: return <Badge variant="secondary">Draft</Badge>;
      case EventStatus.PUBLISHED: return <Badge variant="success">Published</Badge>;
      case EventStatus.REGISTRATION_OPEN: return <Badge variant="success">Registration Open</Badge>;
      case EventStatus.ONGOING: return <Badge variant="default">Live Now</Badge>;
      case EventStatus.COMPLETED: return <Badge variant="outline">Completed</Badge>;
      case EventStatus.CANCELLED: return <Badge variant="danger">Cancelled</Badge>;
      case EventStatus.ARCHIVED: return <Badge variant="secondary">Archived</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-3xl space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Event Management</h1>
        <p className="text-secondary mt-1">Control your event lifecycle and general configuration.</p>
      </div>

      {/* Lifecycle Status Card */}
      <Card className="border-primary/20 shadow-md bg-primary/5">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Lifecycle Status</CardTitle>
              <CardDescription>Transition your event through its operational stages.</CardDescription>
            </div>
            {event && getStatusBadge(event.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {event?.status === EventStatus.DRAFT && (
              <>
                <Button 
                  onClick={() => onTransition(EventStatus.PUBLISHED)} 
                  disabled={!!transitioning}
                  className="gap-2"
                >
                  {transitioning === EventStatus.PUBLISHED ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
                  Publish Event
                </Button>
                <Button variant="outline" onClick={() => onTransition(EventStatus.CANCELLED)} className="text-danger border-danger/20 hover:bg-danger/5 gap-2">
                  <XCircle size={16} /> Cancel Event
                </Button>
              </>
            )}

            {event?.status === EventStatus.PUBLISHED && (
              <>
                <Button 
                  onClick={() => onTransition(EventStatus.REGISTRATION_OPEN)} 
                  disabled={!!transitioning}
                  className="gap-2"
                >
                   {transitioning === EventStatus.REGISTRATION_OPEN ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                  Open Registration
                </Button>
                <Button variant="outline" onClick={() => onTransition(EventStatus.DRAFT)} disabled={!!transitioning} className="gap-2">
                  <RotateCcw size={16} /> Revert to Draft
                </Button>
              </>
            )}

            {event?.status === EventStatus.REGISTRATION_OPEN && (
              <>
                <Button 
                  onClick={() => onTransition(EventStatus.ONGOING)} 
                  disabled={!!transitioning}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                   {transitioning === EventStatus.ONGOING ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                  Start Event Now
                </Button>
              </>
            )}

            {event?.status === EventStatus.ONGOING && (
              <Button 
                onClick={() => onTransition(EventStatus.COMPLETED)} 
                disabled={!!transitioning}
                className="gap-2"
              >
                 {transitioning === EventStatus.COMPLETED ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Mark as Completed
              </Button>
            )}

            {(event?.status === EventStatus.COMPLETED || event?.status === EventStatus.CANCELLED) && (
              <Button variant="outline" onClick={() => onTransition(EventStatus.ARCHIVED)} disabled={!!transitioning} className="gap-2">
                <Archive size={16} /> Move to Archive
              </Button>
            )}
          </div>
          <p className="text-[11px] text-secondary mt-4 italic font-medium">
            Note: Some transitions require specific preconditions (title, description, dates) to be met.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>Update the basic details of your event.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input {...register("title")} error={!!errors.title} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea 
                className="w-full min-h-[120px] rounded-lg border border-secondary/20 bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                {...register("description")} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input type="datetime-local" {...register("startDate")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input type="datetime-local" {...register("endDate")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-secondary/10">
               <div className="space-y-2 flex flex-col justify-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register("isPublic")} className="accent-primary w-4 h-4 cursor-pointer" />
                    <span className="text-sm font-medium">Event is Public (Listed on Home)</span>
                  </label>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium">Total Capacity (Seats)</label>
                  <Input type="number" {...register("totalSeats", { valueAsNumber: true })} />
               </div>
            </div>
            
            <div className="pt-4 border-t border-secondary/10">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input type="checkbox" {...register("isPaid")} className="accent-primary w-4 h-4 cursor-pointer" />
                <span className="text-sm font-medium">Paid Event</span>
              </label>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ticket Price (₹)</label>
                <Input type="number" {...register("price", { valueAsNumber: true })} />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="justify-end border-t border-secondary/10 mt-4">
          <Button type="submit" form="settings-form" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
