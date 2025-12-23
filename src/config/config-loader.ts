import { promises as fs } from 'fs';
import * as path from 'path';
import yaml from 'js-yaml';

export interface DCFConfig {
  dcf_version?: string;
  profile?: string;
  capabilities?: string[];
  [key: string]: any; // Allow additional properties
}

export interface ValidationContext {
  profile: string;           // Effective profile (from config, CLI, or file)
  capabilities: string[];    // Enabled capabilities
  schemaOverride?: string;   // Custom schema bundle path/URL
  disableCrossValidation: boolean;  // Whether to skip cross-file validation
  files: string[];          // Files to validate
  configFile?: string;      // Path to config file
}

/**
 * Loads configuration from a specified config file
 * @param configPath - Path to the configuration file (supports YAML and JSON)
 * @returns DCFConfig object
 */
export async function loadConfig(configPath: string): Promise<DCFConfig> {
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    
    let config: any;
    
    if (configPath.endsWith('.json')) {
      config = JSON.parse(content);
    } else if (configPath.endsWith('.yaml') || configPath.endsWith('.yml')) {
      config = yaml.load(content) as any;
    } else {
      // Try JSON first, then YAML
      try {
        config = JSON.parse(content);
      } catch {
        config = yaml.load(content) as any;
      }
    }
    
    // Validate the config structure
    validateConfig(config, configPath);
    
    return config;
  } catch (error) {
    throw new Error(`Failed to load configuration from ${configPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates the configuration structure
 */
function validateConfig(config: DCFConfig, configPath: string): void {
  if (config.profile && !['lite', 'standard', 'strict'].includes(config.profile)) {
    throw new Error(`Invalid profile in config file ${configPath}: ${config.profile}. Must be one of: lite, standard, strict`);
  }
  
  if (config.capabilities && !Array.isArray(config.capabilities)) {
    throw new Error(`Capabilities in config file ${configPath} must be an array`);
  }
  
  if (config.capabilities && !config.capabilities.every(cap => typeof cap === 'string')) {
    throw new Error(`All capabilities in config file ${configPath} must be strings`);
  }
}

/**
 * Merges configuration values with CLI options, following precedence rules
 * CLI options take precedence over config file values
 * 
 * @param configFile - Path to config file (optional)
 * @param cliProfile - Profile specified via CLI (optional)
 * @param cliCapabilities - Capabilities specified via CLI (optional)
 * @param defaultProfile - Default profile if nothing else is specified
 * @returns ValidationContext with merged configuration
 */
export async function mergeConfig(
  configFile: string | undefined,
  cliProfile: string | undefined,
  cliCapabilities: string | undefined, // This will come as comma-separated string from CLI
  defaultProfile: string = 'standard'
): Promise<ValidationContext> {
  const context: ValidationContext = {
    profile: defaultProfile,
    capabilities: [],
    disableCrossValidation: false,
    files: [], // This will be populated later with actual files to validate
  };
  
  // Load config file if provided
  if (configFile) {
    const config = await loadConfig(configFile);
    context.configFile = configFile;
    
    if (config.profile) {
      context.profile = config.profile;
    }
    
    if (config.capabilities) {
      context.capabilities = [...config.capabilities];
    }
  }
  
  // CLI options override config file values
  if (cliProfile) {
    context.profile = cliProfile;
  }
  
  if (cliCapabilities) {
    // Parse comma-separated capabilities from CLI
    const cliCapArray = cliCapabilities.split(',')
      .map(cap => cap.trim())
      .filter(cap => cap.length > 0);
    
    context.capabilities = cliCapArray;
  }
  
  return context;
}