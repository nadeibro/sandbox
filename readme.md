how to emit ? 

node -e "const s=require('socket.io-client')(
  'ws://localhost:3000',
  {path:'/socket/',transports:['websocket']}
);s.once('connect',()=>{s.emit('virtual_currency_deposit',[{currency:'BRN',amount:150,alias:'promo_bonus'}]);console.log('✔ sent virtual_currency_deposit');s.close();});"

