import { promises as fs } from 'fs';
import * as path from 'path';
import yaml from 'js-yaml';
const { load } = yaml;

export interface DCFProjectManifest {
  dcf_project: number;
  name: string;
  projects: {
    [key: string]: {
      root: string;
      extends?: string;
      layers: string[];
    }
  };
}

export interface ProjectConfig {
  root: string;
  extends?: string;
  layers: string[];
}

/**
 * Loads and parses a dcf.project.yaml manifest file
 */
export async function loadProjectManifest(manifestPath: string): Promise<DCFProjectManifest> {
  try {
    const content = await fs.readFile(manifestPath, 'utf-8');
    const manifest = load(content) as DCFProjectManifest;
    
    if (!manifest.dcf_project) {
      throw new Error(`Invalid manifest: missing dcf_project field in ${manifestPath}`);
    }
    
    if (!manifest.projects) {
      throw new Error(`Invalid manifest: missing projects field in ${manifestPath}`);
    }
    
    return manifest;
  } catch (error) {
    throw new Error(`Failed to load project manifest ${manifestPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Loads a DCF document from a file path (supports both JSON and YAML)
 */
export async function loadDCFDocument(filePath: string): Promise<any> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    if (filePath.endsWith('.json')) {
      return JSON.parse(content);
    } else if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
      return load(content);
    } else {
      // Try JSON first, then YAML
      try {
        return JSON.parse(content);
      } catch {
        return load(content);
      }
    }
  } catch (error) {
    throw new Error(`Failed to load DCF document ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deep merges DCF documents following DCF merge rules:
 * - Objects: deep merge
 * - Arrays: replace (not merge)
 * - Other values: replace
 */
export function mergeDCFDocuments(base: any, overlay: any): any {
  if (base === null || base === undefined) return overlay;
  if (overlay === null || overlay === undefined) return base;
  
  // If both are objects, deep merge
  if (typeof base === 'object' && typeof overlay === 'object' && 
      !Array.isArray(base) && !Array.isArray(overlay)) {
    
    const result: any = { ...base };
    
    for (const key in overlay) {
      if (overlay.hasOwnProperty(key)) {
        if (result.hasOwnProperty(key)) {
          // If both values are objects (but not arrays), deep merge
          if (typeof result[key] === 'object' && typeof overlay[key] === 'object' &&
              !Array.isArray(result[key]) && !Array.isArray(overlay[key])) {
            result[key] = mergeDCFDocuments(result[key], overlay[key]);
          } else {
            // Otherwise, replace (including arrays)
            result[key] = overlay[key];
          }
        } else {
          result[key] = overlay[key];
        }
      }
    }
    
    return result;
  }
  
  // For arrays or other types, replace
  return overlay;
}

/**
 * Loads and merges all layers for a specific project according to the manifest
 */
export async function loadAndMergeProjectLayers(projectRoot: string, projectConfig: ProjectConfig): Promise<any> {
  let mergedDocument: any = {};
  
  // If this project extends another, load the base project first
  if (projectConfig.extends) {
    // This would require loading the extended project - simplified for now
    // In a full implementation, we'd need to resolve the extended project config
    console.warn(`Project extension not fully implemented for: ${projectConfig.extends}`);
  }
  
  // Load and merge each layer in order
  for (const layerPath of projectConfig.layers) {
    const fullPath = path.resolve(projectRoot, layerPath);
    
    // Handle if layerPath is a directory - we need to load all DCF files in the directory
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      const files = await fs.readdir(fullPath);
      for (const file of files) {
        if (file.endsWith('.json') || file.endsWith('.yaml') || file.endsWith('.yml')) {
          const filePath = path.join(fullPath, file);
          const document = await loadDCFDocument(filePath);
          mergedDocument = mergeDCFDocuments(mergedDocument, document);
        }
      }
    } else {
      // Handle single file
      const document = await loadDCFDocument(fullPath);
      mergedDocument = mergeDCFDocuments(mergedDocument, document);
    }
  }
  
  return mergedDocument;
}

/**
 * Gets the configuration for a specific project from the manifest
 */
export function getProjectConfig(manifest: DCFProjectManifest, projectName?: string): ProjectConfig {
  if (!projectName) {
    // If no project name specified, return the first project
    const projectNames = Object.keys(manifest.projects);
    if (projectNames.length === 0) {
      throw new Error('No projects defined in manifest');
    }
    projectName = projectNames[0];
  }
  
  const projectConfig = manifest.projects[projectName];
  if (!projectConfig) {
    throw new Error(`Project '${projectName}' not found in manifest`);
  }
  
  return projectConfig;
}