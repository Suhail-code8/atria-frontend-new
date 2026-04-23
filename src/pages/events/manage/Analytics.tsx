import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { eventsApi } from "../../../api/events.api";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Users, FileText, Activity, TrendingUp } from "lucide-react";

export function Analytics() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    eventsApi.getEventAnalytics(id)
      .then((res: any) => setData(res.data.data))
      .catch((err) => console.error("Failed to load analytics", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-secondary">Loading analytics...</div>;
  if (!data) return <div className="p-8 text-center text-danger">Failed to load data.</div>;

  const statCards = [
    { title: "Registrations", value: data.totalRegistrations, icon: <Users size={24} className="text-primary" /> },
    { title: "Submissions", value: data.totalSubmissions, icon: <FileText size={24} className="text-secondary" /> },
    { title: "Conversion Rate", value: `${data.conversionRate.toFixed(1)}%`, icon: <TrendingUp size={24} className="text-success" /> },
    { title: "Avg Score", value: data.averageScore ? data.averageScore.toFixed(2) : "N/A", icon: <Activity size={24} className="text-danger" /> },
  ];

  const totalSubs = data.totalSubmissions || 1; // avoid div by 0 for UI

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analytics</h1>
        <p className="text-secondary mt-1">Overview of event performance and metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary mb-1">{stat.title}</p>
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
              </div>
              <div className="p-3 bg-secondary/5 rounded-full">
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Submission Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.submissionsByStatus || {}).map(([status, count]: [string, any]) => (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{status}</span>
                    <span className="text-secondary">{count as number}</span>
                  </div>
                  <div className="h-2 w-full bg-secondary/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${((count as number) / totalSubs) * 100}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex items-center justify-center min-h-[300px]">
          <div className="text-center text-secondary">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>More detailed charts coming soon</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
