export type ManifestVersion = "1" | "1.1";

export type AppCategory = 
  | "files"
  | "bitcoin"
  | "media"
  | "networking"
  | "social"
  | "automation"
  | "finance"
  | "ai"
  | "developer";

export interface UmbrelAppConfig {
  manifestVersion: ManifestVersion;
  id: string;
  category: AppCategory;
  name: string;
  version: string;
  tagline: string;
  description: string;
  releaseNotes: string;
  developer: string;
  website: string;
  dependencies: string;
  repo: string;
  support: string;
  port: string;
  gallery: string;
  path: string;
  defaultUsername: string;
  defaultPassword: string;
  deterministicPassword: boolean;
  submitter: string;
  submission: string;
}

export const defaultUmbrelAppConfig: UmbrelAppConfig = {
  manifestVersion: "1",
  id: "",
  category: "automation",
  name: "",
  version: "",
  tagline: "",
  description: "",
  releaseNotes: "",
  developer: "",
  website: "",
  dependencies: "",
  repo: "",
  support: "",
  port: "",
  gallery: "",
  path: "",
  defaultUsername: "",
  defaultPassword: "",
  deterministicPassword: false,
  submitter: "",
  submission: "",
};

export type FileType = "umbrel-app" | "docker-compose";

