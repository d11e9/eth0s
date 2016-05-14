const http = require('http')
const createPayload = require('web3-provider-engine/util/create-payload.js')

function EthRPCProxy(options){

  if (options.verbose) console.log("Creating Eth RPC Proxy" )
  this.server = http.createServer(function(req, res) {
    if (req.method == 'POST') {
        var body = '';
        req.on('data', function (data) { body += data; });
        req.on('end', function () {
            var data = JSON.parse(body);
            // console.log( "Incomming rpc request: ", data )
            options.engine.sendAsync(createPayload(data), function(err, response){
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

  this.server.listen(options.port, 'localhost',function(){
    if (options.verbose) console.log("Eth RPC Proxy running on localhost:" + options.port)
  });
}


module.exports = EthRPCProxy;