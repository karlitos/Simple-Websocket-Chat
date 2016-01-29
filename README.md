# Simple, Node.js websocket-based chat.
The client and some logic is heavily inspired by the tutorial: http://nodecode.de/chat-nodejs-websocket.

### Install
```bash
npm install
```

### To run one instance
```bash
npm run app
```

### To run more than one instance
```bash
npm run cluster
```
_(The cluster run with some debug mode enabled so it is possible to watch some workers spawn and)_

## Redis

The code depends on __redis db__. On Fedora 23 you can install __redis__ using: _dnf install redis_ and then start redis with redis-server.  To start redis as a service you have to uncomment "daemonize yes" in _/etc/redis.conf_.
