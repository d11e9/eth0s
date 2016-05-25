const electron = require('electron');
const dialog = electron.dialog

// Eth and web3 modules
const Web3 = require('web3')

const lightwallet = require('eth-lightwallet')

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


function Web3ProviderEngine(options){

  this.engine = new ProviderEngine();

  this.engine.addProvider(new FixtureSubprovider({
    net_listening: true,
    eth_hashrate: '0x00',
    eth_mining: false,
    eth_syncing: false,
    net_peerCount: 1
  }))

  // cache layer
  this.engine.addProvider(new CacheSubprovider())

  // filters
  this.engine.addProvider(new FilterSubprovider())

  // pending nonce
  this.engine.addProvider(new NonceSubprovider())

  // vm
  // engine.addProvider(new VmSubprovider())

  // Hooked wallet
  this.engine.addProvider(new HookedWalletSubprovider({
    transaction_signer: lightwallet.keystore,
    getAccounts: function(cb){
      console.log('getAccounts')
      cb( null, ['0x7906edf7472852066e5101e8638f25c4da023fc2', '0xea674fdde714fd979de3edf0f56aa9716b898ec8'])
    },
    approveTransaction: function(txParams, cb){
      console.log(approveTransaction, txParams)
      dialog.showMessageBox({
        type: "question",
        buttons: ["allow", "disallow"],
        defaultId: 1,
        cancelId: 1,
        noLink: true,
        title: "approveTransaction",
        message: "A dApp is attempting to have a transaction approved",
        detail: "details..."
      },function(responseIndex){
        cb( null, responseIndex == 0 ? true : false )
      })
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
    rpcUrl: options.rpc
  })
  
  if (options.verbose) console.log("Creating Web3 Provider Engine connecting to: ", options.rpc);

  this.engine.addProvider(rpcProvider)

  this.web3 = new Web3( this.engine );
  this.engine.start();

}


module.exports = Web3ProviderEngine;