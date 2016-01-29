var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   io = require('socket.io').listen(server)
,   redisStore = require('redis')
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

// Redis store
var store = redisStore.createClient(conf.redisPort, conf.redisUri);

// Redis adapter
var adapter = io.adapter(redis({ host: conf.redisUri, port: conf.redisPort }));

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
	// send chanel history to the client
	store.lrange(socket.room, 0, 10, function(err, messages) {
		var i = messages.length;
		if (i > 0) {
			socket.emit('chat', { time: new Date(), text: 'Some of the last messages on the channel:' });
		}
		// loop backwards through the messages to retain the order
		while (i--) {
			socket.emit('chat', JSON.parse(messages[i]));
		}
		socket.emit('chat', { time: new Date(), text: '----------------------------------------' });
	});
	socket.on('chat', function (data) {
		var message = { time: new Date(), name: data.name || 'anonymous', text: data.text };
		// the message will be send to all other clients
		socket.broadcast.in(socket.room).emit('chat', message);
		// the message will be stored in the redis stire
		store.lpush(socket.room , JSON.stringify(message)); // push into redis
	});
	// if a client joins a channel
	socket.on('join', function (room) {
		// store the room name in the socket session for this client
		socket.room = room;
		// send client to room 1
		socket.join(room);
		// send chanel history to the client
		store.lrange(socket.room, 0, 10, function(err, messages) {
			var i = messages.length;
			if (i > 0) {
				socket.emit('chat', { time: new Date(), text: 'Some of the last messages on the channel:' });
			}
			// loop backwards through the messages to retain the order
			while (i--) {
				socket.emit('chat', JSON.parse(messages[i]));
			}
			socket.emit('chat', { time: new Date(), text: '----------------------------------------' });
		});
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
