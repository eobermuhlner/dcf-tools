import { Command } from 'commander';
import { version } from '../package.json';
import { validateCommand } from './commands/validate';
import { normalizeCommand } from './commands/normalize';
import { inspectCommand } from './commands/inspect';
import { lintCommand } from './commands/lint';

const program = new Command();

program
  .name('dcf')
  .description('Command-line tools for Data Contract Framework (DCF)')
  .version(version);

// Register placeholder commands
program.addCommand(validateCommand);
program.addCommand(normalizeCommand);
program.addCommand(inspectCommand);
program.addCommand(lintCommand);

program.parse();