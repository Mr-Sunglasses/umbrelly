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
}

export function DockerComposeForm({ config, onChange }: DockerComposeFormProps) {
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
            tooltip="The Docker Compose file format version. Umbrel requires version 3.7 or higher. This ensures compatibility with all Docker Compose features needed for Umbrel apps. Don't change this unless you have a specific reason."
          >
            <Input
              placeholder="3.7"
              value={config.version}
              onChange={(e) => updateConfig({ version: e.target.value })}
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
                <strong>What is App Proxy?</strong> The Umbrel App Proxy is a security layer that automatically protects your app by requiring users to enter their Umbrel password.
              </p>
              <p>
                Users must authenticate either when they login to the main Umbrel Web UI or when visiting an app directly (e.g., http://umbrel.local:3002). This prevents unauthorized access to your app.
              </p>
              <p className="text-yellow-600 dark:text-yellow-500">
                <strong>⚠️ Important:</strong> It's highly recommended to keep this enabled unless your app has its own authentication system.
              </p>
            </div>

            {config.appProxy.enabled && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                {/* APP_HOST */}
                <FieldWithTooltip
                  label="APP_HOST"
                  required
                  tooltip="The DNS name of your web container. Format: <app-id>_<service-name>_1 (e.g., 'btc-rpc-explorer_web_1'). The '_1' suffix is required by Docker Compose for the first instance of a service. This tells the proxy which container to route traffic to."
                >
                  <Input
                    placeholder="myapp_web_1"
                    value={config.appProxy.APP_HOST}
                    onChange={(e) => updateAppProxy({ APP_HOST: e.target.value })}
                  />
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
                  tooltip='Set to "false" to completely disable Umbrel authentication for this app. Only use this if your app has its own built-in authentication system. When disabled, anyone who can access your Umbrel can access this app without entering a password.'
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
                No services added yet. Click "Add Service" to create one.
              </p>
            ) : (
              <div className="space-y-6">
                {config.services.map((service, index) => (
                  <ServiceEditor
                    key={service.id}
                    service={service}
                    index={index}
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
              Disable App Proxy?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              <p className="mb-3">
                Disabling the App Proxy is <strong>not recommended</strong>.
              </p>
              <p>
                The App Proxy provides automatic authentication protection for your app. Without it, your app will be publicly accessible without requiring the Umbrel password.
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

function ServiceEditor({
  service,
  index,
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
        tooltip="Defines when Docker should automatically restart this container: 'no' = never restart automatically, 'always' = always restart (even after reboot), 'on-failure' = restart only if container exits with error (recommended for Umbrel apps), 'unless-stopped' = always restart unless manually stopped."
      >
        <Select
          value={service.restart}
          onValueChange={(value) => onUpdate({ restart: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={5}>
            <SelectItem value="no">no - Never restart</SelectItem>
            <SelectItem value="always">always - Always restart</SelectItem>
            <SelectItem value="on-failure">on-failure - Restart on error (recommended)</SelectItem>
            <SelectItem value="unless-stopped">unless-stopped - Restart unless manually stopped</SelectItem>
          </SelectContent>
        </Select>
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
            tooltip="Bind mounts for persistent data storage. Format: 'host_path:container_path' or 'host_path:container_path:ro' (for read-only). ALL volumes MUST start with ${APP_DATA_DIR}/ which Umbrel will replace with your app's data directory. You can also use ${APP_LIGHTNING_NODE_DATA_DIR} for Lightning node data (read-only) or ${APP_BITCOIN_DATA_DIR} for Bitcoin Core data (read-only). Without volumes, data will be lost when container restarts!"
          >
            <div />
          </FieldWithTooltip>
          <Button size="sm" variant="outline" onClick={onAddVolume} className="gap-2">
            <Plus className="h-3 w-3" />
            Add Volume
          </Button>
        </div>
        {service.volumes.map((volume, volumeIndex) => (
          <div key={volumeIndex} className="flex gap-2">
            <Input
              placeholder="${APP_DATA_DIR}/data:/app/data"
              value={volume}
              onChange={(e) => onUpdateVolume(volumeIndex, e.target.value)}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRemoveVolume(volumeIndex)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
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
                        <p>Server device hostname (e.g., <code className="text-xs bg-muted px-1 py-0.5 rounded">"umbrel"</code>)</p>
                        <p className="text-xs mt-1 text-muted-foreground/80">💡 Use to display device name in your app's UI</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <code className="inline-flex items-center px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-semibold border border-blue-500/20">
                          $DEVICE_DOMAIN_NAME
                        </code>
                      </div>
                      <div className="flex-1 text-sm text-muted-foreground">
                        <p>.local domain name (e.g., <code className="text-xs bg-muted px-1 py-0.5 rounded">"umbrel.local"</code>)</p>
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
                        <p>Your app's .onion address (Tor hidden service)</p>
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
                        <p>256-bit deterministic seed from user's Umbrel seed</p>
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

