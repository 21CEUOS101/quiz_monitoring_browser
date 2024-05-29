const { BrowserWindow, dialog } = require('electron');
const path = require('path');
const { showWarning } = require('./utils');

let win;

function createWindow() {
    win = new BrowserWindow({
        fullscreen: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        },
        title : "Quiz App"
    });

    win.loadURL('http://localhost:3000/exams');

    win.webContents.on('devtools-opened', () => {
        win.webContents.closeDevTools();
        showWarning('Developer Tools are disabled.');
    });

    win.webContents.setWindowOpenHandler(() => {
        showWarning('Opening new windows or tabs is not allowed.');
        return { action: 'deny' };
    });

    win.webContents.on('context-menu', (e) => {
        e.preventDefault();
        showWarning('Right-click is disabled.');
    });

    win.webContents.on('before-input-event', (event, input) => {
        const blockedKeys = ['F12', 'Escape', 'PrintScreen', 'Insert', 'Delete', 'End', 'Home', 'PageUp', 'PageDown'];
        if (blockedKeys.includes(input.key)) {
            event.preventDefault();
            showWarning('Key combination is disabled.');
        }
    });

    win.webContents.on('will-navigate', (e, url) => {
        e.preventDefault();
        showWarning('Navigation is disabled.');
    });

    win.webContents.on('new-window', (e, url) => {
        e.preventDefault();
        showWarning('Opening new windows is disabled.');
    });

    win.on('blur', () => {
        showWarning('Switching applications is disabled.');
        win.focus();
    });

    win.on('resize', (e) => {
        e.preventDefault();
        win.setFullScreen(true);
    });

    win.on('minimize', (e) => {
        e.preventDefault();
        showWarning('Minimizing the window is disabled.');
        win.restore();
    });

    win.on('close', (e) => {
        e.preventDefault();
        const choice = dialog.showMessageBoxSync(win, {
            type: 'question',
            buttons: ['Yes', 'No'],
            title: 'Confirm',
            message: 'Are you sure you want to quit?'
        });

        if (choice === 0) {
            win.destroy();
        }
    });

    win.on('closed', () => {
        win = null;
    });
}

module.exports = { createWindow };
