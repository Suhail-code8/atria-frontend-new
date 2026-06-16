import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { eventsApi } from "../../../api/events.api";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../../components/ui/Card";
import { EventType } from "../../../types";
import { Sparkles, Calendar, Type, Paperclip } from "lucide-react";
import { showToast } from "../../../lib/toast";

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  eventType: z.nativeEnum(EventType),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

export function CreateEvent() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      eventType: EventType.CONFERENCE,
    }
  });

  const onSubmit = async (data: EventFormValues) => {
    try {
      const res = await eventsApi.createEvent({
        ...data,
        isPublic: true,
        status: 'DRAFT',
      } as any);
      
      if (res.data.success) {
        // Redirect to the Workflow Builder immediately
        navigate(`/events/${res.data.data._id}/builder`);
      }
    } catch (error) {
      console.error("Failed to create event:", error);
      showToast.error("Error creating event. Please ensure Title is unique and all fields are valid.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-sm border border-primary/20">
          <Sparkles className="text-primary" size={32} />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Launch Your Event</h1>
        <p className="text-secondary mt-2 text-lg">Start with the basics, then design the experience in the builder.</p>
      </div>

      <Card className="shadow-xl border-slate-200 bg-white/80 backdrop-blur-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-xl">Event Fundamentals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Type size={16} className="text-primary" />
                Event Title *
              </label>
              <Input 
                {...register("title")} 
                placeholder="e.g. Global Tech Summit 2026" 
                className="h-12 text-lg shadow-sm"
                error={!!errors.title}
              />
              {errors.title && <p className="text-xs text-danger font-medium">{errors.title.message}</p>}
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                Event Nature
              </label>
              <select 
                {...register("eventType")}
                className="w-full h-12 rounded-lg border border-secondary/20 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {Object.values(EventType).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Paperclip size={16} className="text-primary" />
                Short Description (Optional)
              </label>
              <textarea 
                {...register("description")}
                className="w-full rounded-lg border border-secondary/20 bg-white px-3 py-2 text-sm min-h-[100px] shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="A brief overview of your event..."
              />
            </div>

            {/* Dates (Optional Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  Start Date (Optional)
                </label>
                <Input type="date" {...register("startDate")} className="shadow-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  End Date (Optional)
                </label>
                <Input type="date" {...register("endDate")} className="shadow-sm" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t border-slate-100 pt-6">
            <Button 
              type="submit" 
              className="w-full h-12 text-lg shadow-lg shadow-primary/20" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Event & Open Builder"}
            </Button>
            <p className="text-[10px] text-center text-secondary uppercase tracking-widest font-bold">
              Capabilities (Registration, Teams, etc.) will be added in the next step
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
