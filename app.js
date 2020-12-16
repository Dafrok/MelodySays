require('electron').ipcRenderer.on('record', (event, message) => {
  document.write(message);
});