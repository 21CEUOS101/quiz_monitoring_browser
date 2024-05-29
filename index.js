const { app, globalShortcut, desktopCapturer, session } = require('electron');
const { createWindow } = require('./window');
const { startKeyboardMonitoring } = require('./keyboard-monitor');
const { checkAndTerminateApps } = require('./app-terminator');
const { initializeUsbMonitoring } = require('./usb-monitor');
const { showWarning } = require('./utils');
const { fetchAndStoreIP } = require('./ipConfig');
const { BrowserWindow, dialog } = require('electron');

app.on('ready', () => {
    createWindow();
    
    fetchAndStoreIP();

    globalShortcut.register('CommandOrControl+C', () => {
        showWarning('Copy action is disabled.');
    });
    globalShortcut.register('CommandOrControl+X', () => {
        showWarning('Cut action is disabled.');
    });
    globalShortcut.register('CommandOrControl+V', () => {
        showWarning('Paste action is disabled.');
    });
  
    setInterval(() => {
        desktopCapturer.getSources({ types: ['window', 'screen'] }).then(sources => {
            sources.forEach(source => {
                if (source.name.includes('Snipping Tool') || source.name.includes('Screenshot')) {
                    showWarning('Screen capture tools are not allowed.');
                    app.quit();
                }
            });
        });
    }, 1000);

    startKeyboardMonitoring();
    setInterval(checkAndTerminateApps, 5000);
    initializeUsbMonitoring();
});

app.whenReady().then(() => {
    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
        const blockedURLs = ['www.google.com', 'blockeddomain.com'];
        if (blockedURLs.some(url => details.url.includes(url))) {
            callback({ cancel: true });
        } else {
            callback({});
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
