const http = require('http');
const fs = require('fs');
const path = require('path');
const util = require('util');
const socketio = require('socket.io');

const logFile = fs.createWriteStream(path.join(__dirname, 'events.log'), { flags: 'a' });
let io;
const origLog = console.log;
console.log = (...args) => {
  const msg = util.format(...args);
  origLog(msg);
  logFile.write(`[${new Date().toISOString()}] ${msg}\n`);
  if (io) io.emit('log', msg);
};

const server = http.createServer((req, res) => {
  let file = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(__dirname, 'public', file);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    const ext = path.extname(filePath);
    const types = {'.html':'text/html','.css':'text/css','.js':'text/javascript'};
    res.writeHead(200, {'Content-Type': types[ext] || 'text/plain'});
    res.end(data);
  });
});

io = socketio(server, { path: '/socket/' });

io.on('connection', socket => {
  console.log('Client connected', socket.id);

  socket.on('sendEvent', ({event, payload}) => {
    console.log('Received event from UI:', event, payload);
    io.emit(event, payload);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
