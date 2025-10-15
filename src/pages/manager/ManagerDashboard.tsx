import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, AlertTriangle, CheckCircle2, LogOut, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Profile {
  full_name: string;
  employee_id: string;
}

interface HazardReport {
  id: string;
  title: string;
  severity: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    employee_id: string;
  };
}

interface WorkerStatus {
  id: string;
  full_name: string;
  employee_id: string;
  department: string;
  checklist_completions?: {
    is_complete: boolean;
  }[];
}

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hazardReports, setHazardReports] = useState<HazardReport[]>([]);
  const [workers, setWorkers] = useState<WorkerStatus[]>([]);
  const [stats, setStats] = useState({
    totalWorkers: 0,
    checklistComplete: 0,
    pendingReports: 0,
    activeSOSAlerts: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Load manager profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, employee_id, role")
      .eq("id", session.user.id)
      .single();

    if (profileData?.role !== "manager") {
      navigate("/worker/dashboard");
      return;
    }

    setProfile(profileData);

    // Load hazard reports
    const { data: reports } = await supabase
      .from("hazard_reports")
      .select(`
        *,
        profiles:user_id (full_name, employee_id)
      `)
      .order("created_at", { ascending: false })
      .limit(10);

    if (reports) setHazardReports(reports as any);

    // Load worker statuses
    const today = new Date().toISOString().split("T")[0];
    const { data: workersData } = await supabase
      .from("profiles")
      .select("id, full_name, employee_id, department")
      .eq("role", "worker");

    if (workersData) {
      const workersWithStatus = await Promise.all(
        workersData.map(async (worker) => {
          const { data: completion } = await supabase
            .from("checklist_completions")
            .select("is_complete")
            .eq("user_id", worker.id)
            .eq("checklist_date", today)
            .maybeSingle();

          return {
            ...worker,
            checklist_completions: completion ? [completion] : [],
          };
        })
      );
      setWorkers(workersWithStatus);
    }

    // Calculate stats
    const { count: totalWorkers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "worker");

    const { count: pendingReports } = await supabase
      .from("hazard_reports")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const { count: activeSOSAlerts } = await supabase
      .from("emergency_sos")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    const checklistComplete = workers.filter((w) =>
      w.checklist_completions?.some((c: any) => c.is_complete)
    ).length || 0;

    setStats({
      totalWorkers: totalWorkers || 0,
      checklistComplete,
      pendingReports: pendingReports || 0,
      activeSOSAlerts: activeSOSAlerts || 0,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "success";
      case "in_progress":
        return "warning";
      case "pending":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">Safety Manager Dashboard</h1>
            <p className="text-muted-foreground">
              {profile?.full_name} • {profile?.employee_id}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Workers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-2xl font-bold">{stats.totalWorkers}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Checklists Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-2xl font-bold">
                  {stats.checklistComplete}/{stats.totalWorkers}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-2xl font-bold">{stats.pendingReports}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active SOS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-2xl font-bold">{stats.activeSOSAlerts}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Recent Hazard Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Hazard Reports</CardTitle>
            <CardDescription>Latest safety reports from workers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {hazardReports.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No hazard reports yet
                </p>
              ) : (
                hazardReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/manager/reports/${report.id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{report.title}</h3>
                      <Badge variant={getSeverityColor(report.severity) as any}>
                        {report.severity}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>{report.profiles?.full_name || "Unknown"}</span>
                      <Badge variant={getStatusColor(report.status) as any}>
                        {report.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate("/manager/reports")}
            >
              View All Reports
            </Button>
          </CardContent>
        </Card>

        {/* Worker Status */}
        <Card>
          <CardHeader>
            <CardTitle>Worker Checklist Status</CardTitle>
            <CardDescription>Today's safety checklist completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {workers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No worker data available
                </p>
              ) : (
                workers.map((worker) => (
                  <div key={worker.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{worker.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {worker.employee_id} • {worker.department}
                      </p>
                    </div>
                    {worker.checklist_completions?.some((c: any) => c.is_complete) ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-warning" />
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
