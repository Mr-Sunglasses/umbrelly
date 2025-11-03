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
    <div className="w-72 border-r border-white/10 glass p-6">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-muted-foreground uppercase tracking-wider mb-1">
          Configuration
        </h2>
        <p className="text-sm text-muted-foreground">Choose a file to edit</p>
      </div>
      
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3 px-3">
          Files
        </p>
        {files.map((file) => (
          <button
            key={file.type}
            onClick={() => !file.disabled && onFileSelect(file.type)}
            disabled={file.disabled}
            className={cn(
              "group w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300",
              "hover:glass-strong",
              selectedFile === file.type 
                ? "glass-strong glow-violet text-foreground" 
                : "text-muted-foreground hover:text-foreground",
              file.disabled && "opacity-40 cursor-not-allowed hover:glass-strong"
            )}
          >
            <FileText className={cn(
              "h-5 w-5 transition-colors",
              selectedFile === file.type && "text-violet-400"
            )} />
            <span className="flex-1 text-left">{file.label}</span>
            {file.disabled && (
              <span className="text-xs px-2 py-1 rounded-full glass text-muted-foreground">
                Soon
              </span>
            )}
            {selectedFile === file.type && (
              <div className="h-2 w-2 rounded-full bg-violet-400 glow-violet" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

