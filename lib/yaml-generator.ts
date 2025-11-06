import yaml from "js-yaml";
import { UmbrelAppConfig } from "./types";

export function generateUmbrelAppYaml(config: UmbrelAppConfig): string {
  const yamlObject: any = {
    manifestVersion: config.manifestVersion === "1.1" ? 1.1 : 1,
    id: config.id || undefined,
    category: config.category || undefined,
    name: config.name || undefined,
    version: config.version || undefined,
    tagline: config.tagline || undefined,
    description: config.description || undefined,
    developer: config.developer || undefined,
    website: config.website || undefined,
    repo: config.repo || undefined,
    support: config.support || undefined,
    port: config.port ? Number(config.port) : undefined,
    submitter: config.submitter || undefined,
    submission: config.submission || undefined,
  };

  // Always include releaseNotes with empty string as default
  yamlObject.releaseNotes = config.releaseNotes || "";

  // Always include dependencies - as empty array if not provided, or array if provided
  if (config.dependencies && config.dependencies.trim()) {
    yamlObject.dependencies = config.dependencies.split(',').map(d => d.trim()).filter(Boolean);
  } else {
    yamlObject.dependencies = [];
  }

  // Always include gallery - generate from galleryCount
  if (config.galleryCount > 0) {
    yamlObject.gallery = Array.from({ length: config.galleryCount }, (_, i) => `${i + 1}.jpg`);
  } else {
    yamlObject.gallery = [];
  }

  // Always include permissions - as empty array if not provided, or array if provided
  if (config.permissions && config.permissions.trim()) {
    yamlObject.permissions = config.permissions.split(',').map(p => p.trim()).filter(Boolean);
  } else {
    yamlObject.permissions = [];
  }

  // Always include path with empty string as default
  yamlObject.path = config.path || "";

  // Always include defaultUsername with empty string as default
  yamlObject.defaultUsername = config.defaultUsername || "";

  // Handle deterministicPassword and defaultPassword
  if (config.deterministicPassword) {
    // If deterministicPassword is true, include it and exclude defaultPassword
    yamlObject.deterministicPassword = true;
  } else {
    // If deterministicPassword is false, include defaultPassword (don't include deterministicPassword)
    yamlObject.defaultPassword = config.defaultPassword || "";
  }

  // Remove undefined values
  Object.keys(yamlObject).forEach(key => 
    yamlObject[key] === undefined && delete yamlObject[key]
  );

  let yamlOutput = yaml.dump(yamlObject, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false,
  });

  // Ensure version numbers are always quoted
  if (config.version) {
    // Replace unquoted version with quoted version
    yamlOutput = yamlOutput.replace(/^version: (.+)$/m, `version: "${config.version}"`);
  }

  // Ensure empty strings are properly quoted with double quotes
  // Replace single quotes or ensure double quotes for empty values
  yamlOutput = yamlOutput.replace(/^releaseNotes: ''$/m, 'releaseNotes: ""');
  yamlOutput = yamlOutput.replace(/^path: ''$/m, 'path: ""');
  yamlOutput = yamlOutput.replace(/^defaultUsername: ''$/m, 'defaultUsername: ""');
  
  // Format releaseNotes with >- (same logic as description)
  if (config.releaseNotes && config.releaseNotes.trim()) {
    // Process lines: regular lines stay as-is, empty lines become double empty lines
    // List items (starting with -) get extra indentation
    const lines = config.releaseNotes.split('\n').map(line => line.trim());
    const processedLines: string[] = [];
    
    for (const line of lines) {
      if (line === '') {
        // Empty line in input -> add two empty lines in YAML for paragraph break
        processedLines.push('');
        processedLines.push('');
      } else if (line.startsWith('-')) {
        // List item -> add two extra spaces for proper indentation
        processedLines.push(`  ${line}`);
      } else {
        processedLines.push(line);
      }
    }
    
    const content = processedLines.join('\n  ');
    
    // Use line-by-line approach to avoid regex issues
    const yamlLines = yamlOutput.split('\n');
    const newLines: string[] = [];
    let i = 0;
    let skipMode = false;
    
    while (i < yamlLines.length) {
      const line = yamlLines[i];
      
      if (line.startsWith('releaseNotes:')) {
        // Found the releaseNotes field - replace it
        newLines.push('releaseNotes: >-');
        newLines.push(`  ${content}`);
        skipMode = true;
        i++;
        continue;
      }
      
      if (skipMode) {
        // Skip indented lines that are part of releaseNotes
        if (line.startsWith('  ') || line.trim() === '') {
          i++;
          continue;
        } else {
          // Found next field, stop skipping
          skipMode = false;
        }
      }
      
      newLines.push(line);
      i++;
    }
    
    yamlOutput = newLines.join('\n');
  }
  
  // Only handle defaultPassword if deterministicPassword is false
  if (!config.deterministicPassword) {
    yamlOutput = yamlOutput.replace(/^defaultPassword: ''$/m, 'defaultPassword: ""');
  }

  // Ensure path, defaultUsername, and defaultPassword are always quoted (even when filled)
  if (config.path) {
    yamlOutput = yamlOutput.replace(/^path: (.+)$/m, (match, value) => {
      // Remove existing quotes if any, then add double quotes
      const cleanValue = value.replace(/^['"]|['"]$/g, '');
      return `path: "${cleanValue}"`;
    });
  }
  if (config.defaultUsername) {
    yamlOutput = yamlOutput.replace(/^defaultUsername: (.+)$/m, (match, value) => {
      const cleanValue = value.replace(/^['"]|['"]$/g, '');
      return `defaultUsername: "${cleanValue}"`;
    });
  }
  // Only handle defaultPassword if deterministicPassword is false
  if (!config.deterministicPassword && config.defaultPassword) {
    yamlOutput = yamlOutput.replace(/^defaultPassword: (.+)$/m, (match, value) => {
      const cleanValue = value.replace(/^['"]|['"]$/g, '');
      return `defaultPassword: "${cleanValue}"`;
    });
  }

  // Format description with >- (folded block scalar with strip chomping)
  if (config.description) {
    // Process lines: regular lines stay as-is, empty lines become double empty lines
    // List items (starting with -) get extra indentation
    const lines = config.description.split('\n').map(line => line.trim());
    const processedLines: string[] = [];
    
    for (const line of lines) {
      if (line === '') {
        // Empty line in input -> add two empty lines in YAML for paragraph break
        processedLines.push('');
        processedLines.push('');
      } else if (line.startsWith('-')) {
        // List item -> add two extra spaces for proper indentation
        processedLines.push(`  ${line}`);
      } else {
        processedLines.push(line);
      }
    }
    
    const content = processedLines.join('\n  ');
    
    // Use line-by-line approach to avoid regex issues
    const yamlLines = yamlOutput.split('\n');
    const newLines: string[] = [];
    let i = 0;
    let skipMode = false;
    
    while (i < yamlLines.length) {
      const line = yamlLines[i];
      
      if (line.startsWith('description:')) {
        // Found the description field - replace it
        newLines.push('description: >-');
        newLines.push(`  ${content}`);
        skipMode = true;
        i++;
        continue;
      }
      
      if (skipMode) {
        // Skip indented lines that are part of the description
        if (line.startsWith('  ') || line.trim() === '') {
          i++;
          continue;
        } else {
          // Found next field, stop skipping
          skipMode = false;
        }
      }
      
      newLines.push(line);
      i++;
    }
    
    yamlOutput = newLines.join('\n');
  }

  return yamlOutput;
}

