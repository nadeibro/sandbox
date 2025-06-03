// mock-http.js
const http = require('http');
const socketio = require('socket.io');   // v2.5.1

// ─── создаём HTTP-сервер
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK — WebSocket ожидает на /socket/');
});

// ─── вешаем Socket.IO на тот же сервер
const io = socketio(server, {
    path: '/socket/',          // ← ровно как у прод-сервера
    cors: { origin: '*' }
});

// логируем все события клиента
io.on('connection', socket => {
    console.log('🔗', socket.id, 'connect', socket.handshake.query);  // { lang: 'en' }

    // пример исходящего события
    socket.emit('push', { title: 'mock http', body: 'handshake success' });

    socket.use(([evt, data], next) => {
        console.log('💬  IN ', evt, data);
        next();
    });
});

// ─── запускаемся
const PORT = 3000;
server.listen(PORT, () =>
    console.log(`🛰  HTTP-mock up → ws://<IP-Mac>:${PORT}/socket/?lang=en`)
);
