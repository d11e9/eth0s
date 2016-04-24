'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
// Modules to create menus and trays.
const Menu = electron.Menu;
const Tray = electron.Tray;
const dialog = electron.dialog

const request = require('request')
const http = require('http');
const platform = require('os').platform();  
const fs = require('fs')


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let appIcon;
let server;
let ethServer;
let ipfsAPIServer;
let ipfsServer;

function createWindow () {

  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    return;
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 350,
    height: 450,
    minWidth: 350,
    minHeight: 450,
    frame: true,
    closable: true,
    show: true,
    webPrefernces: {
      preload: __dirname + '/src/client/js/inject.js'
    }
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

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}


function createEthRPCProxy(){
  var whitelist = ["eth_getBlockByNumber"]

  ethServer = http.createServer(function(req, res) {   

    if (req.method == 'POST') {
        var body = '';
        req.on('data', function (data) { body += data; });
        req.on('end', function () {
            var data = JSON.parse(body);
            request.post( 'https://eth.turkd.net', { body: body } ).pipe(res);
        });
    } else {
      res.writeHead(500, {'Content-Type': 'application/json'});
      res.end("Not Implemented");
    }

  });
 
  ethServer.listen(8545, 'localhost');
}

function createIpfsRPCProxy(){
  ipfsAPIServer = http.createServer(function(req, res) {

    if (req.method == 'POST') {
        var body = '';
        req.on('data', function (data) { body += data; });
        req.on('end', function () {
            request.post( 'https://ifps.turkd.net', { body: body } ).pipe(res);
        });
    } else if (req.method == 'GET') {
      request.get('https://ipfs.turkd.net' + req.url).pipe(res )
    } else {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end("Not yet implemented");
    }

  });
  ipfsAPIServer.listen(5001, 'localhost');


  ipfsServer = http.createServer(function(req, res) {

    if (req.method == 'GET') {
      request.get('https://gateway.ipfs.io' + req.url).pipe(res )
    } else {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end("Not yet implemented");
    }

  });
 
  ipfsServer.listen(8080, 'localhost');
}




// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function(){
  if (platform === 'darwin') {
    appIcon = new Tray(__dirname + '/src/client/images/iconTemplate@2x.png');
  } else {
    appIcon = new Tray(__dirname + '/src/client/images/icon.png');
  }
  var contextMenu = Menu.buildFromTemplate([
    { label: 'About',
      click: createWindow },
    { label: 'Debug',
      click: function(){
        // Open the DevTools.
        createWindow()
        mainWindow.toggleDevTools();
      }},
    { label: 'Quit',
      accelerator: 'Command+Q',
      click: app.quit }
  ]);
  appIcon.setToolTip('Welcome to the Future - Eth0s');
  appIcon.setContextMenu(contextMenu);

  createEthRPCProxy();
  createIpfsRPCProxy();

  server = http.createServer(function(req, res) {
    console.log( req.url )
    if (req.url === '/') fs.createReadStream(__dirname + '/index.html' ).pipe( res )
    else if (req.url.indexOf('/src') === 0 || req.url.indexOf('/node_modules') === 0) fs.createReadStream(__dirname + req.url ).pipe( res )
    else {
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.end("Bad Request");
    }
  })

  server.listen( 8989, 'localhost' )
  createWindow();

});

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
