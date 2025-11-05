"use client";

import { useState } from "react";
import { UmbrelAppConfig, AppCategory } from "@/lib/types";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ExpandableField } from "./expandable-field";
import { ProtectedField } from "./protected-field";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

interface UmbrelAppFormProps {
  config: UmbrelAppConfig;
  onChange: (config: UmbrelAppConfig) => void;
}

const categories: { value: AppCategory; label: string }[] = [
  { value: "files", label: "Files" },
  { value: "bitcoin", label: "Bitcoin" },
  { value: "media", label: "Media" },
  { value: "networking", label: "Networking" },
  { value: "social", label: "Social" },
  { value: "automation", label: "Automation" },
  { value: "finance", label: "Finance" },
  { value: "ai", label: "AI" },
  { value: "developer", label: "Developer" },
  { value: "crypto", label: "Crypto" },
];

export function UmbrelAppForm({ config, onChange }: UmbrelAppFormProps) {
  const [releaseNotesEnabled, setReleaseNotesEnabled] = useState(false);

  const updateField = (field: keyof UmbrelAppConfig, value: string | boolean | number) => {
    onChange({ ...config, [field]: value });
  };

  return (
      <div className="h-full overflow-auto">
        <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">umbrel-app.yml Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Fill in the details below to generate your Umbrel app configuration
          </p>
        </div>

        {/* Manifest Version */}
        <ExpandableField
          label="Manifest Version"
          required
          description="Select the manifest format version for your app. Version 1 is the standard format for most apps and includes all basic configuration fields. Version 1.1 adds support for lifecycle hooks - custom scripts that run at specific stages (pre-start, post-install, post-update, pre-uninstall). Choose 1.1 only if your app needs to execute custom initialization scripts, database migrations, or cleanup tasks. For simple apps without special setup requirements, use version 1."
        >
          <Select
            value={config.manifestVersion}
            onValueChange={(value) => updateField("manifestVersion", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="1.1">1.1</SelectItem>
            </SelectContent>
          </Select>
        </ExpandableField>

        {/* ID */}
        <ExpandableField
          label="ID"
          required
          description="A unique identifier for your app in the Umbrel ecosystem. Must be lowercase letters, numbers, and dashes only (e.g., 'my-awesome-app'). This ID is used in file paths, environment variables, and cannot be changed after submission. Choose something descriptive and memorable. Avoid generic names that might conflict with other apps."
        >
          <Input
            placeholder="my-awesome-app"
            value={config.id}
            onChange={(e) => updateField("id", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          />
        </ExpandableField>

        {/* Category */}
        <ExpandableField
          label="Category"
          required
          description="The primary category where your app will appear in the Umbrel App Store. Choose the category that best matches your app's main function. This helps users discover your app when browsing by category. If your app serves multiple purposes, pick the most prominent one."
        >
          <Select
            value={config.category}
            onValueChange={(value) => updateField("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ExpandableField>

        {/* Name */}
        <ExpandableField
          label="Name"
          required
          description="The human-readable display name shown in the Umbrel App Store and UI. This is what users see when browsing apps. Can include uppercase letters, spaces, and special characters. Keep it concise (2-3 words) and recognizable. Examples: 'Bitcoin Node', 'Nextcloud', 'VS Code Server'."
        >
          <Input
            placeholder="My Awesome App"
            value={config.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </ExpandableField>

        {/* Version */}
        <ExpandableField
          label="Version"
          required
          description="The version number of the underlying software your app runs. Use semantic versioning format (e.g., '2.5.0', '1.0.0-beta'). This should match the version of the Docker image you're using. Users see this to know what version they're running. Update this number when you update the app's Docker image to a newer version."
        >
          <Input
            placeholder="1.0.0"
            value={config.version}
            onChange={(e) => updateField("version", e.target.value)}
          />
        </ExpandableField>

        {/* Tagline */}
        <ExpandableField
          label="Tagline"
          required
          description="A short, catchy one-liner (5-10 words) that captures what your app does. Shown below the app name in the store. Should be punchy and memorable. No period at the end. Examples: 'Run your own VPN server', 'Self-hosted photo management', 'Collaborative document editing'. Focus on the main benefit or use case."
        >
          <Input
            placeholder="The best app for doing awesome things"
            value={config.tagline}
            onChange={(e) => {
              // Remove trailing periods
              const value = e.target.value.replace(/\.+$/, '');
              updateField("tagline", value);
            }}
          />
        </ExpandableField>

        {/* Description */}
        <ExpandableField
          label="Description"
          required
          description="A comprehensive description of your app (2-4 paragraphs). Explain what the app does, key features, main use cases, and why users would want to install it. Use clear, accessible language avoiding excessive technical jargon. This appears on the app's detail page. Make it engaging and informative to help users decide if the app meets their needs."
        >
          <Textarea
            placeholder="This app helps you do amazing things..."
            value={config.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={4}
          />
        </ExpandableField>

        {/* Release Notes */}
        <ExpandableField
          label="Release Notes"
          description="Release notes for new apps should be empty. Only fill this in for app updates to describe what's new in this version."
        >
          <ProtectedField
            isEnabled={releaseNotesEnabled}
            onEnable={() => setReleaseNotesEnabled(true)}
            warningTitle="Warning: Release Notes"
            warningMessage="For new app submissions, release notes should be left empty. This field is only meant for updates to existing apps. Are you sure you want to edit this field?"
          >
            {({ disabled }) => (
              <Textarea
                placeholder="Leave empty for new apps"
                value={config.releaseNotes}
                onChange={(e) => updateField("releaseNotes", e.target.value)}
                rows={3}
                disabled={disabled}
              />
            )}
          </ProtectedField>
        </ExpandableField>

        {/* Developer */}
        <ExpandableField
          label="Developer"
          required
          description="The name of the person, team, or organization that develops and maintains the original software. This is NOT you (unless you're the actual developer). For example, if you're packaging Nextcloud, the developer is 'Nextcloud GmbH'. This gives proper attribution to the original creators."
        >
          <Input
            placeholder="John Doe"
            value={config.developer}
            onChange={(e) => updateField("developer", e.target.value)}
          />
        </ExpandableField>

        {/* Website */}
        <ExpandableField
          label="Website"
          required
          description="The official website URL of the original software project. This should be the main homepage where users can learn more about the software (e.g., https://nextcloud.com for Nextcloud). Must be a valid HTTPS URL. Users may visit this to read documentation or learn about features before installing."
        >
          <Input
            type="url"
            placeholder="https://myawesomeapp.com"
            value={config.website}
            onChange={(e) => updateField("website", e.target.value)}
          />
        </ExpandableField>

        {/* Dependencies */}
        <ExpandableField
          label="Dependencies"
          description="Other Umbrel apps that must be installed for your app to work. Enter as comma-separated app IDs (e.g., 'bitcoin, lightning'). When users install your app, Umbrel will automatically install dependencies first. Common dependencies: 'bitcoin' (Bitcoin Core), 'lightning' (LND), 'electrs' (Electrum Server). Leave empty if your app is standalone."
        >
          <Input
            placeholder="bitcoin, lightning"
            value={config.dependencies}
            onChange={(e) => updateField("dependencies", e.target.value)}
          />
        </ExpandableField>

        {/* Permissions */}
        <ExpandableField
          label="Permissions"
          description="Special system permissions that your app needs to function. Select the permissions your app requires. STORAGE_DOWNLOADS grants access to the shared downloads folder across apps. GPU grants access to GPU hardware for compute-intensive tasks like AI/ML workloads or video encoding."
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="storage-downloads"
                checked={config.permissions.includes("STORAGE_DOWNLOADS")}
                onCheckedChange={(checked) => {
                  const permissions = config.permissions.split(',').map(p => p.trim()).filter(Boolean);
                  if (checked) {
                    if (!permissions.includes("STORAGE_DOWNLOADS")) {
                      permissions.push("STORAGE_DOWNLOADS");
                    }
                  } else {
                    const index = permissions.indexOf("STORAGE_DOWNLOADS");
                    if (index > -1) {
                      permissions.splice(index, 1);
                    }
                  }
                  updateField("permissions", permissions.join(", "));
                }}
              />
              <Label
                htmlFor="storage-downloads"
                className="text-sm font-normal cursor-pointer"
              >
                STORAGE_DOWNLOADS - Access to shared downloads folder
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="gpu"
                checked={config.permissions.includes("GPU")}
                onCheckedChange={(checked) => {
                  const permissions = config.permissions.split(',').map(p => p.trim()).filter(Boolean);
                  if (checked) {
                    if (!permissions.includes("GPU")) {
                      permissions.push("GPU");
                    }
                  } else {
                    const index = permissions.indexOf("GPU");
                    if (index > -1) {
                      permissions.splice(index, 1);
                    }
                  }
                  updateField("permissions", permissions.join(", "));
                }}
              />
              <Label
                htmlFor="gpu"
                className="text-sm font-normal cursor-pointer"
              >
                GPU - Access to GPU hardware for compute tasks
              </Label>
            </div>
          </div>
        </ExpandableField>

        {/* Repo */}
        <ExpandableField
          label="Repository"
          required
          description="The source code repository URL for the original software project (usually GitHub or GitLab). This should link to the upstream project's repository, not your fork. Users and reviewers use this to verify the software's authenticity and license. Example: 'https://github.com/nextcloud/server'."
        >
          <Input
            type="url"
            placeholder="https://github.com/username/repo"
            value={config.repo}
            onChange={(e) => updateField("repo", e.target.value)}
          />
        </ExpandableField>

        {/* Support */}
        <ExpandableField
          label="Support"
          required
          description="Where users can get help with this app. Can be the project's GitHub Issues page, community forum, Discord server, or support website. Users experiencing problems will visit this link. Make sure it's actively monitored. If the project has multiple support channels, choose the most appropriate for Umbrel-specific issues."
        >
          <Input
            type="url"
            placeholder="https://github.com/username/repo/issues"
            value={config.support}
            onChange={(e) => updateField("support", e.target.value)}
          />
        </ExpandableField>

        {/* Port */}
        <ExpandableField
          label="Port"
          required
          description="The external port number users will use to access your app on their Umbrel (e.g., http://umbrel.local:PORT). Choose a unique port not used by other Umbrel apps. Recommended range: 8000-9999 or 3000-3999. This is mapped to your app's internal container port via app_proxy in docker-compose.yml. Check the Umbrel app list to avoid conflicts."
        >
          <Input
            type="number"
            placeholder="8080"
            value={config.port}
            onChange={(e) => updateField("port", e.target.value)}
          />
        </ExpandableField>

        {/* Gallery */}
        <ExpandableField
          label="Gallery Screenshots"
          description="Number of screenshot images to include (3-8 recommended). Screenshots should be named 1.jpg, 2.jpg, 3.jpg, etc. and submitted in your pull request. The generator will automatically create the gallery array with numbered filenames."
        >
          <div className="space-y-2">
            <Select
              value={config.galleryCount.toString()}
              onValueChange={(value) => updateField("galleryCount", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select number of screenshots" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">None (0)</SelectItem>
                <SelectItem value="3">3 screenshots</SelectItem>
                <SelectItem value="4">4 screenshots</SelectItem>
                <SelectItem value="5">5 screenshots</SelectItem>
                <SelectItem value="6">6 screenshots</SelectItem>
                <SelectItem value="7">7 screenshots</SelectItem>
                <SelectItem value="8">8 screenshots</SelectItem>
              </SelectContent>
            </Select>
            {config.galleryCount > 0 && (
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Preview:</p>
                <pre className="text-xs font-mono text-muted-foreground">
gallery:
{Array.from({ length: config.galleryCount }, (_, i) => `  - ${i + 1}.jpg`).join('\n')}
                </pre>
              </div>
            )}
          </div>
        </ExpandableField>

        {/* Path */}
        <ExpandableField
          label="Path"
          description="Optional URL path suffix for your app. Most apps should leave this empty. Only use if your app requires a specific path after the port (e.g., '/admin', '/web'). The full URL would be http://umbrel.local:PORT/path. This is rare - only needed if the app's web interface isn't at the root path. Leave empty unless you're certain it's needed."
        >
          <Input
            placeholder="Leave empty unless needed"
            value={config.path}
            onChange={(e) => updateField("path", e.target.value)}
          />
        </ExpandableField>

        {/* Default Username */}
        <ExpandableField
          label="Default Username"
          description="The default username for logging into your app, if it has built-in authentication. This will be displayed to users in the Umbrel UI after installation. Only fill this if the app comes with a pre-configured username. Examples: 'admin', 'umbrel'. Leave empty if the app doesn't have authentication or if users create their own accounts during setup."
        >
          <Input
            placeholder="Leave empty unless needed"
            value={config.defaultUsername}
            onChange={(e) => updateField("defaultUsername", e.target.value)}
          />
        </ExpandableField>

        {/* Deterministic Password */}
        <ExpandableField
          label="Deterministic Password"
          description="Set to 'Yes' if your app generates its own password deterministically from $APP_SEED. This means the password is automatically derived from the user's Umbrel seed and will be the same if they restore from backup. When enabled, the 'Default Password' field is hidden and users won't see a fixed password in the UI. Choose 'No' if using $APP_PASSWORD (random password shown to user) or no password at all."
        >
          <Select
            value={config.deterministicPassword ? "true" : "false"}
            onValueChange={(value) => {
              const isEnabled = value === "true";
              const newConfig = { ...config, deterministicPassword: isEnabled };
              if (isEnabled) {
                newConfig.defaultPassword = "";
              }
              onChange(newConfig);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {config.deterministicPassword ? "Yes" : "No"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={5}>
              <SelectItem value="false">No</SelectItem>
              <SelectItem value="true">Yes</SelectItem>
            </SelectContent>
          </Select>
        </ExpandableField>

        {/* Default Password - Only show if deterministicPassword is false */}
        {!config.deterministicPassword && (
          <ExpandableField
            label="Default Password"
            description="The default password for logging into your app. This will be shown to users in the Umbrel UI. You can use $APP_PASSWORD to have Umbrel generate a unique random password for each user. Alternatively, specify a fixed password if the app requires it. Leave empty if the app doesn't require authentication or if users set up passwords during first-time setup."
          >
            <Input
              type="password"
              placeholder="Leave empty unless needed"
              value={config.defaultPassword}
              onChange={(e) => updateField("defaultPassword", e.target.value)}
            />
          </ExpandableField>
        )}

        {/* Submitter */}
        <ExpandableField
          label="Submitter"
          required
          description="YOUR name - the person packaging and submitting this app to the Umbrel App Store. This is different from 'Developer' (which is the original software creator). Your name will be credited in the app store as the community member who packaged this app for Umbrel. Use your real name or GitHub username."
        >
          <Input
            placeholder="Jane Smith"
            value={config.submitter}
            onChange={(e) => updateField("submitter", e.target.value)}
          />
        </ExpandableField>

        {/* Submission */}
        <ExpandableField
          label="Submission"
          required
          description="The GitHub pull request URL where you're submitting this app to the Umbrel App Store repository. Format: 'https://github.com/getumbrel/umbrel-apps/pull/XXX'. You'll create the pull request on GitHub first, then add that URL here. This links your configuration to the actual submission for tracking and review purposes."
        >
          <Input
            type="url"
            placeholder="https://github.com/getumbrel/umbrel-apps/pull/123"
            value={config.submission}
            onChange={(e) => updateField("submission", e.target.value)}
          />
        </ExpandableField>
      </div>
    </div>
  );
}

