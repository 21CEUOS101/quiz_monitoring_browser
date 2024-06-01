const { exec } = require('child_process');
const { logEvent } = require('./utils');

function checkAndTerminateApps() {
    const forbiddenApps = [
        'Notes', 
        'Calculator', 
        'Sketch', 
        'Photoshop',
        'TeamViewer',
        'AnyDesk',
        'Zoom',
        'Skype',
        'Discord',
        'WhatsApp',
        'Telegram',
        'Slack',
        // Add more forbidden apps relevant to your proctoring system
    ];    

    exec('ps aux', (err, stdout, stderr) => {
        if (err) {
            logEvent(`Error fetching processes: ${err.message}`);
            return;
        }
        if (stderr) {
            logEvent(`Standard error fetching processes: ${stderr}`);
            return;
        }

        forbiddenApps.forEach(app => {
            const regex = new RegExp(`\\b${app}\\b`, 'i');
            if (regex.test(stdout)) {
                exec(`pkill -f ${app}`, (error, stdOut, stdErr) => {
                    if (error) {
                        logEvent(`Failed to terminate ${app}: ${error.message}`);
                        return;
                    }
                    if (stdErr) {
                        logEvent(`Standard error terminating ${app}: ${stdErr}`);
                        return;
                    }
                    logEvent(`${app} terminated successfully.`);
                });
            }
        });
    });
}

module.exports = { checkAndTerminateApps };
