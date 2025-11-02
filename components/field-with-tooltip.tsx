"use client";

import { HelpCircle } from "lucide-react";
import { Label } from "./ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface FieldWithTooltipProps {
  label: string;
  tooltip?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FieldWithTooltip({
  label,
  tooltip,
  required,
  children,
}: FieldWithTooltipProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="inline-flex">
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="text-sm">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {children}
    </div>
  );
}

