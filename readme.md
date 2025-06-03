## Usage

### Start server

```bash
npm start
```

Open `http://localhost:3000` in a browser to see live logs and send events.

### Emit from command line

The server accepts arbitrary Socket.IO events. Example:

```bash
node -e "const s=require('socket.io-client')('ws://localhost:3000',{path:'/socket/',transports:['websocket']});s.once('connect',()=>{s.emit('virtual_currency_deposit',[{currency:'BRN',amount:150,alias:'promo_bonus'}]);console.log('✔ sent virtual_currency_deposit');s.close();});"
```

