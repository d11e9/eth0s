const net = require('net')
const request = require('request')
const fs = require('fs')


function EthIPCServer (options) {
  this.engine =  options.engine
  this.socketPath = options.socketPath

  try { 
    fs.unlinkSync(options.socketPath);
  } catch (e) {
    // Error: ENOENT no existing socket to unlink.
    if (e.code !== 'ENOENT') {
      console.error( e )
    }
  }

  let self = this;

  this.server = net.createServer(function(socket){
    if (options.verbose) console.log("Socket request at: ", options.socketPath)
    socket.on('data', onData )
    
    function onData (data){
      self.handleRequest( data, socket );
    }

  });

  this.handleRequest = function(request, socket){
    
    if (options.verbose) console.log("IPC request", request.toString('utf8'))
    var data;
    try {
      data = JSON.parse( request.toString('utf8').split('\n')[0] )
    } catch (e) {}

    if (options.verbose) console.log("IPC data:", typeof data, data )
    if (data) self.engine.sendAsync(data, function(err, response){
      if (err) {
        if (options.verbose) console.error( "Error proxying ipc to web3 engine: ", err, data, response )
        socket.write(JSON.stringify(err))
      } else {
        if (options.verbose) console.log("sending response: ", response)
        socket.write( JSON.stringify(response));
      }
    });
  }

  if (options.verbose) console.log( "Creating Eth IPC Server at socket:", options.socketPath)
  this.server.listen( options.socketPath, function(){
    if (options.verbose) console.log( "Eth IPC Server listening on socket:", options.socketPath)
  });

}


module.exports = EthIPCServer;