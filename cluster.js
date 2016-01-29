var sticky = require('sticky-session')
, ref = require('./server')
, server = ref.server
, port = ref.port;

if (!sticky.listen(server, port)) {
  server.once('listening', function() {
    return console.log('Master started');
  });
} else {
  console.log('Worker');
}
