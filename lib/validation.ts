import { UmbrelAppConfig } from "./types";

export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
}

export function validateUmbrelAppConfig(config: UmbrelAppConfig): ValidationResult {
  const requiredFields: { key: keyof UmbrelAppConfig; label: string }[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "version", label: "Version" },
    { key: "tagline", label: "Tagline" },
    { key: "description", label: "Description" },
    { key: "developer", label: "Developer" },
    { key: "website", label: "Website" },
    { key: "repo", label: "Repository" },
    { key: "support", label: "Support" },
    { key: "port", label: "Port" },
    { key: "submitter", label: "Submitter" },
    { key: "submission", label: "Submission" },
  ];

  const missingFields: string[] = [];

  for (const field of requiredFields) {
    const value = config[field.key];
    if (!value || (typeof value === "string" && value.trim() === "")) {
      missingFields.push(field.label);
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

