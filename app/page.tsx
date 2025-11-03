"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { UmbrelAppForm } from "@/components/umbrel-app-form";
import { DockerComposeForm } from "@/components/docker-compose-form";
import { YamlPreview } from "@/components/yaml-preview";
import { FileType, UmbrelAppConfig, defaultUmbrelAppConfig } from "@/lib/types";
import { DockerComposeConfig, defaultDockerComposeConfig } from "@/lib/docker-compose-types";
import { generateUmbrelAppYaml } from "@/lib/yaml-generator";
import { generateDockerComposeYaml } from "@/lib/docker-compose-generator";
import { ExternalLink } from "lucide-react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<FileType>("umbrel-app");
  const [umbrelConfig, setUmbrelConfig] = useState<UmbrelAppConfig>(defaultUmbrelAppConfig);
  const [dockerConfig, setDockerConfig] = useState<DockerComposeConfig>(defaultDockerComposeConfig);
  const [yaml, setYaml] = useState<string>("");

  useEffect(() => {
    if (selectedFile === "umbrel-app") {
      const generatedYaml = generateUmbrelAppYaml(umbrelConfig);
      setYaml(generatedYaml);
    } else if (selectedFile === "docker-compose") {
      const generatedYaml = generateDockerComposeYaml(dockerConfig);
      setYaml(generatedYaml);
    }
  }, [umbrelConfig, dockerConfig, selectedFile]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Premium Dark Header */}
      <header className="glass-strong border-b border-white/10 ambient-shadow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="glass rounded-2xl p-2.5 glow-violet">
                <svg className="h-7 w-7 sm:h-8 sm:w-8" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7752FE" />
                      <stop offset="100%" stopColor="#D2A85E" />
                    </linearGradient>
                  </defs>
                  <path d="M52 32c0-2.5-1-4.8-2.6-6.5C49.8 23.3 48 21 45.5 19.5c-2-1.2-4.3-1.9-6.8-1.9-3.5 0-6.7 1.4-9 3.7C27.3 19.5 24.5 18 21.3 18c-6.1 0-11 5-11 11.1 0 1.5.3 2.9.8 4.2C8.3 34.5 7 37 7 39.8 7 44.8 11.1 49 16 49h34c4.4 0 8-3.6 8-8 0-3.9-2.8-7.2-6.5-7.9-.3-.4-.5-.7-.5-1.1z" fill="url(#cloudGradient)"/>
                  <path d="M32 42v8c0 2.2-1.8 4-4 4h0c-2.2 0-4-1.8-4-4v-2" stroke="#D2A85E" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-400 to-gold-400 bg-clip-text text-transparent tracking-tight">
                  umbrelly
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Configuration Generator</p>
              </div>
            </div>
            
            {/* Self-hosted badge */}
            <a
              href="https://umbrel.com/umbrelos"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-foreground/80 hover:text-foreground transition-all duration-300 group text-sm glass px-4 py-2 rounded-full glow-gold hover:glow-violet"
            >
              <span className="font-medium">
                Proudly Self-hosted on <span className="font-semibold bg-gradient-to-r from-violet-400 to-gold-400 bg-clip-text text-transparent">umbrelOS</span> 💪
              </span>
              <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
            </a>
            
            {/* Mobile badge - icon only */}
            <a
              href="https://umbrel.com/umbrelos"
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden flex items-center justify-center glass rounded-2xl p-2.5 hover:glow-violet transition-all duration-300"
              title="Proudly Self-hosted on umbrelOS 💪"
            >
              <ExternalLink className="h-4 w-4 text-violet-400" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 h-screen overflow-hidden">
        <Sidebar selectedFile={selectedFile} onFileSelect={setSelectedFile} />
        
        <div className="flex-1 flex min-w-0">
          {/* Form Section */}
          <div className="w-1/2 border-r overflow-hidden flex-shrink-0">
            {selectedFile === "umbrel-app" && (
              <UmbrelAppForm config={umbrelConfig} onChange={setUmbrelConfig} />
            )}
            {selectedFile === "docker-compose" && (
              <DockerComposeForm config={dockerConfig} onChange={setDockerConfig} />
            )}
          </div>

          {/* Preview Section */}
          <div className="w-1/2 bg-muted/10 overflow-hidden flex-shrink-0">
            <YamlPreview
              yaml={yaml}
              filename={selectedFile === "umbrel-app" ? "umbrel-app.yml" : "docker-compose.yml"}
              config={selectedFile === "umbrel-app" ? umbrelConfig : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

