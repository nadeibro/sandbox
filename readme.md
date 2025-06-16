## Usage

### Start server

```bash
npm start
```

Open `http://localhost:3000` in a browser to see live logs and send events.

### Docker Compose

To run the server in Docker:

```bash
docker-compose up --build
```

The UI will be available at `http://localhost:3000` and logs will be
stored in the local `events.log` file.

### Emit from command line

The server accepts arbitrary Socket.IO events. Example:

```bash
node -e "const s=require('socket.io-client')('ws://localhost:3000',{path:'/socket/',transports:['websocket']});s.once('42room',()=>{s.emit('message',{type: info, code: 200, text: welcome, data: null});console.log('✔ sent virtual_currency_deposit');s.close();});"
```

