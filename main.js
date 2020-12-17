require('./server.js');
const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');

// development
// if (process.env.NODE_ENV === 'development') {
//     require('electron-watch')(
//         __dirname,
//         'dev',
//         path.join(__dirname, './'),
//         2000 // debounce delay
//     );
// }

ipcMain.on('close', app.quit);

let mainWindow = null;
exports.getWindow = () => mainWindow;

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 600,
        height: 180,
        'min-height': 180,
        'min-width': 600,
        frame: false,
        transparent: true,
        webPreferences: {
            nodeIntegration: true
            // preload: path.join(__dirname, './app/index.js')
        }
    });

    // and load the index.html of the app.
    mainWindow.setMenu(null);
    mainWindow.loadFile('app/index.html');
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
