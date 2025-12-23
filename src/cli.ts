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
  .argument('<file>', 'Path to DCF document to preview')
  .option('--port <port>', 'Port to run the preview server on', '3000')
  .option('--host <host>', 'Host to bind the server to', 'localhost')
  .option('--open', 'Open the preview in the default browser', false)
  .action(async (file, options) => {
    // Dynamically import the preview functionality when needed
    const { startPreviewServer } = await import('./lib/preview/preview-server.js');

    try {
      const port = parseInt(options.port, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        console.error('Error: Port must be a valid number between 1 and 65535');
        process.exit(2);
      }

      await startPreviewServer(file, {
        port,
        host: options.host,
        open: options.open
      });
    } catch (error) {
      console.error('Tool error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(2); // Tool error
    }
  });

program.parse();