
const electron = require('electron')
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

function createWindow (mainWindow) {

  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    return;
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 350,
    height: 480,
    minWidth: 350,
    minHeight: 450,
    frame: true,
    closable: true,
    show: true,
    webPrefernces: {
      preload: __dirname + '/client/js/inject.js'
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/../index.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  return mainWindow;
}


module.exports = createWindow;