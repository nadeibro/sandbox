// listener.js  ────────────────────────────────────────────────
// usage: node listener.js ws://localhost:3000 /socket/ "lang=en"
const fs = require('fs');
const path = require('path');
const io = require('socket.io-client');

const [, , URL = 'ws://45.133.216.95:3000',
    PATH = '/socket/',
    QUERY = ''] = process.argv;

const query = Object.fromEntries(new URLSearchParams(QUERY));
const socket = io(URL, {
    path: PATH,
    transports: ['websocket'],
    query,
    reconnection: true,
    reconnectionAttempts: 0,
});

const logFile = path.join(__dirname, 'events.log');
function log(dir, evt, data) {
    const row = `[${new Date().toISOString()}] ${dir} ${evt} ${JSON.stringify(data)}\n`;
    fs.appendFileSync(logFile, row);
    console.log(row.trim());
}

// ———--- входящие события ---—————————————
if (typeof socket.onAny === 'function') {               // v3/4
    socket.onAny((event, ...args) =>
        log('⬅️', event, args.length > 1 ? args : args[0]));
} else {                                                // v2.x
    const orig = socket.onevent;
    socket.onevent = function (packet) {
        const [event, ...args] = packet.data || [];
        log('⬅️', event, args.length > 1 ? args : args[0]);
        orig.call(this, packet);          // не ломаем обычные on(...)
    };
}

// ———--- исходящие события (тоже интересно) ---—————
const emit = socket.emit.bind(socket);
socket.emit = (evt, ...args) => {
    log('➡️', evt, args.length > 1 ? args : args[0]);
    return emit(evt, ...args);
};

// ———--- системные хуки ---———————————————————————
socket.on('connect', () => log('✅', 'connect', {}));
socket.on('disconnect', reason => log('❌', 'disconnect', reason));
socket.on('connect_error', err => log('⚠️', 'error', err.message));

process.on('SIGINT', () => { socket.close(); process.exit(); });
