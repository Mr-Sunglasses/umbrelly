"use client";

import { useState } from "react";
import { DockerComposeConfig, ServiceConfig, defaultServiceConfig } from "@/lib/docker-compose-types";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { FieldWithTooltip } from "./field-with-tooltip";
import { TooltipProvider } from "./ui/tooltip";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
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
            tooltip="Docker Compose file format version. Version 3.7 is recommended for Umbrel apps."
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

            <p className="text-sm text-muted-foreground">
              The Umbrel App Proxy automatically protects an app by requiring the user to enter their Umbrel password (either when they login into the main Web UI or by visiting an app directly e.g. http://umbrel.local:3002)
            </p>

            {config.appProxy.enabled && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                {/* APP_HOST */}
                <FieldWithTooltip
                  label="APP_HOST"
                  required
                  tooltip="Format: <app-id>_<web-container-name>_1 (e.g. 'btc-rpc-explorer_web_1'). Note that the '_1' at the end is needed."
                >
                  <Input
                    placeholder="btc-rpc-explorer_web_1"
                    value={config.appProxy.APP_HOST}
                    onChange={(e) => updateAppProxy({ APP_HOST: e.target.value })}
                  />
                </FieldWithTooltip>

                {/* APP_PORT */}
                <FieldWithTooltip
                  label="APP_PORT"
                  required
                  tooltip="The port number that your web container is listening on"
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
                  tooltip='Set to "false" to disable authentication completely'
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
                  tooltip="Whitelist specific paths to bypass authentication (e.g. '/api/*')"
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
                  tooltip="Blacklist specific paths to require authentication (e.g. '/admin/*'). Use with WHITELIST to protect specific sections."
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
      <FieldWithTooltip label="Service Name" required tooltip="Unique name for this service">
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
        tooltip="Docker image in format: <docker-image>:<tag>@sha256:<digest>"
      >
        <Input
          placeholder="nginx:latest@sha256:abc123..."
          value={service.image}
          onChange={(e) => onUpdate({ image: e.target.value })}
        />
      </FieldWithTooltip>

      {/* Restart Policy */}
      <FieldWithTooltip label="Restart Policy" tooltip="When to restart the container">
        <Select
          value={service.restart}
          onValueChange={(value) => onUpdate({ restart: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={5}>
            <SelectItem value="no">no</SelectItem>
            <SelectItem value="always">always</SelectItem>
            <SelectItem value="on-failure">on-failure</SelectItem>
            <SelectItem value="unless-stopped">unless-stopped</SelectItem>
          </SelectContent>
        </Select>
      </FieldWithTooltip>

      {/* Ports */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FieldWithTooltip
            label="Ports (Optional)"
            tooltip="You do not need to expose the port that your app's web server is listening on if you're using the app_proxy service. This is handled by APP_HOST and APP_PORT. Only expose additional ports if needed."
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
              placeholder="8080:8080"
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
            tooltip="Bind mounts for persistent data. Must start with ${APP_DATA_DIR}/. Example: ${APP_DATA_DIR}/data:/app/data or use special variables like ${APP_LIGHTNING_NODE_DATA_DIR}:/lnd:ro or ${APP_BITCOIN_DATA_DIR}:/bitcoin:ro"
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FieldWithTooltip
            label="Environment Variables (Optional)"
            tooltip="Special Umbrel variables: $DEVICE_HOSTNAME, $DEVICE_DOMAIN_NAME, $TOR_PROXY_IP, $TOR_PROXY_PORT, $APP_HIDDEN_SERVICE, $APP_PASSWORD, $APP_SEED"
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

