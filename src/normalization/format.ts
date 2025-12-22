import yaml from 'js-yaml';

export interface OutputOptions {
  format: 'json' | 'yaml';
  pretty: boolean;
  outputPath?: string;
}

/**
 * Formats the normalized DCF document according to the specified options.
 * 
 * @param normalizedDocument - The normalized DCF document to format
 * @param options - Formatting options
 * @returns Formatted string representation of the document
 */
export function formatOutput(normalizedDocument: any, options: OutputOptions): string {
  if (options.format === 'yaml') {
    // Format as YAML
    return yaml.dump(normalizedDocument, {
      indent: options.pretty ? 2 : undefined,
      noRefs: true, // Disable YAML references for simpler output
      lineWidth: -1, // Don't wrap lines
    });
  } else {
    // Format as JSON
    if (options.pretty) {
      return JSON.stringify(normalizedDocument, null, 2);
    } else {
      return JSON.stringify(normalizedDocument);
    }
  }
}

/**
 * Writes the formatted output to the specified destination.
 * 
 * @param output - The formatted output string
 * @param outputPath - Optional path to write to; if not provided, returns the string
 * @returns Promise that resolves when writing is complete (or immediately if writing to stdout)
 */
export async function writeOutput(output: string, outputPath?: string): Promise<void> {
  if (outputPath) {
    // Write to file
    const fs = await import('fs');
    await fs.promises.writeFile(outputPath, output, 'utf8');
  } else {
    // Write to stdout
    process.stdout.write(output);
  }
}