const socket = io({path:'/socket/'});
const logEl = document.getElementById('log');

socket.on('log', line => {
  logEl.textContent += line + '\n';
  logEl.scrollTop = logEl.scrollHeight;
});

document.getElementById('emitForm').addEventListener('submit', e => {
  e.preventDefault();
  const event = document.getElementById('eventName').value;
  const payloadText = document.getElementById('eventPayload').value;
  let payload;
  try { payload = JSON.parse(payloadText); } catch { payload = payloadText; }
  socket.emit('sendEvent', {event, payload});
  document.getElementById('eventPayload').value = '';
});
