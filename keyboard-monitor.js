const { exec } = require('child_process');
const { showWarning } = require('./utils');

async function startKeyboardMonitoring() {
    const isRunning = await isKeyloggerRunning();
    if (isRunning) {
        showWarning('Keylogging software detected. Suspicious activity detected.');
    }
}

function isKeyloggerRunning() {
    return new Promise((resolve, reject) => {
        if (process.platform === 'win32') {
            exec('tasklist', (err, stdout, stderr) => {
                if (err || stderr) {
                    reject(err || stderr);
                    return;
                }
                const keyloggers = ['logkeys', 'keylogger', 'keystroke'];
                resolve(keyloggers.some(keyword => stdout.toLowerCase().includes(keyword.toLowerCase())));
            });
        } else if (process.platform === 'darwin') {
            exec('ps aux', (err, stdout, stderr) => {
                if (err || stderr) {
                    reject(err || stderr);
                    return;
                }
                const keyloggers = ['logkeys', 'keylogger', 'keystroke'];
                resolve(keyloggers.some(keyword => stdout.toLowerCase().includes(keyword.toLowerCase())));
            });
        } else {
            resolve(false);
        }
    });
}

module.exports = { startKeyboardMonitoring };
