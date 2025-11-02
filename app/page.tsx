"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { UmbrelAppForm } from "@/components/umbrel-app-form";
import { YamlPreview } from "@/components/yaml-preview";
import { FileType, UmbrelAppConfig, defaultUmbrelAppConfig } from "@/lib/types";
import { generateUmbrelAppYaml } from "@/lib/yaml-generator";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<FileType>("umbrel-app");
  const [config, setConfig] = useState<UmbrelAppConfig>(defaultUmbrelAppConfig);
  const [yaml, setYaml] = useState<string>("");

  useEffect(() => {
    if (selectedFile === "umbrel-app") {
      const generatedYaml = generateUmbrelAppYaml(config);
      setYaml(generatedYaml);
    }
  }, [config, selectedFile]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar selectedFile={selectedFile} onFileSelect={setSelectedFile} />
      
      <div className="flex-1 flex">
        {/* Form Section */}
        <div className="flex-1 border-r">
          {selectedFile === "umbrel-app" && (
            <UmbrelAppForm config={config} onChange={setConfig} />
          )}
        </div>

        {/* Preview Section */}
        <div className="flex-1 bg-muted/10">
          <YamlPreview
            yaml={yaml}
            filename={selectedFile === "umbrel-app" ? "umbrel-app.yml" : "docker-compose.yml"}
            config={selectedFile === "umbrel-app" ? config : undefined}
          />
        </div>
      </div>
    </div>
  );
}

