"use client";

import { ReactNode, useState } from "react";
import { Label } from "./ui/label";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

interface ExpandableFieldProps {
  label: string;
  description: string;
  required?: boolean;
  children: ReactNode;
}

export function ExpandableField({
  label,
  description,
  required = false,
  children,
}: ExpandableFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <span className="font-medium">
                {isOpen ? "Hide" : "Show"} info
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="mt-2 mb-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {children}
    </div>
  );
}

