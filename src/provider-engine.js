
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


function Web3ProviderEngine(options){

  this.engine = new ProviderEngine();

  this.engine.addProvider(new FixtureSubprovider({
    net_listening: true,
    eth_hashrate: '0x00',
    eth_mining: false,
    eth_syncing: false
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
    getAccounts: function(cb){
      console.log('getAccounts')
      // dialog.showMessageBox({
      //   type: "question",
      //   buttons: ["allow", "disallow"],
      //   defaultId: 1,
      //   cancelId: 1,
      //   noLink: true,
      //   title: "getAccounts",
      //   message: "A dApp is requesting accounts",
      //   detail: "details"
      // },function(responseIndex){
      //   cb( null, responseIndex == 0 ? ['0xdeadbeaf'] : [] )
      // })
      cb( null, ['0x7906edf7472852066e5101e8638f25c4da023fc2'])

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
    rpcUrl: options.rpc
  })
  
  if (options.verbose) console.log("Creating Web3 Provider Engine connecting to: ", options.rpc);

  this.engine.addProvider(rpcProvider)

  this.web3 = new Web3( this.engine );
  this.engine.start();

}


module.exports = Web3ProviderEngine;