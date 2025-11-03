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
      {/* Umbrel Header */}
      <header className="border-b bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-2.5">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                <svg className="h-6 w-6 sm:h-7 sm:w-7" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M52 32c0-2.5-1-4.8-2.6-6.5C49.8 23.3 48 21 45.5 19.5c-2-1.2-4.3-1.9-6.8-1.9-3.5 0-6.7 1.4-9 3.7C27.3 19.5 24.5 18 21.3 18c-6.1 0-11 5-11 11.1 0 1.5.3 2.9.8 4.2C8.3 34.5 7 37 7 39.8 7 44.8 11.1 49 16 49h34c4.4 0 8-3.6 8-8 0-3.9-2.8-7.2-6.5-7.9-.3-.4-.5-.7-.5-1.1z" fill="white"/>
                  <path d="M32 42v8c0 2.2-1.8 4-4 4h0c-2.2 0-4-1.8-4-4v-2" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">umbrelly</h1>
            </div>
            
            {/* Self-hosted badge */}
            <a
              href="https://umbrel.com/umbrelos"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-white/90 hover:text-white transition-all duration-200 group text-sm bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full"
            >
              <span className="font-medium">
                Proudly Self-hosted on <span className="font-semibold">umbrelOS</span> 💪
              </span>
              <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
            
            {/* Mobile badge - icon only */}
            <a
              href="https://umbrel.com/umbrelos"
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full p-2 hover:bg-white/20 transition-colors"
              title="Proudly Self-hosted on umbrelOS 💪"
            >
              <ExternalLink className="h-4 w-4 text-white" />
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

