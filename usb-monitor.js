const usbDetect = require('usb-detection');
const { showWarning, logEvent } = require('./utils');

function initializeUsbMonitoring() {
    usbDetect.startMonitoring();
    setInterval(() => {
        usbDetect.find().then(devices => {
            if (devices.length > 0) {
                showWarning('External USB devices are not allowed.');
                app.quit();
            }
        }).catch(err => {
            logEvent(`Error detecting USB devices: ${err}`);
        });
    }, 5000);  // Check every 5 seconds

    logEvent('USB detection initialized.');
}

module.exports = { initializeUsbMonitoring };
