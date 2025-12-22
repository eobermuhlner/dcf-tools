import { Command } from 'commander';
import { validateDCF, ValidationResult, ValidationError } from '../lib/validation';

// Format validation result as JSON
function formatJsonOutput(result: ValidationResult): string {
  return JSON.stringify(result, null, 2);
}

// Format validation result as human-readable text
function formatTextOutput(result: ValidationResult): string {
  let output = '';

  if (result.dcf_version) {
    output += `DCF Version: ${result.dcf_version}\n`;
  }
  if (result.profile) {
    output += `Profile: ${result.profile}\n`;
  }

  output += `\nStatus: ${result.ok ? 'VALID' : 'INVALID'}\n\n`;

  if (result.errors.length > 0) {
    output += `Errors (${result.errors.length}):\n`;
    result.errors.forEach((error: ValidationError, index: number) => {
      output += `  ${index + 1}. [${error.code}] ${error.message}`;
      if (error.path) {
        output += ` (at ${error.path})`;
      }
      output += '\n';
    });
    output += '\n';
  }

  if (result.warnings.length > 0) {
    output += `Warnings (${result.warnings.length}):\n`;
    result.warnings.forEach((warning: ValidationError, index: number) => {
      output += `  ${index + 1}. [${warning.code}] ${warning.message}`;
      if (warning.path) {
        output += ` (at ${warning.path})`;
      }
      output += '\n';
    });
    output += '\n';
  }

  if (result.ok && result.errors.length === 0) {
    output += 'No validation issues found.\n';
  }

  return output;
}

export const validateCommand = new Command('validate')
  .description('Validate DCF documents against schema and reference rules')
  .argument('[file]', 'Path to DCF document to validate')
  .option('--format <format>', 'Output format: json or text (default: text unless CI=true)', 'text')
  .option('--strict-warnings', 'Treat warnings as errors (exit code 1)')
  .action(async (file, options) => {
    try {
      // Determine output format based on options or CI environment
      let outputFormat = options.format;
      if (!options.format && process.env.CI === 'true') {
        outputFormat = 'json';
      }

      // If no file is provided, show help
      if (!file) {
        console.error('Error: A DCF document file path must be provided');
        validateCommand.help();
        process.exit(2); // Tool error
      }

      // Run validation
      const result = await validateDCF(file, {
        strictWarnings: options.strictWarnings
      });

      // Format and output the result
      if (outputFormat === 'json') {
        console.log(formatJsonOutput(result));
      } else {
        console.log(formatTextOutput(result));
      }

      // Exit with appropriate code
      if (result.errors.some(error => error.code.startsWith('E_TOOL'))) {
        // Tool error
        process.exit(2);
      } else if (!result.ok) {
        // Validation error
        process.exit(1);
      } else {
        // Success
        process.exit(0);
      }
    } catch (error) {
      console.error('Tool error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(2); // Tool error
    }
  });