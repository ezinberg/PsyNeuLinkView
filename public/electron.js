const electron = require('electron');
const app = electron.app;
const appPath = app.getAppPath();
const fixPath = require('fix-path');
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const isDev = require('electron-is-dev');
const {spawn, spawnSync, exec, execSync} = require('child_process');
const os = require('os');

var adjustedAppPath;
isDev ? adjustedAppPath = appPath : adjustedAppPath = path.join(appPath, '../app.asar.unpacked');
var log = require('electron-log');
const interfaces = require('../src/interfaces/interfaces').interfaces,
    interp = interfaces.interpreter;
log.transports.console.level = "debug";
//TODO: figure out way around fixPath dependency
fixPath();

//TODO: replace gRPC with gRPC-js for better compatibility with electron https://www.npmjs.com/package/@grpc/grpc-js
const windows = {};

function openLogFile(){
    exec(`open ${path.join(os.homedir(),'Library','Logs','psyneulinkview','log.log')}`)
}

function openLogFolder(){
    exec(`open ${path.join(os.homedir(),'Library','Logs','psyneulinkview')}`)
}

function createWindow(){
    var mainWindow;
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            enableRemoteModule:true,
            nodeIntegration: true,
            webSecurity: false,
            preload: path.join(isDev ? __dirname : `${adjustedAppPath}/build/`, 'preload.js')
        }
    });
    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(adjustedAppPath, 'build/index.html')}`);
    mainWindow.on('closed', () => {
            interp.killRPCServer();
            app.quit();
        }
    );
    mainWindow.on("uncaughtException", (err) => {
            electron.dialog.showErrorBox(
                'error',
                err.message
            )
        }
    );
    mainWindow.setTitle('PsyNeuLinkView');
    mainWindow.webContents.send('appPath', adjustedAppPath);
    mainWindow.webContents.session.loadExtension(path.join(os.homedir(), 'AppData/Local/Google/Chrome/User Data/Profile 1/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.10.0_0')).then(()=>{})
    windows['renderMain'] = mainWindow;
}

app.on('ready', function () {
    createWindow()
});

app.on('window-all-closed', function(){
    interp.killRPCServer();
    app.quit();
});

app.on('quit', () => {
    app.quit();
    interp.killRPCServer();
});

exports.windows = windows;
exports.appPath = adjustedAppPath;
exports.isDev = isDev;
exports.interfaces = interfaces;
exports.openLogFile = openLogFile;
exports.openLogFolder = openLogFolder;
exports.addRecentDocument = app.addRecentDocument;