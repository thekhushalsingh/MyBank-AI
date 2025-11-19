import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, CreditCard } from "lucide-react";
import { format } from "date-fns";
import type { AiDecision } from "@shared/schema";

interface DecisionCardProps {
  decision: AiDecision;
}

const decisionTypeConfig = {
  loan_denied: {
    label: "Loan Denied",
    variant: "destructive" as const,
    icon: AlertTriangle,
  },
  fraud_alert: {
    label: "Fraud Alert",
    variant: "default" as const,
    icon: AlertTriangle,
  },
  card_pre_approval: {
    label: "Card Pre-Approval",
    variant: "default" as const,
    icon: CheckCircle,
  },
};

export function DecisionCard({ decision }: DecisionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = decisionTypeConfig[decision.decisionType as keyof typeof decisionTypeConfig] || {
    label: decision.decisionType,
    variant: "secondary" as const,
    icon: CreditCard,
  };
  const Icon = config.icon;

  return (
    <Card className="border-l-4 border-l-primary hover-elevate" data-testid={`card-decision-${decision.id}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 p-6">
        <div className="flex items-start gap-4 flex-1">
          <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-semibold" data-testid={`text-decision-type-${decision.id}`}>
                {config.label}
              </h3>
              <Badge variant={config.variant} className="text-xs">
                {decision.modelVersion}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground" data-testid={`text-decision-text-${decision.id}`}>
              {decision.decisionText}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(decision.timestamp), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          data-testid={`button-toggle-explanation-${decision.id}`}
          className="flex-shrink-0"
        >
          {expanded ? (
            <>
              Hide <ChevronUp className="ml-1 h-4 w-4" />
            </>
          ) : (
            <>
              Why? <ChevronDown className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </CardHeader>
      {expanded && (
        <CardContent className="px-6 pb-6 pt-0 border-t bg-muted/30">
          <div className="space-y-4 pt-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Explanation</h4>
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-explanation-${decision.id}`}>
                {decision.explanation}
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
