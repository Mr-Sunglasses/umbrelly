"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
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
import { Button } from "./ui/button";

interface ProtectedFieldProps {
  isEnabled: boolean;
  onEnable: () => void;
  warningTitle: string;
  warningMessage: string;
  children: (props: { disabled: boolean }) => React.ReactNode;
}

export function ProtectedField({
  isEnabled,
  onEnable,
  warningTitle,
  warningMessage,
  children,
}: ProtectedFieldProps) {
  const [showWarning, setShowWarning] = useState(false);

  const handleEnable = () => {
    onEnable();
    setShowWarning(false);
  };

  if (isEnabled) {
    return <>{children({ disabled: false })}</>;
  }

  return (
    <>
      <div className="relative">
        {children({ disabled: true })}
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] rounded-md flex items-center justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowWarning(true)}
            className="gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Edit Anyway
          </Button>
        </div>
      </div>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              {warningTitle}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              {warningMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEnable}>
              Edit Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

