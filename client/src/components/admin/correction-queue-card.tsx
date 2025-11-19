import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import type { CorrectionRequest } from "@shared/schema";

interface CorrectionQueueCardProps {
  request: CorrectionRequest & { userName?: string; profileLabel?: string };
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isPending: boolean;
}

const statusConfig = {
  pending: {
    label: "Pending",
    variant: "default" as const,
    icon: Clock,
    color: "text-status-away",
  },
  approved: {
    label: "Approved",
    variant: "default" as const,
    icon: CheckCircle,
    color: "text-status-online",
  },
  rejected: {
    label: "Rejected",
    variant: "destructive" as const,
    icon: XCircle,
    color: "text-status-busy",
  },
};

export function CorrectionQueueCard({
  request,
  onApprove,
  onReject,
  isPending,
}: CorrectionQueueCardProps) {
  const config = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Card className="hover-elevate" data-testid={`card-correction-${request.id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${config.color}`} />
            <Badge variant={config.variant} className="text-xs">
              {config.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Submitted {format(new Date(request.createdAt), "MMM d, yyyy")}
          </p>
        </div>
        <p className="text-xs font-mono text-muted-foreground" data-testid={`text-user-id-${request.id}`}>
          User: {request.userId.substring(0, 8)}...
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Incorrect Label:
            </span>
            <span className="text-sm font-medium" data-testid={`text-incorrect-label-${request.id}`}>
              {request.incorrectLabel}
            </span>
          </div>
          {request.requestedLabel && (
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Requested Label:
              </span>
              <span className="text-sm" data-testid={`text-requested-label-${request.id}`}>
                {request.requestedLabel}
              </span>
            </div>
          )}
        </div>
        {request.adminNotes && (
          <div className="p-3 bg-muted/50 rounded-md border">
            <p className="text-xs text-muted-foreground mb-1 font-medium">Admin Notes:</p>
            <p className="text-sm">{request.adminNotes}</p>
          </div>
        )}
      </CardContent>
      {request.status === "pending" && (
        <CardFooter className="flex justify-end gap-2 border-t p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReject(request.id)}
            disabled={isPending}
            data-testid={`button-reject-${request.id}`}
          >
            Reject
          </Button>
          <Button
            size="sm"
            onClick={() => onApprove(request.id)}
            disabled={isPending}
            data-testid={`button-approve-${request.id}`}
          >
            Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
