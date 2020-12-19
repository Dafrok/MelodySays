require('./server.js');
const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const { env } = require('process');

let mainWindow = null;

ipcMain.on('close', app.quit);
ipcMain.on('minimize', () => mainWindow.minimize());

exports.getWindow = () => mainWindow;

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        icon: path.resolve(__dirname, './app/bg.png'),
        width: 600,
        height: 180,
        minHeight: 180,
        maxHeight: 180,
        minWidth: 500,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        maximizable: false,
        hasShadow: false,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // and load the index.html of the app.
    mainWindow.setMenu(null);

    function openWindow() {
      mainWindow.loadFile('app/index.html');
      if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
      }
    }
    openWindow();
    ipcMain.on('re-render', openWindow);

    return mainWindow;
}

app.whenReady().then(() => {
    mainWindow = createWindow();
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            mainWindow = createWindow();
        }
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

