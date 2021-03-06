const net = require('net')
const request = require('request')
const fs = require('fs')
const path = require('path')
const web3 = require('web3')

const createPayload = require('web3-provider-engine/util/create-payload.js')


function EthIPCServer (options) {
  this.engine =  options.engine
  this.socketPath = options.socketPath

  try { 
    fs.unlinkSync(options.socketPath);
  } catch (e) {
    // Error: ENOENT no existing socket to unlink.
    if (e.code == 'ENOENT') {

    } else {
      console.error( e )
    }
  }

  let self = this;

  this.server = net.createServer(function(socket){
    if (options.verbose) console.log("Socket connection at: ", options.socketPath)
    
    socket.on('data', function (data){
      self.handleRequest( data.toString('utf8'), function(err, result){
        try{
          socket.write(result)
        } catch(e) {
          console.error(e)
        }
      })
    })
  });

  this.handleRequest = function(request, callback){
    
    if (options.verbose) console.log("IPC Request: ", request )

    try {
      requests = web3.providers.IpcProvider.prototype._parseResponse(request);
    } catch(err){
      console.error("Error parsing request (err, request)")
      console.error(err, request)
      return;
    }

    


    for (var r=0; r < requests.length; r++) {
      try {
        payload = createPayload( requests[r] )
      } catch (err) {
        console.error("Error creating payload from parsed request (err, requests)")
        console.error(err, requests[r])
      }
      
      if (options.verbose) console.log("Payload: ", payload )
      self.engine.sendAsync(payload, function(err, response){
        if (err) {
          if (options.verbose) console.error( "Error proxying ipc to web3 engine: ", err, request, response )
          request.error = err;
          callback(err, request)
        } else {
          if (options.verbose) console.log("Sending response: ", response, requests)
          callback( null,  JSON.stringify(response));
        }
      });  
    }


    
  }

  if (process.platform === 'win32') {
    options.socketPath = path.join('\\\\?\\pipe', options.socketPath )
  }

  if (options.verbose) console.log( "Creating Eth IPC Server at socket:", options.socketPath)
  this.server.listen( options.socketPath, function(){
    if (options.verbose) console.log( "Eth IPC Server listening on socket:", options.socketPath, arguments)
  });

}


module.exports = EthIPCServer;