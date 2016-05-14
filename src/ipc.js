var net = require('net')
socketPath = '/Users/christopherdebeer/Library/Ethereum/geth.ipc'

module.exports = function(handleRequest){

  try { 
    fs.unlinkSync(socketPath);
  } catch (e) {}

  var server = net.createServer(function(socket){
    console.log("Socket request at: ", socketPath)
    socket.on('data', onData )
    
    function onData (data){
      handleRequest( data, socket );
    }

  });

  console.log( "Attaching to socket:", socketPath)
  server.listen( socketPath, function(){
    console.log( "listening to socket:", socketPath)
  });

}