"use client";

import { Copy, Download, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { UmbrelAppConfig } from "@/lib/types";
import { validateUmbrelAppConfig } from "@/lib/validation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface YamlPreviewProps {
  yaml: string;
  filename: string;
  config?: UmbrelAppConfig;
}

export function YamlPreview({ yaml, filename, config }: YamlPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState<"copy" | "download" | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const checkValidation = (action: "copy" | "download") => {
    if (!config) {
      // If no config provided, proceed without validation
      executeAction(action);
      return;
    }

    const validation = validateUmbrelAppConfig(config);
    if (!validation.isValid) {
      setValidationErrors(validation.missingFields);
      setPendingAction(action);
      setShowWarning(true);
    } else {
      executeAction(action);
    }
  };

  const executeAction = (action: "copy" | "download") => {
    if (action === "copy") {
      navigator.clipboard.writeText(yaml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (action === "download") {
      const blob = new Blob([yaml], { type: "text/yaml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleCopy = () => {
    checkValidation("copy");
  };

  const handleDownload = () => {
    checkValidation("download");
  };

  const handleProceedAnyway = () => {
    if (pendingAction) {
      executeAction(pendingAction);
    }
    setShowWarning(false);
    setPendingAction(null);
  };

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-sm font-medium">{filename}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <pre className="p-4 text-sm font-mono">
            <code>{yaml || "# Fill in the form to generate YAML configuration"}</code>
          </pre>
        </div>
      </div>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Required Fields Missing
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              <p className="mb-3">
                The following required fields are not filled:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-3">
                {validationErrors.map((field) => (
                  <li key={field} className="text-destructive font-medium">
                    {field}
                  </li>
                ))}
              </ul>
              <p>
                Please fill in all required fields before {pendingAction === "copy" ? "copying" : "downloading"} the configuration.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowWarning(false)}>
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleProceedAnyway}>
              Proceed Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

