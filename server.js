var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   socketServer  = require('./lib/vws.socket.js').server
,   conf = require('./config.json');

exports.server = server;
exports.port =  process.env.PORT || conf.defaultPort;

// deliver static files
app.use(express.static(__dirname + '/public'));

// route the / path
app.get('/', function (req, res) {
	// send the index.html in the reponse
	res.sendfile(__dirname + '/public/client.html');
});

// Websocket

var websocketConfig ={
	port		: conf.webSocketPort
};

//  stores connections/clients
var clients = {};

socketServer( 'testServer1', function ( connection, webSocketServer ) {

  connection.on('open', function (id) {
    console.log('[open] - client connected, connection-id: %s', id);

    // store the connections/clients id
    clients[id] = 'connected';
    console.log('All clients', clients);
  });

  connection.on('message', function ( msg ) {
    console.log('[message] - received message', msg);
    //console.log(msg);
    var message = JSON.parse(msg.utf8Data);

    // send the mesage to all connections except the one it cames from
    if (connection.id in clients){
      var otherClients = clients;
      delete otherClients[connection.id];

			//console.log('Availible connections', clients);
      //console.log('Other clients', otherClients);
      // convert to array
      otherClients = Object.keys(otherClients);
      if (otherClients !== undefined || otherClients.length != 0) {
        connection.send(JSON.stringify(message.action), otherClients );
        console.log('Sending ', message.action, ' to other clients ', otherClients);
      }
    }
  });

  connection.on('error', function ( err ) {
    console.log(err);
  });

  connection.on('close', function(id){
    //console.log('[close]');
    console.log('[close] - client disconnected, connection-id: %s', connection.id);
    if (connection.id in clients){
      // store the connections/clients id
      delete clients[connection.id];
      var connections = Object.keys(clients);
    }
  });

}).config( websocketConfig );



run = function() {
	return server.listen(conf.defaultPort, function() {
		// log running client
		console.log('Server running under http://127.0.0.1:' + conf.defaultPort + '/');
	});
};

if (require.main === module) {
	run();
}
