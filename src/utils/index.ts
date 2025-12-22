/**
 * Utility functions for DCF Tools
 *
 * Shared utilities used across commands and library functions.
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

export const readFile = async (filePath: string): Promise<string> => {
  return await fs.readFile(filePath, 'utf-8');
};

export const writeFile = async (filePath: string, content: string): Promise<void> => {
  await fs.writeFile(filePath, content, 'utf-8');
};

export const readDCFFile = async (filePath: string): Promise<any> => {
  const content = await fs.readFile(filePath, 'utf-8');

  // Determine if file is JSON or YAML based on extension
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.json') {
    return JSON.parse(content);
  } else if (ext === '.yaml' || ext === '.yml') {
    return yaml.load(content) as any;
  } else {
    // Default to JSON for unknown extensions
    return JSON.parse(content);
  }
};

export const parseDCF = (content: string): unknown => {
  // Try parsing as JSON first, then as YAML
  try {
    return JSON.parse(content);
  } catch {
    return yaml.load(content) as any;
  }
};

export const formatDCF = (document: unknown): string => {
  return JSON.stringify(document, null, 2);
};