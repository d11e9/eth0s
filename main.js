'use strict';

const platform = require('os').platform()
const request = require('request')
const http = require('http');
const pkg = require('./package.json')
const fs = require('fs')

// Utils
const utils = require('./src/utils.js');

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
let config;

config = {
  active: {
    eth: null,
    ipfs: {
      api: null,
      gateway: null
    }
  },
  eth: [
    'https://eth.turkd.net' //,
    //'https://testrpc.metamask.io'
  ],
  ipfs: {
    gateway: ['http://gateway.ipfs.io'],
    api: ['https://ipfs.turkd.net']
  },
  pkg: pkg
}

function randomFromArray( arr) {
  return arr[ Math.floor(Math.random() * arr.length) ]
}

function init (){
  

  let providerEngine = new ProviderEngine({
    verbose: true,
    rpc: randomFromArray( config.eth )
  })

  let ethRpcProxy = new EthRPCProxy({
    verbose: true,
    engine: providerEngine.engine,
    port: 8545
  })

  let ipfsProxy = new IpfsProxy({
    verbose: true,
    api: randomFromArray( config.ipfs.api ),
    gateway: randomFromArray( config.ipfs.gateway )
  })

  let ethIpcServer = new EthIPCServer({
    verbose: true,
    socketPath: utils.getEthereumDataDir() + "/geth.ipc",
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

app.on('error', function(err){
  console.log( "App Error: ", err)
})
