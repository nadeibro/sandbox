/* eslint-disable no-console */
const http = require('http');
const fs = require('fs');
const path = require('path');
const util = require('util');
const socketio = require('socket.io');

// ─── Настройки ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3999;
const STATIC_DIR = path.join(__dirname, 'public');
const LOG_PATH = path.join(__dirname, 'events.log');
const GLOBAL_ROOM = '42room';

// ─── Логирование (stdout + файл + стрим в UI) ───────────────────────────────
const logFile = fs.createWriteStream(LOG_PATH, { flags: 'a' });
function log(...args) {
  const msg = util.format(...args);
  const time = new Date().toISOString();
  console._orig(msg);                       // в терминал
  logFile.write(`[${time}] ${msg}\n`);      // в файл
  if (io) io.emit('log', msg);              // в UI через сокет
}
console._orig = console.log;
console.log = log;

// ─── HTTP-сервер (простейшая раздача статики) ───────────────────────────────
const server = http.createServer((req, res) => {
  if (req.url.startsWith('/socket/')) return; // Socket.IO сам обработает

  const filePath = path.join(STATIC_DIR, req.url === '/' ? 'index.html' : req.url);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404); return res.end('Not found');
    }
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[path.extname(filePath)]
      || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

// ─── Socket.IO (всё в одном namespace) ───────────────────────────────────────
const io = socketio(server, {
  path: '/socket',
  pingInterval: 25_000,       // соответствует handshake из прод-трейса
  pingTimeout: 5_000,
  transports: ['websocket', 'polling'] // handshake покажет "upgrades"
});

io.on('connection', socket => {
  log('[connect]', socket.id);

  // ― клиент присылает авторизацию → подписываем его на комнату
  socket.on('ws:account/subscribe', ({ authorization }) => {
    log('[subscribe]', socket.id, authorization ?? '(no auth)');
    socket.join(GLOBAL_ROOM);

    // welcome-сообщение можно убрать при необходимости
    io.to(GLOBAL_ROOM).emit('message', { type: 'info', code: 200, text: 'welcome' });


  });


  // ― UI-панель отдаёт произвольный event/payload
  socket.on('sendEvent', ({ event, payload }) => {
    if (!event) return;
    log('[UI] → broadcast', event, payload);
    io.to(GLOBAL_ROOM).emit(event, payload);

  });

  socket.on('disconnect', reason => log('[disconnect]', socket.id, reason));
});

// ─── Старт ───────────────────────────────────────────────────────────────────
server.listen(PORT, () => log(`Server listening on http://localhost:${PORT}`));



// {type: 'info', code: 200, text: 'welcome', data: null}