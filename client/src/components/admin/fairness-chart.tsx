import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// Static MVP data - will be replaced with real metrics later
const fairnessData = {
  approvalRatesByAge: [
    { ageGroup: "18-25", rate: 45 },
    { ageGroup: "26-35", rate: 62 },
    { ageGroup: "36-45", rate: 71 },
    { ageGroup: "46-55", rate: 68 },
    { ageGroup: "56+", rate: 52 },
  ],
  thresholdCrossed: true,
};

export function FairnessChart() {
  const maxRate = Math.max(...fairnessData.approvalRatesByAge.map((d) => d.rate));

  return (
    <div className="space-y-6">
      {fairnessData.thresholdCrossed && (
        <Alert variant="destructive" className="border-status-busy/30 bg-status-busy/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Fairness Alert:</strong> Approval rate variance exceeds acceptable threshold across demographic groups.
            Review required for compliance.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Approval Rates by Age Group</CardTitle>
          <p className="text-sm text-muted-foreground">
            Static placeholder chart - MVP demonstration
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fairnessData.approvalRatesByAge.map((item) => (
              <div key={item.ageGroup} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.ageGroup}</span>
                  <span className="text-muted-foreground">{item.rate}%</span>
                </div>
                <div className="h-8 w-full bg-muted rounded-md overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(item.rate / maxRate) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Variance: 26 percentage points</span>
              <span>Threshold: 20 percentage points</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
