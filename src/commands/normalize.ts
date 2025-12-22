import { Command } from 'commander';
import { promises as fs } from 'fs';
import { normalizeDCF } from '../normalization/core';
import { formatOutput, writeOutput, OutputOptions } from '../normalization/format';
import yaml from 'js-yaml';

export const normalizeCommand = new Command('normalize')
  .description('Transform DCF documents to canonical JSON format')
  .argument('[file]', 'Path to DCF document to normalize')
  .option('-o, --out <file>', 'Output file (default: stdout)')
  .option('--format <format>', 'Output format: json or yaml (default: json)', 'json')
  .option('--pretty', 'Pretty-print output for readability', false)
  .action(async (file, options) => {
    try {
      if (!file) {
        console.error('Error: A DCF document file path must be provided');
        normalizeCommand.help();
        process.exit(2); // Tool error
      }

      // Validate format option
      if (options.format !== 'json' && options.format !== 'yaml') {
        console.error('Error: Format must be either "json" or "yaml"');
        process.exit(2); // Tool error
      }

      // Read the input file
      const content = await fs.readFile(file, 'utf-8');
      
      // Parse the content (try JSON first, then YAML)
      let dcfDocument: any;
      try {
        dcfDocument = JSON.parse(content);
      } catch {
        try {
          dcfDocument = yaml.load(content) as any;
        } catch {
          console.error('Error: Invalid JSON or YAML format in input file');
          process.exit(2); // Tool error
        }
      }

      // Normalize the document
      const normalizedDocument = normalizeDCF(dcfDocument, file);

      // Format the output
      const outputOptions: OutputOptions = {
        format: options.format as 'json' | 'yaml',
        pretty: options.pretty,
        outputPath: options.out
      };

      const formattedOutput = formatOutput(normalizedDocument, outputOptions);

      // Write the output
      await writeOutput(formattedOutput, options.out);

      // Exit with success code
      process.exit(0);
    } catch (error) {
      console.error('Tool error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(2); // Tool error
    }
  });