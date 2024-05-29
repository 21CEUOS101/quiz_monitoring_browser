// preload.js
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
  disableClipboard: () => {
    document.addEventListener('copy', (event) => {
      event.preventDefault();
    });
    document.addEventListener('cut', (event) => {
      event.preventDefault();
    });
    document.addEventListener('paste', (event) => {
      event.preventDefault();
    });
  },
  disablePrint: () => {
    window.print = () => {
      console.log('Print function disabled');
    };
  }
});
