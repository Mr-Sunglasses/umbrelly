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
          tooltip="There are currently two manifest versions: 1 and 1.1. Version 1 is the basic version and is sufficient for most apps. However, if your app requires the use of hooks (scripts that are run at different stages of the app lifecycle), you need to use version 1.1. Hooks allow you to perform custom actions at different stages of the app's lifecycle, such as before the app starts (pre-start), after the app installs (post-install), and more. If your app doesn't need to use hooks, you can stick with manifest version 1."
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
          tooltip="Unique identifier for your app (lowercase letters and dashes only)"
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
          tooltip="Select the category that best describes your app"
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
          tooltip="The display name of your app"
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
          tooltip="Version of your app (e.g., 1.0.0)"
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
          tooltip="A short, catchy description of your app (does not need to end with a period)"
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
          tooltip="A detailed description of your app and its features"
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
          tooltip="Name of the app developer or organization"
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
          tooltip="Official website URL for your app"
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
          tooltip="Comma-separated list of other Umbrel apps this app depends on (e.g., bitcoin, lightning)"
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
          tooltip="GitHub or GitLab repository URL"
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
          tooltip="URL where users can get help (e.g., GitHub issues, forum, Discord)"
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
          tooltip="Port number where your app runs on Umbrel OS"
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
          tooltip="Comma-separated list of image URLs for app screenshots (leave empty for new app submissions)"
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
          tooltip="Optional custom path for accessing your app"
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
          tooltip="Default username for app authentication (if applicable)"
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
          tooltip="Enable this if the app uses a deterministic password generation method. When enabled, defaultPassword field will be removed from the config."
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
            tooltip="Default password for app authentication (if applicable)"
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
          tooltip="Name of the person submitting this app to Umbrel"
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
          tooltip="Pull request URL for the app submission"
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

