const request = require('request')
const http = require('http')

function IpfsProxy(options){

  var ipfsAPIHost = options.api
  var ipfsGatewayHost = options.gateway
  
  if (options.verbose) console.log("Creating IPFS API Proxy to: " + ipfsAPIHost)
  this.ipfsAPIServer = http.createServer(function(req, res) {

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

  this.ipfsAPIServer.listen(5001, 'localhost',function(){
    if ( options.verbose ) console.log("IPFS API Proxy running at localhost:5001")
  });

  
  if (options.verbose) console.log("Creating IPFS Gateway Proxy to: " + ipfsGatewayHost)
  this.ipfsGatewayServer = http.createServer(function(req, res) {

    if (req.method == 'GET') {
      request.get( ipfsGatewayHost + req.url).pipe(res )
    } else {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end("Not yet implemented");
    }

  });
 
  this.ipfsGatewayServer.listen(8080, 'localhost', function(){
    if ( options.verbose ) console.log("IPFS Gateway Proxy running at localhost:8080")
  });
}

module.exports = IpfsProxy;