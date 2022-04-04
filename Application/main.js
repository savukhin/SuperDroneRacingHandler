const path = require('path')
const url = require('url')
const { app, BrowserWindow } = require('electron');

let win


function createWindow() {
    win = new BrowserWindow({
        width: 1000,
        height: 1000,
        minWidth: 800,
        minHeight: 400,
        frame: false,
        backgroundColor: '#FFF',
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
        }
    })

    win.loadURL(url.format({
        pathname: path.join(__dirname, "websocket.html"),
        protocol: 'file:',
        slashes: true
    }))

    win.webContents.openDevTools();
    win.setMenuBarVisibility(false);
    win.setMenu(null)

    require('@electron/remote/main').initialize()
    require("@electron/remote/main").enable(win.webContents)

    win.on('closed', () => {
        win = null
    })
}

app.on('ready', () => {
    createWindow()
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
