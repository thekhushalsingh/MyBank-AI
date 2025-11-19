import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, FileCheck, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">MyBankAI</h1>
          </div>
          <Button
            onClick={() => (window.location.href = "/login")}
            data-testid="button-login"
          >
            Log In
          </Button>
        </div>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-6 py-24 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-semibold tracking-tight">
              The Transparent Financial Assistant
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience AI-powered banking with complete transparency. Understand every
              decision, control your data, and trust the technology serving you.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => (window.location.href = "/login")}
            data-testid="button-get-started"
            className="text-lg px-8"
          >
            Get Started
          </Button>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Eye className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Complete Transparency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  See exactly how AI makes decisions about your financial profile
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Data Control</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage your consent preferences and control how your data is used
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <FileCheck className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Correction Rights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Request corrections to AI inferences and track their status
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Governance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Built on immutable audit logs and fairness monitoring for trust
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        
      </main>

      <footer className="border-t mt-24">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 MyBankAI.</p>
        </div>
      </footer>
    </div>
  );
}
