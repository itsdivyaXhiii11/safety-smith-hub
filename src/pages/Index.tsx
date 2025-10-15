import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, HardHat, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import mineHero from "@/assets/mine-hero.jpg";
import safetyIcon from "@/assets/safety-icon.png";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Check user role and redirect
        supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            if (profile?.role === "manager") {
              navigate("/manager/dashboard");
            } else if (profile?.role === "worker") {
              navigate("/worker/dashboard");
            }
          });
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${mineHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/70 to-background" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
          <img src={safetyIcon} alt="Mine Mithra" className="w-24 h-24 mb-6" />
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-4">
            Mine Mithra
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-12 max-w-2xl">
            Your Intelligent Safety Companion for Coal Mine Operations
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8"
              onClick={() => navigate("/auth")}
            >
              <HardHat className="mr-2 h-5 w-5" />
              Worker Login
            </Button>
            <Button
              size="lg"
              className="text-lg px-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              onClick={() => navigate("/auth?role=manager")}
            >
              <Users className="mr-2 h-5 w-5" />
              Manager Login
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Comprehensive Safety Management
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Daily Safety Checklists</h3>
              <p className="text-muted-foreground">
                Personalized safety protocols based on your role and assigned tasks
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Hazard Reporting</h3>
              <p className="text-muted-foreground">
                Quick and easy reporting with photos and voice notes in your language
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Emergency SOS</h3>
              <p className="text-muted-foreground">
                One-tap emergency alerts with real-time location tracking
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
