// scripts/generate-jwt-secret.js
import crypto from 'crypto';
import { program } from 'commander';
import clipboardy from 'clipboardy';
import chalk from 'chalk';

// Setup CLI
program
  .name('generate-jwt-secret')
  .description('Generate secure JWT secret keys with various encoding options')
  .version('1.0.0')
  .option('-b, --bytes <number>', 'Key length in bytes (default: 32)', '32')
  .option('-e, --encoding <type>', 'Output encoding (hex, base64, base64url)', 'base64url')
  .option('-c, --copy', 'Copy to clipboard automatically')
  .option('-q, --quiet', 'Suppress all output except the key')
  .parse(process.argv);

const options = program.opts();

// Validate input
const keyLength = parseInt(options.bytes);
if (isNaN(keyLength) {
  console.error(chalk.red('Error: Key length must be a number'));
  process.exit(1);
}
if (keyLength < 16) {
  console.error(chalk.red('Error: Key length must be at least 16 bytes'));
  process.exit(1);
}

// Generate key
try {
  const buffer = crypto.randomBytes(keyLength);
  let secretKey;

  switch (options.encoding) {
    case 'hex':
      secretKey = buffer.toString('hex');
      break;
    case 'base64':
      secretKey = buffer.toString('base64');
      break;
    case 'base64url':
      secretKey = buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      break;
    default:
      throw new Error('Invalid encoding type');
  }

  // Output results
  if (!options.quiet) {
    console.log(chalk.green('\n✔ Generated JWT Secret Key:'));
    console.log(chalk.yellow('='.repeat(secretKey.length + 4)));
    console.log(chalk.bold(secretKey));
    console.log(chalk.yellow('='.repeat(secretKey.length + 4)));
    
    console.log(chalk.blue(`\nDetails:
  Length: ${keyLength} bytes (${keyLength * 8} bits)
  Encoding: ${options.encoding}
  Strength: ${keyLength >= 32 ? 'Strong' : 'Acceptable'}${keyLength < 32 ? chalk.yellow(' (recommend at least 32 bytes for HS256)') : ''}`));
  } else {
    console.log(secretKey);
  }

  // Copy to clipboard if requested
  if (options.copy && !options.quiet) {
    try {
      clipboardy.writeSync(secretKey);
      console.log(chalk.green('\nKey copied to clipboard!'));
    } catch (err) {
      console.error(chalk.red('\nFailed to copy to clipboard:', err.message));
    }
  }

  // Add security reminder
  if (!options.quiet) {
    console.log(chalk.redBright('\n⚠ Security Reminder:'));
    console.log(chalk.whiteBright('- Store this securely in your environment variables'));
    console.log(chalk.whiteBright('- Never commit secrets to version control'));
    console.log(chalk.whiteBright('- Regenerate if compromised\n'));
  }

} catch (error) {
  console.error(chalk.red('Error generating key:', error.message));
  process.exit(1);
}