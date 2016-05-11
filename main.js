'use strict';

const pkg = require('./package.json')
const electron = require('electron');

// Module to control application life.
const app = electron.app;

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Modules to create menus and trays.
const Menu = electron.Menu;
const Tray = electron.Tray;
const dialog = electron.dialog

// Networking modules
const request = require('request')
const http = require('http');
const platform = require('os').platform()
const fs = require('fs')

// Eth and web3 modules
const Web3 = require('web3')

const ProviderEngine = require('web3-provider-engine')
const createPayload = require('web3-provider-engine/util/create-payload.js')
const IpcSubprovider = require('web3-provider-engine/subproviders/ipc.js')
const CacheSubprovider = require('web3-provider-engine/subproviders/cache.js')
const FixtureSubprovider = require('web3-provider-engine/subproviders/fixture.js')
const FilterSubprovider = require('web3-provider-engine/subproviders/filters.js')
const VmSubprovider = require('web3-provider-engine/subproviders/vm.js')
const HookedWalletSubprovider = require('web3-provider-engine/subproviders/hooked-wallet.js')
const NonceSubprovider = require('web3-provider-engine/subproviders/nonce-tracker.js')
const RpcSubprovider = require('web3-provider-engine/subproviders/rpc.js')



// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let appIcon;
let server;
let ethServer;
let ipfsAPIServer;
let ipfsServer;
let config;

let web3;
let engine;
//let socketPath = getIPCSocketPath();

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

function createWindow () {

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


function randomFromArray( arr) {
  return arr[ Math.floor(Math.random() * arr.length) ]
}

function createEthRPCProxy(){

  ethServer = http.createServer(function(req, res) {

    if (req.method == 'POST') {
        var body = '';
        req.on('data', function (data) { body += data; });
        req.on('end', function () {
            var data = JSON.parse(body);
            // console.log( "Incomming rpc request: ", data )
            engine.sendAsync(createPayload(data), function(err, response){
              if (err) {
                console.error( "Error proxying rpc to web3 engine: ", err )
                res.writeHead(500, {'Content-Type': 'application/json'});
              } else {
                res.writeHead(200, {'Content-Type': 'application/json'});
              }
              res.end( JSON.stringify( err || response ) );
            })
        });
    } else {
      res.writeHead(500, {'Content-Type': 'application/json'});
      res.end("Not Implemented");
    }

  });

  ethServer.listen(8545, 'localhost' );
}

function createIpfsProxy(){

  var ipfsAPIHost = randomFromArray(config.ipfs.api)
  ipfsAPIServer = http.createServer(function(req, res) {

  if (req.method == 'POST') {
      var body = '';
      req.on('data', function (data) { body += data; });
      req.on('end', function () {
          request.post( ipfsAPIHost, { body: body } ).pipe(res);
      });
    } else if (req.method == 'GET') {
      request.get(ipfsAPIHost + req.url).pipe(res);
    } else {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end("Not Implemented");
    }

  });

  ipfsAPIServer.listen(5001, 'localhost',function(){
    config.active.ipfs.api = ipfsAPIHost
  });


  var ipfsGatewayHost = randomFromArray( config.ipfs.gateway )
  ipfsServer = http.createServer(function(req, res) {

    if (req.method == 'GET') {
      request.get( ipfsGatewayHost + req.url).pipe(res )
    } else {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end("Not yet implemented");
    }

  });
 
  ipfsServer.listen(8080, 'localhost', function(){
    config.active.ipfs.gateway = ipfsGatewayHost
  });
}


function createServer (){
  server = http.createServer(function(req,res){
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify( config ) )
  })
  server.listen(8989, 'localhost')
}

function createProviderEngine(){

  var ethHost = randomFromArray(config.eth)

  engine = new ProviderEngine();

  engine.addProvider(new FixtureSubprovider({
    net_listening: true,
    eth_hashrate: '0x00',
    eth_mining: false,
    eth_syncing: true
  }))

  // cache layer
  engine.addProvider(new CacheSubprovider())

  // filters
  engine.addProvider(new FilterSubprovider())

  // pending nonce
  engine.addProvider(new NonceSubprovider())

  // vm
  engine.addProvider(new VmSubprovider())

  // Hooked wallet
  engine.addProvider(new HookedWalletSubprovider({
    getAccounts: function(cb){
      console.log('getAccounts')
      dialog.showMessageBox({
        type: "question",
        buttons: ["allow", "disallow"],
        defaultId: 1,
        cancelId: 1,
        noLink: true,
        title: "getAccounts",
        message: "A dApp is requesting accounts",
        detail: "details"
      },function(responseIndex){
        cb( null, responseIndex == 0 ? ['0xdeadbeaf'] : [] )
      })

    },
    approveTransaction: function(txParams, cb){
      console.log(approveTransaction, txParams)
      cb( null, !confirm("approveTransaction") )
    },
    signTransaction: function(txParams, cb){
      console.log(signTransaction, txParams)
      cb( null, confirm("signTransaction") )
    },
    signMessage: function(msgParams, cb){
      console.log('signMessage', msgParams)
      cb( null, confirm("signMessage") )
    }
  }))


  let rpcProvider = new RpcSubprovider({
    rpcUrl: ethHost
  })
  
  console.log(rpcProvider);

  engine.addProvider(rpcProvider)

  web3 = new Web3( engine );
  engine.start();
  config.active.eth = ethHost;

}

function init (){

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

  createProviderEngine();
  createServer();
  createEthRPCProxy();
  createIpfsProxy();
  createWindow();
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
