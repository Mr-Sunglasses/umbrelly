import yaml from "js-yaml";
import { DockerComposeConfig } from "./docker-compose-types";

export function generateDockerComposeYaml(config: DockerComposeConfig): string {
  const composeObject: any = {
    version: "3.7",
    services: {},
  };

  // Add app_proxy service if enabled
  if (config.appProxy.enabled) {
    const appProxyEnv: any = {};
    
    if (config.appProxy.APP_HOST) {
      appProxyEnv.APP_HOST = config.appProxy.APP_HOST;
    }
    if (config.appProxy.APP_PORT) {
      appProxyEnv.APP_PORT = config.appProxy.APP_PORT;
    }
    if (config.appProxy.PROXY_AUTH_ADD) {
      appProxyEnv.PROXY_AUTH_ADD = config.appProxy.PROXY_AUTH_ADD;
    }
    if (config.appProxy.PROXY_AUTH_WHITELIST) {
      appProxyEnv.PROXY_AUTH_WHITELIST = config.appProxy.PROXY_AUTH_WHITELIST;
    }
    if (config.appProxy.PROXY_AUTH_BLACKLIST) {
      appProxyEnv.PROXY_AUTH_BLACKLIST = config.appProxy.PROXY_AUTH_BLACKLIST;
    }

    if (Object.keys(appProxyEnv).length > 0) {
      composeObject.services.app_proxy = {
        environment: appProxyEnv,
      };
    }
  }

  // Add custom services
  config.services.forEach((service) => {
    if (!service.name) return;

    const serviceObj: any = {};

    if (service.image) {
      serviceObj.image = service.image;
    }
    
    if (service.restart) {
      serviceObj.restart = service.restart;
    }

    if (service.ports && service.ports.length > 0) {
      serviceObj.ports = service.ports.filter(p => p.trim());
    }

    if (service.volumes && service.volumes.length > 0) {
      serviceObj.volumes = service.volumes.filter(v => v.trim());
    }

    // Handle environment variables based on format
    if (service.environmentFormat === "array") {
      if (service.environmentArray && service.environmentArray.length > 0) {
        // Filter out empty lines and trim, but keep the raw string format
        const cleanedEnv = service.environmentArray
          .map(e => e.trim())
          .filter(e => e.length > 0);
        
        if (cleanedEnv.length > 0) {
          serviceObj.environment = cleanedEnv;
        }
      }
    } else {
      if (service.environment && Object.keys(service.environment).length > 0) {
        serviceObj.environment = service.environment;
      }
    }

    composeObject.services[service.name] = serviceObj;
  });

  let yamlOutput = yaml.dump(composeObject, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false,
    flowLevel: -1,
  });

  // Post-process to ensure APP_PORT, PROXY_AUTH_WHITELIST and PROXY_AUTH_BLACKLIST are always quoted
  yamlOutput = yamlOutput.replace(/^(\s+APP_PORT:\s+)(.+)$/gm, (match, prefix, value) => {
    if (!value.startsWith('"') && !value.startsWith("'")) {
      return `${prefix}"${value}"`;
    }
    return match;
  });
  
  yamlOutput = yamlOutput.replace(/^(\s+PROXY_AUTH_WHITELIST:\s+)(.+)$/gm, (match, prefix, value) => {
    if (!value.startsWith('"') && !value.startsWith("'")) {
      return `${prefix}"${value}"`;
    }
    return match;
  });
  
  yamlOutput = yamlOutput.replace(/^(\s+PROXY_AUTH_BLACKLIST:\s+)(.+)$/gm, (match, prefix, value) => {
    if (!value.startsWith('"') && !value.startsWith("'")) {
      return `${prefix}"${value}"`;
    }
    return match;
  });

  // Post-process to ensure ports are always quoted (except in app_proxy)
  const lines = yamlOutput.split('\n');
  let inPortsSection = false;
  let portsSectionIndent = 0;
  let currentService = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const currentIndent = line.search(/\S/);
    
    // Track which service we're in
    const serviceMatch = line.match(/^\s{2}(\w+):/);
    if (serviceMatch) {
      currentService = serviceMatch[1];
    }
    
    // Check if we're entering a ports section
    if (/^\s+ports:\s*$/.test(line)) {
      inPortsSection = true;
      portsSectionIndent = currentIndent;
      continue;
    }
    
    // Check if we've left the ports section
    if (inPortsSection && currentIndent >= 0 && currentIndent <= portsSectionIndent && !/^\s*-/.test(line)) {
      inPortsSection = false;
    }
    
    // If we're in a ports section and this is an array item
    // BUT skip app_proxy service
    if (inPortsSection && currentService !== 'app_proxy' && /^\s+-\s+(.+)$/.test(line)) {
      const match = line.match(/^(\s+-\s+)(.+)$/);
      if (match) {
        const prefix = match[1];
        const value = match[2];
        
        // Check if it's a port pattern and not already quoted
        if (/^[\d.:]+$/.test(value) && !value.startsWith('"') && !value.startsWith("'")) {
          lines[i] = `${prefix}"${value}"`;
        }
      }
    }
  }
  
  yamlOutput = lines.join('\n');

  return yamlOutput;
}

