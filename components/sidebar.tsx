"use client";

import { FileType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";

interface SidebarProps {
  selectedFile: FileType;
  onFileSelect: (file: FileType) => void;
}

export function Sidebar({ selectedFile, onFileSelect }: SidebarProps) {
  const files: { type: FileType; label: string; disabled?: boolean }[] = [
    { type: "umbrel-app", label: "umbrel-app.yml" },
    { type: "docker-compose", label: "docker-compose.yml" },
  ];

  return (
    <div className="w-64 border-r bg-muted/30 p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Umbrel</h1>
        <p className="text-sm text-muted-foreground">Config Generator</p>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
          Files
        </p>
        {files.map((file) => (
          <button
            key={file.type}
            onClick={() => !file.disabled && onFileSelect(file.type)}
            disabled={file.disabled}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              selectedFile === file.type && "bg-accent text-accent-foreground",
              file.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <FileText className="h-4 w-4" />
            {file.label}
            {file.disabled && (
              <span className="ml-auto text-xs text-muted-foreground">Soon</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

