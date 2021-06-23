const remote = require('electron').remote,
      electronRoot = remote.require('./electron'),
      dialog = remote.dialog;

window.dialog = dialog;
window.isDev = electronRoot.isDev;
window.getCurrentWindow = remote.getCurrentWindow;
window.electronRoot = electronRoot;
window.windows = electronRoot.windows;
window.remote = remote;
window.interfaces = electronRoot.interfaces;

window.interfaces.electron.windows = window.windows;
window.interfaces.filesystem.appPath = electronRoot.appPath;