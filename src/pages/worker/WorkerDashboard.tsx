import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Video, FileWarning, LogOut, Phone } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

interface Profile {
  full_name: string;
  employee_id: string;
  department: string;
}

interface ChecklistItem {
  id: string;
  item_text: string;
  task_category: string;
}

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [todayCompletion, setTodayCompletion] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Load profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, employee_id, department, role")
      .eq("id", session.user.id)
      .single();

    if (profileData?.role !== "worker") {
      navigate("/manager/dashboard");
      return;
    }

    setProfile(profileData);

    // Load checklist items
    const { data: items } = await supabase
      .from("checklist_items")
      .select("*")
      .eq("role", "worker")
      .order("display_order");

    if (items) setChecklistItems(items);

    // Load today's completion
    const today = new Date().toISOString().split("T")[0];
    const { data: completion } = await supabase
      .from("checklist_completions")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("checklist_date", today)
      .maybeSingle();

    if (completion) {
      setTodayCompletion(completion);
      const items = Array.isArray(completion.completed_items) 
        ? completion.completed_items as string[]
        : [];
      setCompletedItems(items);
    }
  };

  const handleChecklistToggle = async (itemId: string) => {
    const newCompleted = completedItems.includes(itemId)
      ? completedItems.filter((id) => id !== itemId)
      : [...completedItems, itemId];

    setCompletedItems(newCompleted);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const today = new Date().toISOString().split("T")[0];
    const isComplete = newCompleted.length === checklistItems.length;

    const { error } = await supabase
      .from("checklist_completions")
      .upsert({
        user_id: session.user.id,
        checklist_date: today,
        completed_items: newCompleted,
        is_complete: isComplete,
        completed_at: isComplete ? new Date().toISOString() : null,
      });

    if (error) {
      toast.error("Failed to update checklist");
    } else if (isComplete) {
      toast.success("Safety checklist completed! ✅ Safe shift cleared.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleEmergencySOS = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("emergency_sos").insert({
      user_id: session.user.id,
      location_description: "Emergency from worker dashboard",
    });

    if (error) {
      toast.error("Failed to send SOS");
    } else {
      toast.error("🚨 EMERGENCY SOS SENT! Help is on the way.", {
        duration: 10000,
      });
    }
  };

  const progress = checklistItems.length > 0
    ? (completedItems.length / checklistItems.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {profile?.full_name}</h1>
            <p className="text-muted-foreground">
              {profile?.employee_id} • {profile?.department}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Emergency SOS Button */}
        <Button
          variant="destructive"
          size="lg"
          className="w-full md:w-auto"
          onClick={handleEmergencySOS}
        >
          <Phone className="mr-2 h-5 w-5" />
          EMERGENCY SOS
        </Button>
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Daily Safety Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {todayCompletion?.is_complete ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <AlertCircle className="h-5 w-5 text-warning" />
              )}
              Daily Safety Checklist
            </CardTitle>
            <CardDescription>
              Complete all items before starting your shift
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">
                  {completedItems.length}/{checklistItems.length} completed
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50">
                  <Checkbox
                    checked={completedItems.includes(item.id)}
                    onCheckedChange={() => handleChecklistToggle(item.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.item_text}</p>
                    <p className="text-xs text-muted-foreground">{item.task_category}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Safety Video */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Safety Video of the Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/worker/videos")}
              >
                Watch Safety Videos
              </Button>
            </CardContent>
          </Card>

          {/* Report Hazard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileWarning className="h-5 w-5 text-warning" />
                Report a Hazard
              </CardTitle>
              <CardDescription>
                See something unsafe? Report it immediately
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => navigate("/worker/report-hazard")}
              >
                Report Hazard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
