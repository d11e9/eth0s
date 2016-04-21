'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
// Modules to create menus and trays.
const Menu = electron.Menu;
const Tray = electron.Tray;

const http = require('http');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let appIcon;
let server;

function createWindow () {

  appIcon = new Tray('src/client/images/icon.png');
  var contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' }
  ]);
  appIcon.setToolTip('Welcome to the Future - Eth0s');
  appIcon.setContextMenu(contextMenu);


  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 370,
    height: 528,
    'min-width': 370,
    'min-height': 528,
    frame: true,
    closable: true,
    show: true,
    preload: __dirname + '/src/client/js/inject.js'
  });

  appIcon.on('click', function(){
    if (mainWindow.isVisible()){
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });


  server = http.createServer(function(req, res) {
    // You can respond with a status `500` if you want to indicate that something went wrong 
    res.writeHead(200, {'Content-Type': 'application/json'});
    // data passed to `electronWorkers.execute` will be available in req body 
    // req.pipe(res);
    res.end("ok")
  });
 
  server.listen(8545, 'localhost');
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
