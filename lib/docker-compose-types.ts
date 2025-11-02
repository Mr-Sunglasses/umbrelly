export interface DockerComposeEnvironment {
  [key: string]: string;
}

export interface AppProxyConfig {
  enabled: boolean;
  APP_HOST: string;
  APP_PORT: string;
  PROXY_AUTH_ADD?: string;
  PROXY_AUTH_WHITELIST?: string;
  PROXY_AUTH_BLACKLIST?: string;
}

export interface ServiceConfig {
  id: string;
  name: string;
  image: string;
  restart: string;
  ports: string[];
  volumes: string[];
  environment: DockerComposeEnvironment;
  environmentFormat: "object" | "array";
  environmentArray: string[];
}

export interface DockerComposeConfig {
  version: string;
  appProxy: AppProxyConfig;
  services: ServiceConfig[];
}

export const defaultDockerComposeConfig: DockerComposeConfig = {
  version: "3.7",
  appProxy: {
    enabled: true,
    APP_HOST: "",
    APP_PORT: "",
  },
  services: [],
};

export const defaultServiceConfig: ServiceConfig = {
  id: "",
  name: "",
  image: "",
  restart: "on-failure",
  ports: [],
  volumes: [],
  environment: {},
  environmentFormat: "object",
  environmentArray: [],
};

// Special Umbrel environment variables that can be used
export const UMBREL_SPECIAL_VARS = [
  { key: "$DEVICE_HOSTNAME", description: "Umbrel server device hostname (e.g. \"umbrel\")" },
  { key: "$DEVICE_DOMAIN_NAME", description: "A .local domain name for the Umbrel server (e.g. \"umbrel.local\")" },
  { key: "$TOR_PROXY_IP", description: "Local IP of Tor proxy" },
  { key: "$TOR_PROXY_PORT", description: "Port of Tor proxy" },
  { key: "$APP_HIDDEN_SERVICE", description: "The address of the Tor hidden service your app will be exposed at" },
  { key: "$APP_PASSWORD", description: "Unique plain text password that can be used for authentication in your app" },
  { key: "$APP_SEED", description: "Unique 256 bit long hex string (128 bits of entropy) deterministically derived from user's Umbrel seed and your app's ID" },
];

