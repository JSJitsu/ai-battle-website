// Color formatting libraries may not be available when this script is run.
function red(text) {
  return '\x1b[31m' + text + '\x1b[0m';
}
function cyan(text) {
  return '\x1b[36m' + text + '\x1b[0m';
}
function green(text) {
  return '\x1b[32m' + text + '\x1b[0m';
}
function yellow(text) {
  return '\x1b[33m' + text + '\x1b[0m';
}

/**
 * @fileoverview Perform checks on the AMP toolchain.
 */

// If npm is being run, print a message and cause 'npm install' to fail.
function ensureYarn() {
  if (process.env.npm_execpath.indexOf('yarn') === -1) {
    console.log(
      red('*** This project uses yarn for package management ***') + '\n' +
      red('*** See https://yarnpkg.com for more information ***'),
      '\n'
    );
    console.log(yellow('To install all packages:'));
    console.log(cyan('$'), 'yarn', '\n');

    console.log(yellow('To view all available commands:'));
    console.log(cyan('$'), 'yarn run', '\n');

    console.log(yellow('Please review the README for more information!'));

    process.exit(1);
  }
}

async function main() {
  ensureYarn();
}

main();
