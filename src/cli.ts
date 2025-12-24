import { Command } from 'commander';
import { version } from '../package.json';
import { validateCommand } from './commands/validate';
import { normalizeCommand } from './commands/normalize';
import { inspectCommand } from './commands/inspect';
import { lintCommand } from './commands/lint';

const program = new Command();

program
  .name('dcf')
  .description('Command-line tools for Design Concept Format (DCF)')
  .version(version);

// Register commands
program.addCommand(validateCommand);
program.addCommand(normalizeCommand);
program.addCommand(inspectCommand);
program.addCommand(lintCommand);

// Add preview command with lazy loading
program
  .command('preview')
  .description('Start a local web server to preview DCF documents')
  .argument('[path...]', 'Paths to DCF documents to preview (files, directories, or glob patterns)')
  .option('--port <port>', 'Port to run the preview server on', '3000')
  .option('--host <host>', 'Host to bind the server to', 'localhost')
  .option('--open', 'Open the preview in the default browser', false)
  .option('--static <dir>', 'Export static HTML/CSS/JS previews to directory')
  .option('--snapshot <dir>', 'Generate preview snapshots to directory')
  .option('--profile <profile>', 'Validation and normalization profile (lite|standard|strict)', 'standard')
  .option('--capabilities <capabilities>', 'Explicitly declare expected DCF layers')
  .option('--theme <name>', 'Select specific theme variant')
  .option('--locale <locale>', 'Choose i18n locale for preview')
  .option('--renderer <renderer>', 'Preview renderer backend (web|native|custom)', 'web')
  .option('--allow-invalid', 'Attempt preview even if validation errors are present', false)
  .option('--quiet', 'Suppress non-error output', false)
  .action(async (paths, options) => {
    // Dynamically import the preview functionality when needed
    const { startPreviewServer } = await import('./lib/preview/preview-server.js');

    try {
      const port = parseInt(options.port, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        console.error('Error: Port must be a valid number between 1 and 65535');
        process.exit(2);
      }

      // Validate profile option
      const validProfiles = ['lite', 'standard', 'strict'];
      if (!validProfiles.includes(options.profile)) {
        console.error(`Error: Profile must be one of: ${validProfiles.join(', ')}`);
        process.exit(2);
      }

      // Validate renderer option
      const validRenderers = ['web', 'native', 'custom'];
      if (!validRenderers.includes(options.renderer)) {
        console.error(`Error: Renderer must be one of: ${validRenderers.join(', ')}`);
        process.exit(2);
      }

      // If no paths provided, show error
      if (!paths || paths.length === 0) {
        console.error('Error: At least one path must be provided');
        process.exit(2);
      }

      await startPreviewServer(paths, {
        port,
        host: options.host,
        open: options.open,
        staticDir: options.static,
        snapshotDir: options.snapshot,
        profile: options.profile,
        capabilities: options.capabilities,
        theme: options.theme,
        locale: options.locale,
        renderer: options.renderer,
        allowInvalid: options.allowInvalid,
        quiet: options.quiet
      });
    } catch (error) {
      console.error('Tool error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(2); // Tool error
    }
  });

program.parse();