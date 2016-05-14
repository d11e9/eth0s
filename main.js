'use strict';

const platform = require('os').platform()
const request = require('request')
const http = require('http');
const fs = require('fs')

const pkg = require('./package.json')
const utils = require('./src/utils.js')
const config = require('./config.json')

config.pkg = pkg

const electron = require('electron');
const app = electron.app; // Module to control application life.

// Ethos proxy servers and providers
const EthIPCServer = require('./src/ethipcserver.js')
const IpfsProxy = require('./src/ipfsproxy.js')
const EthRPCProxy = require('./src/ethrpcproxy.js')
const ProviderEngine = require('./src/provider-engine.js')

const createTray = require('./src/create-tray.js')
const createWindow = require('./src/create-window.js')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let tray;
let server;



function randomFromArray( arr) {
  return arr[ Math.floor(Math.random() * arr.length) ]
}

function init (){

  config.active.eth.ipc = utils.getEthereumDataDir() + "/geth.ipc"
  config.active.eth.rpc = randomFromArray( config.eth.rpc )

  config.active.ipfs.api = randomFromArray( config.ipfs.api )
  config.active.ipfs.gateway = randomFromArray( config.ipfs.gateway )

  

  let providerEngine = new ProviderEngine({
    verbose: true,
    rpc: config.active.eth.rpc
  })

  let ethRpcProxy = new EthRPCProxy({
    verbose: true,
    engine: providerEngine.engine,
    port: 8545
  })

  let ipfsProxy = new IpfsProxy({
    verbose: true,
    api: config.active.ipfs.api,
    gateway: config.active.ipfs.gateway
  })

  let ethIpcServer = new EthIPCServer({
    verbose: true,
    socketPath: config.active.eth.ipc,
    engine: providerEngine.engine
  })

  mainWindow = createWindow();

  tray = createTray({
    mainWindow: mainWindow,
    createWindow: createWindow
  })

  server = http.createServer(function(req,res){
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify( config ) )
  })

  server.listen(8989, 'localhost')


}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', init);

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
