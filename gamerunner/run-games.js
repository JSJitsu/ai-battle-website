let LiveGameRunner = require('./game_logic/LiveGameRunner.js');
let gameRunner = new LiveGameRunner();

let cliOpts = require('minimist')(process.argv.slice(2));

if (!cliOpts['skip-fetch']) {
    let path = require('path');
    let childProcess = require('child_process');

    let scriptPath = path.resolve(__dirname, 'user_code', 'get-user-code-from-github.js');

    childProcess.execSync(`node ${scriptPath}`, {
        stdio: 'inherit'
    });
}

gameRunner.run();