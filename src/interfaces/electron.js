class ElectronInterface {
    windows = {};

    sendMessage(channel, message){
        var mainWindow = this.windows.renderMain;
        mainWindow.webContents.send(channel, message)
    }
}

exports.electronInterface = new ElectronInterface();