const { dialog } = require('electron');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'activity.log');

function showWarning(message) {
    logEvent(message);
    dialog.showMessageBoxSync({
        type: 'warning',
        buttons: ['OK'],
        defaultId: 0,
        title: 'Warning',
        message: message,
    });
}

function logEvent(message) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}

module.exports = { showWarning, logEvent };
