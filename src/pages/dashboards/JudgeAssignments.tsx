import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { judgeApi, type IEventJudge } from "../../api/judge.api";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Gavel, Calendar, BookOpen, ChevronRight, Trophy } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

export function JudgeAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<IEventJudge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'JUDGE' && user?.role !== 'ADMIN') {
      setLoading(false);
      return;
    }

    judgeApi.getMyAllAssignments()
      .then(res => setAssignments(res.data.data || []))
      .catch(err => console.error("Failed to fetch assignments", err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-secondary font-medium animate-pulse">Fetching your assignments...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-primary font-bold tracking-tight uppercase text-xs">
            <Gavel size={14} />
            <span>Judge Dashboard</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Judging Assignments</h1>
          <p className="text-secondary mt-2 flex items-center gap-2 font-medium">
            Manage and score the competition tracks assigned to you.
          </p>
        </div>
      </div>

      {assignments.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 shadow-none bg-slate-50/50">
          <CardContent className="py-20 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
              <Gavel size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Assignments Found</h3>
            <p className="text-secondary max-w-sm mx-auto mb-8">
              You haven't been assigned as a judge to any events yet. Check back once an organizer adds you!
            </p>
            <Link to="/">
              <Button variant="outline">Browse Active Events</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => {
            const event = assignment.event as any;
            return (
              <Card key={assignment._id} className="group hover:shadow-2xl transition-all duration-300 border-slate-200 overflow-hidden flex flex-col">
                <div className="h-32 bg-slate-100 relative overflow-hidden">
                  {event.posterImageUrl ? (
                    <img 
                      src={event.posterImageUrl} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                       <Trophy size={48} className="text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20 text-[10px] font-bold uppercase tracking-widest">
                      {assignment.assignedItems?.length} TRACKS ASSIGNED
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">
                    {event.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-tighter">
                    <Calendar size={14} className="text-primary" />
                    {new Date(event.registrationStartDate).toLocaleDateString()} — {new Date(event.registrationEndDate).toLocaleDateString()}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tracks to Grade</p>
                    <div className="flex flex-wrap gap-1.5">
                      {assignment.assignedItems?.slice(0, 3).map((item: any) => (
                        <Badge key={item._id} variant="secondary" className="text-[10px] font-bold bg-slate-50 border-slate-100 text-slate-600">
                          {item.name}
                        </Badge>
                      ))}
                      {assignment.assignedItems?.length > 3 && (
                        <span className="text-[10px] font-bold text-slate-400 ml-1">
                          +{assignment.assignedItems.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <Link to={`/events/${event._id || event}/judge`} className="w-full">
                    <Button className="w-full group/btn font-bold tracking-tight gap-2 bg-slate-900 hover:bg-slate-800 transition-all">
                      Open Judging Console
                      <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
