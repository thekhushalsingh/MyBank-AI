import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AiProfile } from "@shared/schema";

interface CorrectionRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: AiProfile | null;
  onSubmit: (requestedLabel: string) => void;
  isPending: boolean;
}

export function CorrectionRequestModal({
  open,
  onOpenChange,
  profile,
  onSubmit,
  isPending,
}: CorrectionRequestModalProps) {
  const [requestedLabel, setRequestedLabel] = useState("");

  const handleSubmit = () => {
    onSubmit(requestedLabel);
    setRequestedLabel("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-correction-request">
        <DialogHeader>
          <DialogTitle>Request Profile Correction</DialogTitle>
          <DialogDescription>
            You're requesting a correction for the inference: <strong>{profile?.label}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="requested-label">
              What should this be? (Optional)
            </Label>
            <Textarea
              id="requested-label"
              placeholder="Describe what you believe is the correct inference..."
              value={requestedLabel}
              onChange={(e) => setRequestedLabel(e.target.value)}
              className="resize-none min-h-[100px]"
              data-testid="textarea-requested-label"
            />
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-correction"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            data-testid="button-submit-correction"
          >
            {isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
