import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConsentToggleRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  locked?: boolean;
}

export function ConsentToggleRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  locked = false,
}: ConsentToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-6 p-6 border rounded-md bg-card">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Label htmlFor={id} className="text-base font-medium cursor-pointer">
            {label}
          </Label>
          {locked && (
            <Tooltip>
              <TooltipTrigger>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>This setting is required and cannot be disabled</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={locked}
        data-testid={`toggle-${id}`}
        className="flex-shrink-0"
      />
    </div>
  );
}
