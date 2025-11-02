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
    <div className="flex h-screen bg-background">
      <Sidebar selectedFile={selectedFile} onFileSelect={setSelectedFile} />
      
      <div className="flex-1 flex">
        {/* Form Section */}
        <div className="flex-1 border-r">
          {selectedFile === "umbrel-app" && (
            <UmbrelAppForm config={umbrelConfig} onChange={setUmbrelConfig} />
          )}
          {selectedFile === "docker-compose" && (
            <DockerComposeForm config={dockerConfig} onChange={setDockerConfig} />
          )}
        </div>

        {/* Preview Section */}
        <div className="flex-1 bg-muted/10">
          <YamlPreview
            yaml={yaml}
            filename={selectedFile === "umbrel-app" ? "umbrel-app.yml" : "docker-compose.yml"}
            config={selectedFile === "umbrel-app" ? umbrelConfig : undefined}
          />
        </div>
      </div>
    </div>
  );
}

