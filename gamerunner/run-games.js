const LiveGameRunner = require('./game_logic/LiveGameRunner.js');
const gameRunner = new LiveGameRunner();

const cliOpts = require('minimist')(process.argv.slice(2));

if (!cliOpts['skip-fetch']) {
    const path = require('path');
    const childProcess = require('child_process');

    const scriptPath = path.resolve(__dirname, 'user_code', 'get-user-code-from-github.js');

    childProcess.execSync(`node ${scriptPath}`, {
        stdio: 'inherit'
    });
}

gameRunner.run();