import yaml from "js-yaml";
import { DockerComposeConfig } from "./docker-compose-types";

export function generateDockerComposeYaml(config: DockerComposeConfig): string {
  const composeObject: any = {
    version: config.version,
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

  return yaml.dump(composeObject, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false,
    flowLevel: -1,
  });
}

