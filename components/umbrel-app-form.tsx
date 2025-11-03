"use client";

import { useState } from "react";
import { UmbrelAppConfig, AppCategory } from "@/lib/types";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { FieldWithTooltip } from "./field-with-tooltip";
import { TooltipProvider } from "./ui/tooltip";
import { ProtectedField } from "./protected-field";

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
];

export function UmbrelAppForm({ config, onChange }: UmbrelAppFormProps) {
  const [releaseNotesEnabled, setReleaseNotesEnabled] = useState(false);
  const [galleryEnabled, setGalleryEnabled] = useState(false);

  const updateField = (field: keyof UmbrelAppConfig, value: string | boolean) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-full overflow-auto">
        <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">umbrel-app.yml Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Fill in the details below to generate your Umbrel app configuration
          </p>
        </div>

        {/* Manifest Version */}
        <FieldWithTooltip
          label="Manifest Version"
          required
          tooltip="Select the manifest format version for your app. Version 1 is the standard format for most apps and includes all basic configuration fields. Version 1.1 adds support for lifecycle hooks - custom scripts that run at specific stages (pre-start, post-install, post-update, pre-uninstall). Choose 1.1 only if your app needs to execute custom initialization scripts, database migrations, or cleanup tasks. For simple apps without special setup requirements, use version 1."
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
        </FieldWithTooltip>

        {/* ID */}
        <FieldWithTooltip
          label="ID"
          required
          tooltip="A unique identifier for your app in the Umbrel ecosystem. Must be lowercase letters, numbers, and dashes only (e.g., 'my-awesome-app'). This ID is used in file paths, environment variables, and cannot be changed after submission. Choose something descriptive and memorable. Avoid generic names that might conflict with other apps."
        >
          <Input
            placeholder="my-awesome-app"
            value={config.id}
            onChange={(e) => updateField("id", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          />
        </FieldWithTooltip>

        {/* Category */}
        <FieldWithTooltip
          label="Category"
          required
          tooltip="The primary category where your app will appear in the Umbrel App Store. Choose the category that best matches your app's main function. This helps users discover your app when browsing by category. If your app serves multiple purposes, pick the most prominent one."
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
        </FieldWithTooltip>

        {/* Name */}
        <FieldWithTooltip
          label="Name"
          required
          tooltip="The human-readable display name shown in the Umbrel App Store and UI. This is what users see when browsing apps. Can include uppercase letters, spaces, and special characters. Keep it concise (2-3 words) and recognizable. Examples: 'Bitcoin Node', 'Nextcloud', 'VS Code Server'."
        >
          <Input
            placeholder="My Awesome App"
            value={config.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </FieldWithTooltip>

        {/* Version */}
        <FieldWithTooltip
          label="Version"
          required
          tooltip="The version number of the underlying software your app runs. Use semantic versioning format (e.g., '2.5.0', '1.0.0-beta'). This should match the version of the Docker image you're using. Users see this to know what version they're running. Update this number when you update the app's Docker image to a newer version."
        >
          <Input
            placeholder="1.0.0"
            value={config.version}
            onChange={(e) => updateField("version", e.target.value)}
          />
        </FieldWithTooltip>

        {/* Tagline */}
        <FieldWithTooltip
          label="Tagline"
          required
          tooltip="A short, catchy one-liner (5-10 words) that captures what your app does. Shown below the app name in the store. Should be punchy and memorable. No period at the end. Examples: 'Run your own VPN server', 'Self-hosted photo management', 'Collaborative document editing'. Focus on the main benefit or use case."
        >
          <Input
            placeholder="The best app for doing awesome things"
            value={config.tagline}
            onChange={(e) => updateField("tagline", e.target.value)}
          />
        </FieldWithTooltip>

        {/* Description */}
        <FieldWithTooltip
          label="Description"
          required
          tooltip="A comprehensive description of your app (2-4 paragraphs). Explain what the app does, key features, main use cases, and why users would want to install it. Use clear, accessible language avoiding excessive technical jargon. This appears on the app's detail page. Make it engaging and informative to help users decide if the app meets their needs."
        >
          <Textarea
            placeholder="This app helps you do amazing things..."
            value={config.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={4}
          />
        </FieldWithTooltip>

        {/* Release Notes */}
        <FieldWithTooltip
          label="Release Notes"
          tooltip="Release notes for new apps should be empty. Only fill this in for app updates to describe what's new in this version."
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
        </FieldWithTooltip>

        {/* Developer */}
        <FieldWithTooltip
          label="Developer"
          required
          tooltip="The name of the person, team, or organization that develops and maintains the original software. This is NOT you (unless you're the actual developer). For example, if you're packaging Nextcloud, the developer is 'Nextcloud GmbH'. This gives proper attribution to the original creators."
        >
          <Input
            placeholder="John Doe"
            value={config.developer}
            onChange={(e) => updateField("developer", e.target.value)}
          />
        </FieldWithTooltip>

        {/* Website */}
        <FieldWithTooltip
          label="Website"
          required
          tooltip="The official website URL of the original software project. This should be the main homepage where users can learn more about the software (e.g., https://nextcloud.com for Nextcloud). Must be a valid HTTPS URL. Users may visit this to read documentation or learn about features before installing."
        >
          <Input
            type="url"
            placeholder="https://myawesomeapp.com"
            value={config.website}
            onChange={(e) => updateField("website", e.target.value)}
          />
        </FieldWithTooltip>

        {/* Dependencies */}
        <FieldWithTooltip
          label="Dependencies"
          tooltip="Other Umbrel apps that must be installed for your app to work. Enter as comma-separated app IDs (e.g., 'bitcoin, lightning'). When users install your app, Umbrel will automatically install dependencies first. Common dependencies: 'bitcoin' (Bitcoin Core), 'lightning' (LND), 'electrs' (Electrum Server). Leave empty if your app is standalone."
        >
          <Input
            placeholder="bitcoin, lightning"
            value={config.dependencies}
            onChange={(e) => updateField("dependencies", e.target.value)}
          />
        </FieldWithTooltip>

        {/* Repo */}
        <FieldWithTooltip
          label="Repository"
          required
          tooltip="The source code repository URL for the original software project (usually GitHub or GitLab). This should link to the upstream project's repository, not your fork. Users and reviewers use this to verify the software's authenticity and license. Example: 'https://github.com/nextcloud/server'."
        >
          <Input
            type="url"
            placeholder="https://github.com/username/repo"
            value={config.repo}
            onChange={(e) => updateField("repo", e.target.value)}
          />
        </FieldWithTooltip>

        {/* Support */}
        <FieldWithTooltip
          label="Support"
          required
          tooltip="Where users can get help with this app. Can be the project's GitHub Issues page, community forum, Discord server, or support website. Users experiencing problems will visit this link. Make sure it's actively monitored. If the project has multiple support channels, choose the most appropriate for Umbrel-specific issues."
        >
          <Input
            type="url"
            placeholder="https://github.com/username/repo/issues"
            value={config.support}
            onChange={(e) => updateField("support", e.target.value)}
          />
        </FieldWithTooltip>

        {/* Port */}
        <FieldWithTooltip
          label="Port"
          required
          tooltip="The external port number users will use to access your app on their Umbrel (e.g., http://umbrel.local:PORT). Choose a unique port not used by other Umbrel apps. Recommended range: 8000-9999 or 3000-3999. This is mapped to your app's internal container port via app_proxy in docker-compose.yml. Check the Umbrel app list to avoid conflicts."
        >
          <Input
            type="number"
            placeholder="8080"
            value={config.port}
            onChange={(e) => updateField("port", e.target.value)}
          />
        </FieldWithTooltip>

        {/* Gallery */}
        <FieldWithTooltip
          label="Gallery"
          tooltip="Screenshot URLs for your app's gallery. LEAVE EMPTY FOR NEW APP SUBMISSIONS - screenshots should be included in your pull request as image files, not URLs. This field is only used for existing apps that are being updated. If filling for an update, provide comma-separated HTTPS URLs to hosted images (1280x720 recommended)."
        >
          <ProtectedField
            isEnabled={galleryEnabled}
            onEnable={() => setGalleryEnabled(true)}
            warningTitle="Warning: Gallery"
            warningMessage="For new app submissions, the gallery field should be left empty. Screenshots should be submitted separately through the pull request. Are you sure you want to edit this field?"
          >
            {({ disabled }) => (
              <Input
                placeholder="Leave empty for new apps"
                value={config.gallery}
                onChange={(e) => updateField("gallery", e.target.value)}
                disabled={disabled}
              />
            )}
          </ProtectedField>
        </FieldWithTooltip>

        {/* Path */}
        <FieldWithTooltip
          label="Path"
          tooltip="Optional URL path suffix for your app. Most apps should leave this empty. Only use if your app requires a specific path after the port (e.g., '/admin', '/web'). The full URL would be http://umbrel.local:PORT/path. This is rare - only needed if the app's web interface isn't at the root path. Leave empty unless you're certain it's needed."
        >
          <Input
            placeholder="Leave empty unless needed"
            value={config.path}
            onChange={(e) => updateField("path", e.target.value)}
          />
        </FieldWithTooltip>

        {/* Default Username */}
        <FieldWithTooltip
          label="Default Username"
          tooltip="The default username for logging into your app, if it has built-in authentication. This will be displayed to users in the Umbrel UI after installation. Only fill this if the app comes with a pre-configured username. Examples: 'admin', 'umbrel'. Leave empty if the app doesn't have authentication or if users create their own accounts during setup."
        >
          <Input
            placeholder="Leave empty unless needed"
            value={config.defaultUsername}
            onChange={(e) => updateField("defaultUsername", e.target.value)}
          />
        </FieldWithTooltip>

        {/* Deterministic Password */}
        <FieldWithTooltip
          label="Deterministic Password"
          tooltip="Set to 'Yes' if your app generates its own password deterministically from $APP_SEED. This means the password is automatically derived from the user's Umbrel seed and will be the same if they restore from backup. When enabled, the 'Default Password' field is hidden and users won't see a fixed password in the UI. Choose 'No' if using $APP_PASSWORD (random password shown to user) or no password at all."
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
        </FieldWithTooltip>

        {/* Default Password - Only show if deterministicPassword is false */}
        {!config.deterministicPassword && (
          <FieldWithTooltip
            label="Default Password"
            tooltip="The default password for logging into your app. This will be shown to users in the Umbrel UI. You can use $APP_PASSWORD to have Umbrel generate a unique random password for each user. Alternatively, specify a fixed password if the app requires it. Leave empty if the app doesn't require authentication or if users set up passwords during first-time setup."
          >
            <Input
              type="password"
              placeholder="Leave empty unless needed"
              value={config.defaultPassword}
              onChange={(e) => updateField("defaultPassword", e.target.value)}
            />
          </FieldWithTooltip>
        )}

        {/* Submitter */}
        <FieldWithTooltip
          label="Submitter"
          required
          tooltip="YOUR name - the person packaging and submitting this app to the Umbrel App Store. This is different from 'Developer' (which is the original software creator). Your name will be credited in the app store as the community member who packaged this app for Umbrel. Use your real name or GitHub username."
        >
          <Input
            placeholder="Jane Smith"
            value={config.submitter}
            onChange={(e) => updateField("submitter", e.target.value)}
          />
        </FieldWithTooltip>

        {/* Submission */}
        <FieldWithTooltip
          label="Submission"
          required
          tooltip="The GitHub pull request URL where you're submitting this app to the Umbrel App Store repository. Format: 'https://github.com/getumbrel/umbrel-apps/pull/XXX'. You'll create the pull request on GitHub first, then add that URL here. This links your configuration to the actual submission for tracking and review purposes."
        >
          <Input
            type="url"
            placeholder="https://github.com/getumbrel/umbrel-apps/pull/123"
            value={config.submission}
            onChange={(e) => updateField("submission", e.target.value)}
          />
        </FieldWithTooltip>
      </div>
    </div>
    </TooltipProvider>
  );
}

