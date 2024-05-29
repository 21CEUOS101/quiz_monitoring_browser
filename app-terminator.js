const { exec } = require('child_process');
const { logEvent } = require('./utils');

function checkAndTerminateApps() {
    const forbiddenApps = ['Notes', 'Calculator', 'Sketch', 'Photoshop'];

    exec('ps aux', (err, stdout, stderr) => {
        if (err || stderr) {
            logEvent(`Error fetching processes: ${err || stderr}`);
            return;
        }

        forbiddenApps.forEach(app => {
            const regex = new RegExp('\\b' + app + '\\b', 'i');
            if (regex.test(stdout)) {
                exec(`pkill -f ${app}`, (error, stdOut, stdErr) => {
                    if (error || stdErr) {
                        logEvent(`Failed to terminate ${app}: ${error || stdErr}`);
                        return;
                    }
                    logEvent(`${app} terminated successfully.`);
                });
            }
        });
    });
}

module.exports = { checkAndTerminateApps };
