

debugger

var ZeroClientProvider = require('./ZeroClientProvider.js');
var Web3 = require('../../../node_modules/web3');

// create engine
var engine = ZeroClientProvider({
	rpcUrl: 'https://testrpc.metamask.io/',
})

// log new blocks
engine.on('block', function(block){
	console.log('BLOCK CHANGED:', '#'+block.number.toString('hex'), '0x'+block.hash.toString('hex'))
})

global.web3 = new Web3(engine);
