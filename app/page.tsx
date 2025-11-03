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
      <header className="border-b bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-2.5">
        <div className="container mx-auto px-4">
          <a
            href="https://umbrel.com/umbrelos"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-white hover:text-white/90 transition-colors group"
          >
            <span className="text-sm font-medium">
              Proudly self-hosted on <span className="font-bold">umbrelOS</span>
            </span>
            <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
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

