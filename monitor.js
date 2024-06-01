const usbDetect = require('usb-detection');
const { exec } = require('child_process');
const os = require('os');
const si = require('systeminformation');
const { showWarning, logEvent } = require('./utils');
const { app } = require('electron');


// List of known inbuilt microphone devices (names can vary by manufacturer and model)
const inbuiltMicrophones = [
    'Microphone Array (Realtek(R) Audio)',
    'Internal Microphone (Conexant SmartAudio HD)',
    'Internal Microphone (Realtek High Definition Audio)',
    'Headset Microphone (Realtek(R) Audio)',
    'MacBook Air Microphone',
    'MacBook Air Speakers',
    'Microphone Array (Intel Smart Sound Technology for Digital Microphones)',
    'Internal Microphone (Cirrus Logic CS8409)',
    'Microphone Array (Synaptics Audio)',
    'Microphone (Synaptics HD Audio)',
    'Microphone Array (Intel SST)',
    'Built-in Microphone (Apple)',
    'Built-in Microphone (MacBook Pro)',
    'Built-in Microphone (MacBook)',
    'Microphone Array (Dell Audio)',
    'Microphone Array (Lenovo ThinkPad)',
    'Microphone Array (HP Audio)',
    'Internal Microphone (Dell Inspiron)',
    'Internal Microphone (HP Spectre)',
    'Internal Microphone (Lenovo Yoga)',
    'Microphone Array (Acer Realtek)',
    'Microphone Array (Asus SonicMaster)',
    'Microphone Array (MSI Audio)',
    'Microphone Array (Toshiba Audio)',
    'Microphone Array (Samsung Audio)',
    'Microphone Array (LG Gram)',
    'Built-in Microphone (Google Pixelbook)',
    'Built-in Microphone (Chromebook)',
    // Add other known inbuilt microphones here
];


async function initializeMonitoring() {
    usbDetect.startMonitoring();
    await logEvent('USB detection initialized.');

    setInterval(() => {
        checkUSBDevices();
        detectDisplays();
        detectNetworkInterfaces();
        detectAudioDevices();
        detectBluetoothDevices();
        detectSuspiciousProcesses();
        detectVirtualMachine();
    }, 5000);  // Check every 5 seconds
}

function checkUSBDevices() {
    usbDetect.find()
        .then(async devices => {
            if (devices.length > 0) {
                await showWarning('External USB devices are not allowed.');
                app.quit();
            }
        })
        .catch(err => {
            logEvent(`Error detecting USB devices: ${err}`);
        });
}

function detectDisplays() {
    if (os.platform() === 'win32') {
        // Windows
        exec('wmic path win32_videocontroller get caption', (error, stdout, stderr) => {
            if (error) {
                logEvent(`exec error: ${error}`);
                return;
            }
            if (stderr) {
                logEvent(`stderr: ${stderr}`);
                return;
            }
            
            // Parse the stdout to detect HDMI/VGA
            const displays = stdout.split('\n').slice(1).map(line => line.trim()).filter(line => line);
            displays.forEach(display => {
                logEvent(`Display detected: ${display}`);
                if (display.toLowerCase().includes('hdmi') || display.toLowerCase().includes('vga')) {
                    showWarning('HDMI/VGA displays are not allowed.');
                    app.quit();
                }
            });
        });
    } else if (os.platform() === 'darwin') {
        // macOS
        exec('system_profiler SPDisplaysDataType', (error, stdout, stderr) => {
            if (error) {
                logEvent(`exec error: ${error}`);
                return;
            }
            if (stderr) {
                logEvent(`stderr: ${stderr}`);
                return;
            }
            
            // Parse the stdout to detect HDMI/VGA
            const displays = stdout.split('Display').slice(1).map(line => line.trim()).filter(line => line);
            displays.forEach(display => {
                logEvent(`Display detected: ${display}`);
                if (display.toLowerCase().includes('hdmi') || display.toLowerCase().includes('vga')) {
                    showWarning('HDMI/VGA displays are not allowed.');
                    app.quit();
                }
            });
        });
    } else {
        // Linux and other platforms
        exec('xrandr', (error, stdout, stderr) => {
            if (error) {
                logEvent(`exec error: ${error}`);
                return;
            }
            if (stderr) {
                logEvent(`stderr: ${stderr}`);
                return;
            }
            
            // Parse the stdout to detect HDMI/VGA
            const displays = stdout.split('\n').filter(line => line.includes(' connected')).map(line => line.trim().split(' ')[0]);
            displays.forEach(display => {
                logEvent(`Display detected: ${display}`);
                if (display.toLowerCase().includes('hdmi') || display.toLowerCase().includes('vga')) {
                    showWarning('HDMI/VGA displays are not allowed.');
                    app.quit();
                }
            });
        });
    }
}


function detectNetworkInterfaces() {
    const networkInterfaces = os.networkInterfaces();
    Object.keys(networkInterfaces).forEach(interfaceName => {
        networkInterfaces[interfaceName].forEach(interface => {
            if (interface.family === 'IPv4' && !interface.internal) {
                logEvent(`Network interface detected: ${interfaceName} - ${interface.address}`);
                if (interfaceName.toLowerCase().includes('ethernet') || interfaceName.toLowerCase().includes('wifi')) {
                    showWarning('Specific network interfaces are not allowed.');
                    app.quit();
                }
            }
        });
    });
}

function detectAudioDevices() {
    si.audio().then(data => {
        logEvent(`All audio devices: ${data.map(device => device.name).join(', ')}`);
        const externalDevices = data.filter(device => !inbuiltMicrophones.includes(device.name));
        if (externalDevices.length > 0) {
            logEvent(`External audio devices detected: ${externalDevices.map(device => device.name).join(', ')}`);
            showWarning('External audio devices are not allowed.');
            app.quit();
        }
    }).catch(err => {
        logEvent(`Error detecting audio devices: ${err}`);
    });
}


function detectBluetoothDevices() {
    if (os.platform() === 'win32') {
        // Windows
        exec('powershell "Get-PnpDevice -Class Bluetooth -Status OK"', (error, stdout, stderr) => {
            if (error) {
                logEvent(`exec error: ${error}`);
                return;
            }
            if (stderr) {
                logEvent(`stderr: ${stderr}`);
                return;
            }

            const devices = stdout.split('\n').slice(1).map(line => line.trim()).filter(line => line);
            if (devices.length > 0) {
                logEvent(`Bluetooth devices detected: ${devices.join(', ')}`);
                showWarning('Bluetooth devices are not allowed.');
                app.quit();
            }
        });
    } else if (os.platform() === 'darwin') {
        // macOS
        exec('system_profiler SPBluetoothDataType', (error, stdout, stderr) => {
            if (error) {
                logEvent(`exec error: ${error}`);
                return;
            }
            if (stderr) {
                logEvent(`stderr: ${stderr}`);
                return;
            }

            const devices = stdout.split('\n').filter(line => line.includes('Connected: Yes'));
            if (devices.length > 0) {
                logEvent(`Bluetooth devices detected: ${devices.join(', ')}`);
                showWarning('Bluetooth devices are not allowed.');
                app.quit();
            }
        });
    } else {
        // Linux and other platforms
        logEvent('Bluetooth detection is not supported on this platform.');
    }
}

function detectSuspiciousProcesses() {
    const suspiciousProcesses = ['TeamViewer', 'AnyDesk', 'Zoom', 'Skype', 'OBS', 'Wirecast', 'XSplit']; // Add any suspicious process names here
    if (os.platform() === 'win32') {
        // Windows
        exec('tasklist', (error, stdout, stderr) => {
            if (error) {
                logEvent(`exec error: ${error}`);
                return;
            }
            if (stderr) {
                logEvent(`stderr: ${stderr}`);
                return;
            }

            const runningProcesses = stdout.split('\n').slice(3).map(line => line.trim().split(/\s+/)[0]);
            runningProcesses.forEach(process => {
                if (suspiciousProcesses.includes(process)) {
                    logEvent(`Suspicious process detected: ${process}`);
                    showWarning(`Suspicious process detected: ${process}.`);
                    app.quit();
                }
            });
        });
    } else if (os.platform() === 'darwin') {
        // macOS
        exec('ps aux', (error, stdout, stderr) => {
            if (error) {
                logEvent(`exec error: ${error}`);
                return;
            }
            if (stderr) {
                logEvent(`stderr: ${stderr}`);
                return;
            }

            const runningProcesses = stdout.split('\n').map(line => line.trim().split(/\s+/)[10]);
            runningProcesses.forEach(process => {
                if (suspiciousProcesses.includes(process)) {
                    logEvent(`Suspicious process detected: ${process}`);
                    showWarning(`Suspicious process detected: ${process}.`);
                    app.quit();
                }
            });
        });
    } else {
        // Linux and other platforms
        exec('ps -A', (error, stdout, stderr) => {
            if (error) {
                logEvent(`exec error: ${error}`);
                return;
            }
            if (stderr) {
                logEvent(`stderr: ${stderr}`);
                return;
            }

            const runningProcesses = stdout.split('\n').map(line => line.trim().split(/\s+/)[0]);
            runningProcesses.forEach(process => {
                if (suspiciousProcesses.includes(process)) {
                    logEvent(`Suspicious process detected: ${process}`);
                    showWarning(`Suspicious process detected: ${process}.`);
                    app.quit();
                }
            });
        });
    }
}

function detectVirtualMachine() {
    const vmIndicators = [
        'VBoxService',    // VirtualBox
        'vmtoolsd',       // VMware
        'vboxguest',      // VirtualBox guest additions
        'vboxsf',         // VirtualBox shared folders
        'VBoxTray',       // VirtualBox tray service
        'vmwareuser',     // VMware user agent
        'vmacthlp',       // VMware activation helper
        'vmusrvc',        // VMware user service
        'vmmemctl',       // VMware memory control driver
        'qemu-ga',        // QEMU guest agent
        // Add more VM-related services/processes as needed
    ];

    exec('ps aux', (err, stdout, stderr) => {
        if (err) {
            logEvent(`Error fetching processes for VM detection: ${err.message}`);
            return;
        }
        if (stderr) {
            logEvent(`Standard error fetching processes for VM detection: ${stderr}`);
            return;
        }

        const isVMDetected = vmIndicators.some(indicator => new RegExp(`\\b${indicator}\\b`, 'i').test(stdout));
        if (isVMDetected) {
            showWarning('Virtual machine detected. Please use a physical machine to take the exam.');
            logEvent('Virtual machine detected. Examination halted.');
            app.quit();
        } else {
            logEvent('No virtual machine detected.');
        }
    });

    // Additional VM detection via hardware inspection
    si.system((data) => {
        const manufacturer = data.manufacturer.toLowerCase();
        const model = data.model.toLowerCase();
        if (
            manufacturer.includes('vmware') ||
            manufacturer.includes('virtualbox') ||
            manufacturer.includes('qemu') ||
            manufacturer.includes('parallels') ||
            model.includes('vmware') ||
            model.includes('virtualbox') ||
            model.includes('qemu') ||
            model.includes('parallels')
        ) {
            showWarning('Virtual machine detected based on hardware inspection. Please use a physical machine to take the exam.');
            logEvent('Virtual machine detected based on hardware inspection. Examination halted.');
            app.quit();
        } else {
            logEvent('No virtual machine detected based on hardware inspection.');
        }
    });
}

module.exports = { initializeMonitoring };
