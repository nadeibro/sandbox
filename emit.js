
const io = require('socket.io-client');
const [, , url, event = 'push', ...rest] = process.argv;
if (!url) return console.error('usage: node emit.js <url> <event> <json|text>');

const payload = rest.join(' ');
const socket = io(url, {
    path: '/socket/',          // поменяйте, если у вас другой path
    transports: ['websocket']
});

socket.on('connect', () => {
    try {
        socket.emit(event, JSON.parse(payload));
    } catch {
        socket.emit(event, payload);
    }
    console.log('✓ sent', event, '→', payload);
    socket.close();
});
