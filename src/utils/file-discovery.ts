import { promises as fs } from 'fs';
import * as path from 'path';
import { glob } from 'glob';

/**
 * Finds DCF files in the specified paths, which can be files, directories, or glob patterns.
 * @param paths - Array of paths to search (files, directories, or glob patterns)
 * @returns Array of DCF file paths
 */
export async function findDCFFiles(paths: string[]): Promise<string[]> {
  const dcfFiles: string[] = [];
  const processedFiles = new Set<string>(); // To avoid duplicates

  for (const inputPath of paths) {
    // Check if it's a glob pattern (contains *, ?, [, ])
    if (isGlobPattern(inputPath)) {
      const globMatches = glob.sync(inputPath, { 
        absolute: true,
        nodir: true 
      });
      
      for (const file of globMatches) {
        if (isDCFFile(file) && !processedFiles.has(file)) {
          dcfFiles.push(file);
          processedFiles.add(file);
        }
      }
    } else {
      const stat = await fs.stat(inputPath);
      
      if (stat.isDirectory()) {
        // Recursively scan directory for DCF files
        const dirFiles = await findDCFFilesInDirectory(inputPath);
        for (const file of dirFiles) {
          if (!processedFiles.has(file)) {
            dcfFiles.push(file);
            processedFiles.add(file);
          }
        }
      } else if (stat.isFile() && isDCFFile(inputPath)) {
        if (!processedFiles.has(inputPath)) {
          dcfFiles.push(inputPath);
          processedFiles.add(inputPath);
        }
      }
    }
  }

  return dcfFiles;
}

/**
 * Checks if a path contains glob pattern characters
 */
function isGlobPattern(inputPath: string): boolean {
  return /[*,?,\[,\]]/.test(inputPath);
}

/**
 * Checks if a file has a DCF extension (json, yaml, yml)
 */
function isDCFFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.json' || ext === '.yaml' || ext === '.yml';
}

/**
 * Recursively finds DCF files in a directory
 */
async function findDCFFilesInDirectory(dirPath: string): Promise<string[]> {
  const files: string[] = [];
  const dirents = await fs.readdir(dirPath, { withFileTypes: true });

  for (const dirent of dirents) {
    const fullPath = path.join(dirPath, dirent.name);

    if (dirent.isDirectory()) {
      // Recursively scan subdirectory
      const subDirFiles = await findDCFFilesInDirectory(fullPath);
      files.push(...subDirFiles);
    } else if (dirent.isFile() && isDCFFile(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}