"use client";

import { useState } from "react";
import { DockerComposeConfig, ServiceConfig, defaultServiceConfig } from "@/lib/docker-compose-types";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { FieldWithTooltip } from "./field-with-tooltip";
import { TooltipProvider } from "./ui/tooltip";
import { Plus, Trash2, AlertTriangle, ChevronDown, Info } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Separator } from "./ui/separator";
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

interface DockerComposeFormProps {
  config: DockerComposeConfig;
  onChange: (config: DockerComposeConfig) => void;
  umbrelAppId?: string;
}

export function DockerComposeForm({ config, onChange, umbrelAppId }: DockerComposeFormProps) {
  const [showAppProxyWarning, setShowAppProxyWarning] = useState(false);
  const [pendingAppProxyState, setPendingAppProxyState] = useState(false);

  const updateConfig = (updates: Partial<DockerComposeConfig>) => {
    onChange({ ...config, ...updates });
  };

  const updateAppProxy = (updates: Partial<typeof config.appProxy>) => {
    updateConfig({
      appProxy: { ...config.appProxy, ...updates },
    });
  };

  const handleAppProxyToggle = (enabled: boolean) => {
    if (!enabled) {
      setPendingAppProxyState(false);
      setShowAppProxyWarning(true);
    } else {
      updateAppProxy({ enabled: true });
    }
  };

  const confirmDisableAppProxy = () => {
    updateAppProxy({ enabled: false });
    setShowAppProxyWarning(false);
  };

  const addService = () => {
    const newService: ServiceConfig = {
      ...defaultServiceConfig,
      id: `service-${Date.now()}`,
    };
    updateConfig({
      services: [...config.services, newService],
    });
  };

  const removeService = (id: string) => {
    updateConfig({
      services: config.services.filter(s => s.id !== id),
    });
  };

  const updateService = (id: string, updates: Partial<ServiceConfig>) => {
    updateConfig({
      services: config.services.map(s =>
        s.id === id ? { ...s, ...updates } : s
      ),
    });
  };

  const addPort = (serviceId: string) => {
    const service = config.services.find(s => s.id === serviceId);
    if (service) {
      updateService(serviceId, {
        ports: [...service.ports, ""],
      });
    }
  };

  const updatePort = (serviceId: string, index: number, value: string) => {
    const service = config.services.find(s => s.id === serviceId);
    if (service) {
      const newPorts = [...service.ports];
      newPorts[index] = value;
      updateService(serviceId, { ports: newPorts });
    }
  };

  const removePort = (serviceId: string, index: number) => {
    const service = config.services.find(s => s.id === serviceId);
    if (service) {
      updateService(serviceId, {
        ports: service.ports.filter((_, i) => i !== index),
      });
    }
  };

  const addVolume = (serviceId: string) => {
    const service = config.services.find(s => s.id === serviceId);
    if (service) {
      updateService(serviceId, {
        volumes: [...service.volumes, "${APP_DATA_DIR}/"],
      });
    }
  };

  const updateVolume = (serviceId: string, index: number, value: string) => {
    const service = config.services.find(s => s.id === serviceId);
    if (service) {
      const newVolumes = [...service.volumes];
      newVolumes[index] = value;
      updateService(serviceId, { volumes: newVolumes });
    }
  };

  const removeVolume = (serviceId: string, index: number) => {
    const service = config.services.find(s => s.id === serviceId);
    if (service) {
      updateService(serviceId, {
        volumes: service.volumes.filter((_, i) => i !== index),
      });
    }
  };

  const updateEnvironment = (serviceId: string, key: string, value: string) => {
    const service = config.services.find(s => s.id === serviceId);
    if (service) {
      const newEnv = { ...service.environment };
      
      if (value === "") {
        delete newEnv[key];
      } else {
        newEnv[key] = value;
      }
      updateService(serviceId, { environment: newEnv });
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-full overflow-auto">
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">docker-compose.yml Configuration</h2>
            <p className="text-sm text-muted-foreground">
              Configure your Docker Compose services for Umbrel
            </p>
          </div>

          {/* Version */}
          <FieldWithTooltip
            label="Version"
            required
            tooltip="The Docker Compose file format version. Umbrel requires version 3.7. This field is locked to ensure compatibility with all Docker Compose features needed for Umbrel apps."
          >
            <Input
              placeholder="3.7"
              value="3.7"
              disabled
              className="bg-muted cursor-not-allowed"
            />
          </FieldWithTooltip>

          <Separator className="my-6" />

          {/* App Proxy Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">App Proxy Service</h3>
              <Select
                value={config.appProxy.enabled ? "true" : "false"}
                onValueChange={(value) => handleAppProxyToggle(value === "true")}
              >
                <SelectTrigger className="w-32">
                  <SelectValue>
                    {config.appProxy.enabled ? "Enabled" : "Disabled"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={5}>
                  <SelectItem value="true">Enabled</SelectItem>
                  <SelectItem value="false">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>What is App Proxy?</strong> The Umbrel App Proxy handles routing traffic to your app and provides authentication protection.
              </p>
              <p>
                <strong>Important distinction:</strong> This toggle completely removes the app_proxy service from docker-compose.yml. The proxy does more than just authentication - it handles traffic routing and network configuration. The <code className="text-xs bg-muted px-1 py-0.5 rounded">PROXY_AUTH_ADD</code> environment variable below controls authentication, not this toggle.
              </p>
              <p className="text-yellow-600 dark:text-yellow-500">
                <strong>⚠️ Note:</strong> Only disable the App Proxy Service if your app needs to run in host network mode or has specific network requirements that conflict with the proxy.
              </p>
            </div>

            {config.appProxy.enabled && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                {/* APP_HOST */}
                <FieldWithTooltip
                  label="APP_HOST"
                  required
                  tooltip="The DNS name of your web container. Format: <image-name>_<service-name>_1 (e.g., 'umbrelly_web_1'). Select a service below to auto-generate, or enter manually."
                >
                  <div className="space-y-2">
                    {config.services.length > 0 && (
                      <div className="flex gap-2 items-center">
                        <Select
                          value=""
                          onValueChange={(serviceId) => {
                            const service = config.services.find(s => s.id === serviceId);
                            if (service && service.image && service.name) {
                              // Extract image name from full image string
                              // e.g., "mrsunglasses/umbrelly:0.0.2" -> "umbrelly"
                              const imageParts = service.image.split(':')[0].split('/');
                              const imageName = imageParts[imageParts.length - 1];
                              
                              // Generate APP_HOST: <image-name>_<service-name>_1
                              const appHost = `${imageName}_${service.name}_1`;
                              updateAppProxy({ APP_HOST: appHost });
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="🚀 Auto-generate from service..." />
                          </SelectTrigger>
                          <SelectContent position="popper" sideOffset={5}>
                            {config.services.map((service) => {
                              if (!service.image || !service.name) return null;
                              const imageParts = service.image.split(':')[0].split('/');
                              const imageName = imageParts[imageParts.length - 1];
                              const generatedHost = `${imageName}_${service.name}_1`;
                              
                              return (
                                <SelectItem key={service.id} value={service.id}>
                                  {service.name} → {generatedHost}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <Input
                      placeholder="myapp_web_1"
                      value={config.appProxy.APP_HOST}
                      onChange={(e) => updateAppProxy({ APP_HOST: e.target.value })}
                    />
                  </div>
                </FieldWithTooltip>

                {/* APP_PORT */}
                <FieldWithTooltip
                  label="APP_PORT"
                  required
                  tooltip="The internal port number that your web application is listening on inside the container (e.g., 3000 for Node.js apps, 8080 for many Java apps, 80 for nginx). This is NOT the external port - the proxy will handle external routing."
                >
                  <Input
                    type="number"
                    placeholder="3000"
                    value={config.appProxy.APP_PORT}
                    onChange={(e) => updateAppProxy({ APP_PORT: e.target.value })}
                  />
                </FieldWithTooltip>

                {/* Optional: PROXY_AUTH_ADD */}
                <FieldWithTooltip
                  label="PROXY_AUTH_ADD (Optional)"
                  tooltip='Set to "false" to disable Umbrel authentication for this app while keeping the proxy service active for routing. The proxy will still handle traffic routing, but won&apos;t require authentication. Only use this if your app has its own built-in authentication system. When set to false, anyone who can access your Umbrel can access this app without entering the Umbrel password.'
                >
                  <Select
                    value={config.appProxy.PROXY_AUTH_ADD || "default"}
                    onValueChange={(value) => updateAppProxy({ PROXY_AUTH_ADD: value === "default" ? undefined : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Default (enabled)" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5}>
                      <SelectItem value="default">Default (enabled)</SelectItem>
                      <SelectItem value="false">false (disable auth)</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldWithTooltip>

                {/* Optional: PROXY_AUTH_WHITELIST */}
                <FieldWithTooltip
                  label="PROXY_AUTH_WHITELIST (Optional)"
                  tooltip="Whitelist specific URL paths to bypass Umbrel authentication. Useful when your app has a public API that should be accessible without Umbrel login, but the main UI should be protected. Example: '/api/*' allows all /api endpoints without auth. Use * as wildcard."
                >
                  <Input
                    placeholder="/api/*"
                    value={config.appProxy.PROXY_AUTH_WHITELIST || ""}
                    onChange={(e) => updateAppProxy({ PROXY_AUTH_WHITELIST: e.target.value || undefined })}
                  />
                </FieldWithTooltip>

                {/* Optional: PROXY_AUTH_BLACKLIST */}
                <FieldWithTooltip
                  label="PROXY_AUTH_BLACKLIST (Optional)"
                  tooltip="Blacklist specific URL paths to require authentication even when WHITELIST is set to '*'. Useful when you want most of the app public but certain sections protected. Example: Set WHITELIST to '*' and BLACKLIST to '/admin/*' to protect only the admin section with Umbrel password."
                >
                  <Input
                    placeholder="/admin/*"
                    value={config.appProxy.PROXY_AUTH_BLACKLIST || ""}
                    onChange={(e) => updateAppProxy({ PROXY_AUTH_BLACKLIST: e.target.value || undefined })}
                  />
                </FieldWithTooltip>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Services Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Custom Services</h3>
              <Button onClick={addService} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Service
              </Button>
            </div>

            {config.services.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg">
                No services added yet. Click &quot;Add Service&quot; to create one.
              </p>
            ) : (
              <div className="space-y-6">
                {config.services.map((service, index) => (
                  <ServiceEditor
                    key={service.id}
                    service={service}
                    index={index}
                    umbrelAppId={umbrelAppId}
                    onUpdate={(updates) => updateService(service.id, updates)}
                    onRemove={() => removeService(service.id)}
                    onAddPort={() => addPort(service.id)}
                    onUpdatePort={(portIndex, value) => updatePort(service.id, portIndex, value)}
                    onRemovePort={(portIndex) => removePort(service.id, portIndex)}
                    onAddVolume={() => addVolume(service.id)}
                    onUpdateVolume={(volumeIndex, value) => updateVolume(service.id, volumeIndex, value)}
                    onRemoveVolume={(volumeIndex) => removeVolume(service.id, volumeIndex)}
                    onUpdateEnvironment={(key, value) => updateEnvironment(service.id, key, value)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* App Proxy Warning Dialog */}
      <AlertDialog open={showAppProxyWarning} onOpenChange={setShowAppProxyWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Disable App Proxy Service?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left space-y-3">
              <p>
                <strong>Warning:</strong> This will completely remove the <code className="text-xs bg-muted px-1 py-0.5 rounded">app_proxy</code> service from your docker-compose.yml.
              </p>
              <p>
                <strong>Important:</strong> The App Proxy does more than just handle authentication. It provides:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Traffic routing to your app</li>
                <li>Network configuration and management</li>
                <li>Authentication (controlled by PROXY_AUTH_ADD)</li>
              </ul>
              <p className="text-yellow-600 dark:text-yellow-500">
                <strong>Note:</strong> If you only want to disable authentication while keeping the proxy active, keep this enabled and set <code className="text-xs bg-muted px-1 py-0.5 rounded">PROXY_AUTH_ADD</code> to &quot;false&quot; instead.
              </p>
              <p>
                <strong>Only disable this if:</strong> Your app needs to run in host network mode or has specific network requirements that conflict with the proxy service.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowAppProxyWarning(false)}>
              Keep Enabled
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDisableAppProxy}>
              Disable Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}

// Service Editor Component
interface ServiceEditorProps {
  service: ServiceConfig;
  index: number;
  umbrelAppId?: string;
  onUpdate: (updates: Partial<ServiceConfig>) => void;
  onRemove: () => void;
  onAddPort: () => void;
  onUpdatePort: (index: number, value: string) => void;
  onRemovePort: (index: number) => void;
  onAddVolume: () => void;
  onUpdateVolume: (index: number, value: string) => void;
  onRemoveVolume: (index: number) => void;
  onUpdateEnvironment: (key: string, value: string) => void;
}

// Helper function to build and render complete file tree
function buildCompleteFileTree(volumes: string[], appId: string): string {
  const tree: { [key: string]: any } = {};
  
  volumes.forEach(volume => {
    // Extract host path (before the colon)
    const hostPath = volume.split(':')[0];
    
    // Skip if it's communal storage
    if (hostPath.includes('${UMBREL_ROOT}/data/storage/')) {
      return;
    }
    
    // Remove the ${APP_DATA_DIR}/ prefix
    const relativePath = hostPath.replace(/^\$\{APP_DATA_DIR\}\//, '');
    
    if (!relativePath || relativePath === hostPath) {
      return; // Skip if no valid path
    }
    
    // Split path into parts
    const parts = relativePath.split('/').filter(Boolean);
    
    // Build nested structure
    let current = tree;
    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = index === parts.length - 1 ? null : {};
      }
      if (current[part] !== null) {
        current = current[part];
      }
    });
  });
  
  // Build the complete tree as a string
  const lines: string[] = [];
  lines.push(appId || 'your-app-id');
  
  // Add static files first
  const hasDataDirs = Object.keys(tree).length > 0;
  lines.push('├── docker-compose.yml');
  lines.push(hasDataDirs ? '├── umbrel-app.yml' : '└── umbrel-app.yml');
  
  // Add dynamic directories from volumes
  if (hasDataDirs) {
    const entries = Object.entries(tree);
    entries.forEach(([key, value], index) => {
      const isLast = index === entries.length - 1;
      renderTreeRecursive(key, value, isLast, '', lines);
    });
  }
  
  return lines.join('\n');
}

// Recursive helper to render tree structure
function renderTreeRecursive(
  name: string,
  node: any,
  isLast: boolean,
  prefix: string,
  lines: string[]
) {
  const connector = isLast ? '└── ' : '├── ';
  const extension = isLast ? '    ' : '│   ';
  
  lines.push(prefix + connector + name);
  
  if (node !== null && typeof node === 'object') {
    const childEntries = Object.entries(node);
    childEntries.forEach(([childKey, childValue], childIndex) => {
      const isLastChild = childIndex === childEntries.length - 1;
      renderTreeRecursive(childKey, childValue, isLastChild, prefix + extension, lines);
    });
  }
}

function ServiceEditor({
  service,
  index,
  umbrelAppId,
  onUpdate,
  onRemove,
  onAddPort,
  onUpdatePort,
  onRemovePort,
  onAddVolume,
  onUpdateVolume,
  onRemoveVolume,
  onUpdateEnvironment,
}: ServiceEditorProps) {
  const [newEnvKey, setNewEnvKey] = useState("");
  const [newEnvValue, setNewEnvValue] = useState("");

  const addEnvironmentVar = () => {
    if (newEnvKey.trim()) {
      onUpdateEnvironment(newEnvKey.trim(), newEnvValue);
      setNewEnvKey("");
      setNewEnvValue("");
    }
  };
  
  // Build complete file tree
  const fileTreeString = buildCompleteFileTree(service.volumes, umbrelAppId || 'your-app-id');

  return (
    <div className="p-4 border rounded-lg space-y-4 bg-card">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Service #{index + 1}</h4>
        <Button
          variant="destructive"
          size="sm"
          onClick={onRemove}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Remove
        </Button>
      </div>

      {/* Service Name */}
      <FieldWithTooltip 
        label="Service Name" 
        required 
        tooltip="A unique name for this service within your docker-compose file. Common names are 'web', 'app', 'db', 'redis', etc. This name will be used as the DNS hostname that other services can use to connect to this container. Use lowercase letters, numbers, and hyphens only."
      >
        <Input
          placeholder="web"
          value={service.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
        />
      </FieldWithTooltip>

      {/* Image */}
      <FieldWithTooltip
        label="Image"
        required
        tooltip="The Docker image to use for this service. Format: repository/image:tag@sha256:digest. The SHA256 digest is strongly recommended for security and reproducibility - it ensures you always get the exact same image. You can find the digest on Docker Hub or by running 'docker pull image:tag' and checking the output."
      >
        <Input
          placeholder="nginx:1.21.0@sha256:abc123..."
          value={service.image}
          onChange={(e) => onUpdate({ image: e.target.value })}
        />
      </FieldWithTooltip>

      {/* Restart Policy */}
      <FieldWithTooltip 
        label="Restart Policy" 
        tooltip="Hardcoded to 'on-failure' - the recommended policy for Umbrel apps. This ensures containers automatically restart if they crash or exit with an error, but won't restart if stopped manually. This is the optimal configuration for reliability and proper container lifecycle management."
      >
        <Input
          value="on-failure"
          disabled
          className="bg-muted cursor-not-allowed"
        />
      </FieldWithTooltip>

      {/* Ports */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FieldWithTooltip
            label="Ports (Optional)"
            tooltip="Port mappings in format 'host:container' (e.g., 8080:80 maps container port 80 to host port 8080). IMPORTANT: You do NOT need to expose your app's main web port if using app_proxy - that's handled automatically via APP_HOST and APP_PORT. Only add ports here for additional services like databases, APIs, or other non-web interfaces that need direct access."
          >
            <div />
          </FieldWithTooltip>
          <Button size="sm" variant="outline" onClick={onAddPort} className="gap-2">
            <Plus className="h-3 w-3" />
            Add Port
          </Button>
        </div>
        {service.ports.map((port, portIndex) => (
          <div key={portIndex} className="flex gap-2">
            <Input
              placeholder="8080:8080 or 5432:5432"
              value={port}
              onChange={(e) => onUpdatePort(portIndex, e.target.value)}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRemovePort(portIndex)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Volumes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FieldWithTooltip
            label="Volumes (Optional)"
            tooltip="Bind mounts for persistent data storage. Choose between ${APP_DATA_DIR}/ (your app's private data directory) or ${UMBREL_ROOT}/data/storage/ (Umbrel's communal storage for downloads/shared files). Format: 'host_path:container_path' or 'host_path:container_path:ro' (read-only). Without volumes, data will be lost when container restarts!"
          >
            <div />
          </FieldWithTooltip>
          <Button size="sm" variant="outline" onClick={onAddVolume} className="gap-2">
            <Plus className="h-3 w-3" />
            Add Volume
          </Button>
        </div>
        
        {service.volumes.some(v => v.includes('${UMBREL_ROOT}/data/storage/')) && (
          <div className="p-3 border border-blue-500/20 bg-blue-500/10 rounded-lg text-sm">
            <p className="font-medium text-blue-700 dark:text-blue-400 mb-1">
              💡 Tip: Communal Storage Permission Required
            </p>
            <p className="text-blue-600 dark:text-blue-300">
              You&apos;re using Umbrel&apos;s communal storage (<code className="text-xs bg-blue-500/20 px-1 py-0.5 rounded">$&#123;UMBREL_ROOT&#125;/data/storage/</code>). Make sure to enable the <strong>STORAGE_DOWNLOADS</strong> permission in your umbrel-app.yml configuration to access this shared storage directory.
            </p>
          </div>
        )}
        
        {service.volumes.map((volume, volumeIndex) => (
          <div key={volumeIndex} className="space-y-2">
            <div className="flex gap-2">
              <Select
                value={
                  volume.startsWith('${UMBREL_ROOT}/data/storage/') 
                    ? 'umbrel-storage' 
                    : 'app-data'
                }
                onValueChange={(value) => {
                  const parts = volume.split(':');
                  const containerPath = parts[1] || '';
                  const options = parts[2] || '';
                  
                  let newVolume = '';
                  if (value === 'umbrel-storage') {
                    newVolume = '${UMBREL_ROOT}/data/storage/';
                  } else {
                    newVolume = '${APP_DATA_DIR}/';
                  }
                  
                  // Preserve container path and options if they exist
                  if (containerPath) {
                    newVolume += ':' + containerPath;
                    if (options) {
                      newVolume += ':' + options;
                    }
                  }
                  
                  onUpdateVolume(volumeIndex, newVolume);
                }}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={5}>
                  <SelectItem value="app-data">
                    📁 App Data - $&#123;APP_DATA_DIR&#125;/
                  </SelectItem>
                  <SelectItem value="umbrel-storage">
                    💾 Communal Storage - $&#123;UMBREL_ROOT&#125;/data/storage/
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                placeholder="data:/app/data or downloads:/downloads"
                value={volume.replace(/^\$\{APP_DATA_DIR\}\//, '').replace(/^\$\{UMBREL_ROOT\}\/data\/storage\//, '')}
                onChange={(e) => {
                  const currentPrefix = volume.startsWith('${UMBREL_ROOT}/data/storage/') 
                    ? '${UMBREL_ROOT}/data/storage/' 
                    : '${APP_DATA_DIR}/';
                  onUpdateVolume(volumeIndex, currentPrefix + e.target.value);
                }}
                className="flex-1"
              />
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRemoveVolume(volumeIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {/* File Tree Visualization */}
        {service.volumes.length > 0 && fileTreeString.split('\n').length > 3 && (
          <div className="mt-4 p-4 border border-green-500/20 bg-green-500/5 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                📂 App Directory Structure Preview
              </span>
            </div>
            <pre className="text-xs font-mono text-muted-foreground overflow-x-auto leading-relaxed whitespace-pre">
{fileTreeString}
            </pre>
            <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-2">
              This shows the directory structure that will be created in your app&apos;s data folder.
            </p>
          </div>
        )}
      </div>

      {/* Environment Variables */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <FieldWithTooltip
            label="Environment Variables (Optional)"
            tooltip="Environment variables to pass to your container. Choose Object Format for key-value pairs or Array Format for 'KEY=value' strings."
          >
            <div />
          </FieldWithTooltip>
          <Select
            value={service.environmentFormat}
            onValueChange={(value: "object" | "array") => onUpdate({ environmentFormat: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={5}>
              <SelectItem value="object">Object Format</SelectItem>
              <SelectItem value="array">Array Format</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Special Umbrel Variables Info - Collapsible */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group w-full">
              <Info className="h-4 w-4" />
              <span>Special Umbrel Environment Variables</span>
              <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="grid gap-4">
                {/* System Variables */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    System Level
                  </h4>
                  <div className="space-y-2.5">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <code className="inline-flex items-center px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-semibold border border-blue-500/20">
                          $DEVICE_HOSTNAME
                        </code>
                      </div>
                      <div className="flex-1 text-sm text-muted-foreground">
                        <p>Server device hostname (e.g., <code className="text-xs bg-muted px-1 py-0.5 rounded">&quot;umbrel&quot;</code>)</p>
                        <p className="text-xs mt-1 text-muted-foreground/80">💡 Use to display device name in your app&apos;s UI</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <code className="inline-flex items-center px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-semibold border border-blue-500/20">
                          $DEVICE_DOMAIN_NAME
                        </code>
                      </div>
                      <div className="flex-1 text-sm text-muted-foreground">
                        <p>.local domain name (e.g., <code className="text-xs bg-muted px-1 py-0.5 rounded">&quot;umbrel.local&quot;</code>)</p>
                        <p className="text-xs mt-1 text-muted-foreground/80">💡 Create links to other services on the same Umbrel</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tor Variables */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Tor Proxy
                  </h4>
                  <div className="space-y-2.5">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <code className="inline-flex items-center px-2 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-mono font-semibold border border-purple-500/20">
                          $TOR_PROXY_IP
                        </code>
                      </div>
                      <div className="flex-1 text-sm text-muted-foreground">
                        <p>Local IP of Tor SOCKS proxy</p>
                        <p className="text-xs mt-1 text-muted-foreground/80">💡 Route app traffic through Tor for privacy</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <code className="inline-flex items-center px-2 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-mono font-semibold border border-purple-500/20">
                          $TOR_PROXY_PORT
                        </code>
                      </div>
                      <div className="flex-1 text-sm text-muted-foreground">
                        <p>Tor proxy port (typically <code className="text-xs bg-muted px-1 py-0.5 rounded">9050</code>)</p>
                        <p className="text-xs mt-1 text-muted-foreground/80">💡 Combine with $TOR_PROXY_IP to configure Tor</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* App Specific Variables */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    App Specific
                  </h4>
                  <div className="space-y-2.5">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <code className="inline-flex items-center px-2 py-1 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-mono font-semibold border border-green-500/20">
                          $APP_HIDDEN_SERVICE
                        </code>
                      </div>
                      <div className="flex-1 text-sm text-muted-foreground">
                        <p>Your app&apos;s .onion address (Tor hidden service)</p>
                        <p className="text-xs mt-1 text-muted-foreground/80">💡 Display to users for anonymous Tor access</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <code className="inline-flex items-center px-2 py-1 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-mono font-semibold border border-green-500/20">
                          $APP_PASSWORD
                        </code>
                      </div>
                      <div className="flex-1 text-sm text-muted-foreground">
                        <p>Unique random password shown in Umbrel UI</p>
                        <p className="text-xs mt-1 text-muted-foreground/80">💡 Use for app authentication (shown to user)</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <code className="inline-flex items-center px-2 py-1 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-mono font-semibold border border-green-500/20">
                          $APP_SEED
                        </code>
                      </div>
                      <div className="flex-1 text-sm text-muted-foreground">
                        <p>256-bit deterministic seed from user&apos;s Umbrel seed</p>
                        <p className="text-xs mt-1 text-muted-foreground/80">💡 Generate deterministic keys that persist across restores</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {service.environmentFormat === "object" ? (
          <>
            {Object.entries(service.environment).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <Input value={key} disabled className="w-1/3" />
                <Input
                  value={value}
                  onChange={(e) => onUpdateEnvironment(key, e.target.value)}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateEnvironment(key, "")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <div className="flex gap-2">
              <Input
                placeholder="KEY (no quotes needed)"
                value={newEnvKey}
                onChange={(e) => {
                  // Strip quotes and whitespace as user types
                  const cleanValue = e.target.value.replace(/["'\s]/g, '');
                  setNewEnvKey(cleanValue);
                }}
                className="w-1/3"
              />
              <Input
                placeholder="value (no quotes needed)"
                value={newEnvValue}
                onChange={(e) => setNewEnvValue(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" onClick={addEnvironmentVar} className="gap-2">
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
          </>
        ) : (
          <Textarea
            placeholder={`Enter one environment variable per line in KEY=value format (without quotes):\nELASTIC_PASSWORD=verysecret\nES_JAVA_OPTS=-Xms1g -Xmx1g\nxpack.security.enabled=true`}
            value={service.environmentArray.join('\n')}
            onChange={(e) => {
              // Keep all lines including empty ones for editing
              // Strip quotes from each line as they type
              const lines = e.target.value.split('\n').map(line => 
                line.replace(/^["']|["']$/g, '')
              );
              onUpdate({ environmentArray: lines });
            }}
            rows={8}
            className="font-mono text-sm"
          />
        )}
      </div>
    </div>
  );
}

