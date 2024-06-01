const { dialog } = require('electron');
const fs = require('fs').promises;
const path = require('path');

const logFile = path.join(__dirname, 'activity.log');

async function showWarning(message) {
    await logEvent(message);
    dialog.showMessageBox({
        type: 'warning',
        buttons: ['OK'],
        defaultId: 0,
        title: 'Warning',
        message: message,
    }).then(() => {}).catch(error => {
        console.error('Error showing warning:', error);
    });
}

async function logEvent(message) {
    try {
        const timestamp = new Date().toISOString();
        await fs.appendFile(logFile, `[${timestamp}] ${message}\n`);
    } catch (error) {
        console.error('Error logging event:', error);
    }
}

module.exports = { showWarning, logEvent };
