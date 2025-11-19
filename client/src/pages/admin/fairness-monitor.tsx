import { FairnessChart } from "@/components/admin/fairness-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function FairnessMonitorPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="text-4xl font-semibold tracking-tight">
            Fairness Monitor
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            Monitor AI decision fairness across demographic groups to ensure regulatory
            compliance and prevent discriminatory outcomes. Static placeholder data for MVP.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12,847</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">59.6%</div>
            <p className="text-xs text-muted-foreground mt-1">Across all groups</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">26pp</div>
            <p className="text-xs text-muted-foreground mt-1">Exceeds 20pp threshold</p>
          </CardContent>
        </Card>
      </div>

      {/* Check if FairnessChart component exists, otherwise show placeholder */}
      {FairnessChart ? (
        <FairnessChart />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Fairness Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Fairness chart component not available
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}