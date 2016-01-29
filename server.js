var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   io = require('socket.io').listen(server)
,   redis = require('socket.io-redis')
,   conf = require('./config.json');

exports.server = server;
exports.port =  process.env.PORT || conf.defaultPort;

// deliver static files
app.use(express.static(__dirname + '/public'));

// route the / path
app.get('/', function (req, res) {
	// send the index.html in the reponse
	res.sendfile(__dirname + '/public/index.html');
});

// Redis adapter

// Under Fedora 23 you have to install redis with: dnf install redis and then start redis with redis-server
// To start redis as a service you have to uncomment "daemonize yes" in /etc/redis.conf
io.adapter(redis({ host: conf.redisUri, port: conf.redisPort }));

// Websocket

// Callback when a client connects
io.sockets.on('connection', function (socket) {
	// store the room name in the socket session for this client
	socket.room = 'defaultChannel';
	// send client to room 1
	socket.join('defaultChannel');
	// echo to client they've connected
	socket.emit('chat', { time: new Date(), text: 'You have connected to room defaultChannel on the server!' });
	// if a message is received
	socket.on('chat', function (data) {
		// the it will be send to all other clients
		socket.broadcast.in(socket.room).emit('chat', { time: new Date(), name: data.name || 'anonymous', text: data.text });
	});
	// if a client joins a channel
	socket.on('join', function (room) {
	// store the room name in the socket session for this client
	socket.room = room;
	// send client to room 1
	socket.join(room);
	console.log('Client joined room ' + room);
	});
});

run = function() {
  return server.listen(conf.defaultPort, function() {
		// log running client
		console.log('Server running under http://127.0.0.1:' + conf.defaultPort + '/');
  });
};

if (require.main === module) {
  run();
}
