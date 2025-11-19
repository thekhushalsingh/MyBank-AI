import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AiProfile } from "@shared/schema";

interface AiProfileCardProps {
  profile: AiProfile;
  onRequestCorrection: (profile: AiProfile) => void;
}

export function AiProfileCard({ profile, onRequestCorrection }: AiProfileCardProps) {
  return (
    <Card className="hover-elevate">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-medium" data-testid={`text-profile-label-${profile.id}`}>
                {profile.label}
              </h3>
              <Badge variant="secondary" className="text-xs" data-testid={`badge-confidence-${profile.id}`}>
                {profile.confidence}% confidence
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-generated inference based on your activity patterns
            </p>
          </div>
          <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t p-4 bg-muted/30">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRequestCorrection(profile)}
          data-testid={`button-request-correction-${profile.id}`}
        >
          Request Correction
        </Button>
      </CardFooter>
    </Card>
  );
}
