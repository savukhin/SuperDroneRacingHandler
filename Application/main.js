const path = require('path')
const url = require('url')
const {app, BrowserWindow} = require('electron');
const { create } = require('domain');
//var fs = require('fs');

function getNetConnections() {

    fs.readFile('/proc/net/arp', function(err, data) {
        if (!!err) return done(err, null);

        var output = [];
        var devices = data.toString().split('\n');
        devices.splice(0,1);

        for (i = 0; i < devices.length; i++) {
            var cols = devices[i].replace(/ [ ]*/g, ' ').split(' ');

            if ((cols.length > 3) && (cols[0].length !== 0) && (cols[3].length !== 0) && cols[3] !== '00:00:00:00:00:00') {
                output.push({
                    ip: cols[0],
                    mac: cols[3]
                });
            }
        }

        console.log(output);
        return output;
    });

}


let win;

function createWindow() {
    win = new BrowserWindow({
        width: 1000, 
        height: 1000,
        //frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })

    win.loadURL(url.format({
        //pathname: path.join(__dirname, "index.html"),
        pathname: path.join(__dirname, "websocket.html"),
        protocol: 'file:',
        slashes: true
    }))

    win.webContents.openDevTools();
    win.setMenuBarVisibility(false);
    win.setMenu(null)

    win.on('closed', () => {
        win = null
    })
}

app.on('ready', createWindow)
