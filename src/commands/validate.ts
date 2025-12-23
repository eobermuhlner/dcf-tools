import { Command } from 'commander';
import { validateDCF } from '../lib/validation';
import { findDCFFiles } from '../utils/file-discovery';
import { mergeConfig, ValidationContext } from '../config/config-loader';
import { validateMultipleFiles, aggregateValidationResults } from '../validation/validate-project';
import { validateCrossFileReferences } from '../validation/cross-file';
import { formatJsonOutput, formatTextOutput, getExitCode } from '../utils/output-formatting';
import { loadDCFDocument } from '../validation/project';

export const validateCommand = new Command('validate')
  .description('Validate DCF documents against schema and reference rules')
  .argument('<path...>', 'Path(s) to DCF document(s) to validate (files, directories, or glob patterns)')
  .option('--profile <profile>', 'Override the effective profile for all validated files (lite|standard|strict)')
  .option('--config <configFile>', 'Root configuration file providing defaults')
  .option('--capabilities <capabilities>', 'Comma-separated list of enabled capabilities (e.g., tokens,components,screens)')
  .option('--schemas <schemasDir>', 'Use a custom schema bundle instead of the built-in one')
  .option('--format <format>', 'Output format: json or text (default: text unless CI=true)', 'text')
  .option('--fail-on <level>', 'Exit with non-zero code on warn or error (default: error)', 'error')
  .option('--quiet', 'Suppress non-error output')
  .option('--no-cross', 'Disable cross-file and capability-based validation', true)
  .action(async (paths, options) => {
    try {
      // Determine output format based on options or CI environment
      let outputFormat = options.format;
      if (!options.format && process.env.CI === 'true') {
        outputFormat = 'json';
      }

      // Merge configuration from config file and CLI options
      const context: ValidationContext = await mergeConfig(
        options.config,
        options.profile,
        options.capabilities
      );

      // Apply CLI-specific overrides
      context.schemaOverride = options.schemas;
      context.disableCrossValidation = !options.cross; // Note: options.cross is true by default due to --no-cross flag

      // Find all DCF files based on the input paths
      const files = await findDCFFiles(paths);

      if (files.length === 0) {
        console.error(`No DCF files found in the specified paths: ${paths.join(', ')}`);
        process.exit(2); // Tool error
      }

      // Update context with discovered files
      context.files = files;

      // Perform multi-file validation
      let multiFileResult = await validateMultipleFiles(files, context);

      // Perform cross-file validation if not disabled
      let crossFileResult;
      if (!context.disableCrossValidation) {
        // Load all documents for cross-file validation
        const filesWithDocs = [];
        for (const file of files) {
          try {
            const document = await loadDCFDocument(file);
            filesWithDocs.push({ file, document });
          } catch (error) {
            // Add tool error for files that couldn't be loaded
            multiFileResult.errors.push({
              code: 'E_TOOL',
              message: `Failed to load file ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`,
              path: file
            });
          }
        }

        crossFileResult = await validateCrossFileReferences(
          filesWithDocs,
          context.capabilities
        );
      }

      // Aggregate results based on context settings
      multiFileResult = await aggregateValidationResults(multiFileResult, context);

      // Determine final validation status
      const hasErrors = multiFileResult.errors.length > 0 ||
                       (crossFileResult && crossFileResult.errors.length > 0);

      // Format and output the result
      if (outputFormat === 'json') {
        console.log(formatJsonOutput(multiFileResult, crossFileResult));
      } else {
        console.log(formatTextOutput(multiFileResult, crossFileResult, options.quiet));
      }

      // Determine and return the appropriate exit code
      const failOn: 'error' | 'warn' = options.failOn === 'warn' ? 'warn' : 'error';
      const exitCode = getExitCode(multiFileResult, crossFileResult, failOn);

      // Exit with appropriate code
      if (hasErrors && multiFileResult.errors.some(error => error.code.startsWith('E_TOOL'))) {
        // Tool error
        process.exit(2);
      } else {
        process.exit(exitCode);
      }
    } catch (error) {
      console.error('Tool error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(2); // Tool error
    }
  });