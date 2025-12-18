// server.js
const WebSocket = require('ws');

const PORT = 3000;
const server = new WebSocket.Server({ port: PORT });

// всі клієнти та їх id
let nextClientId = 1;
const clients = new Map(); // ws -> { id }

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const [client] of clients.entries()) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

server.on('connection', (ws) => {
  const clientId = nextClientId++;
  clients.set(ws, { id: clientId });

  console.log(`Користувач #${clientId} приєднався`);
  // повідомлення про приєднання
  broadcast({
    type: 'system',
    text: `Користувач #${clientId} приєднався до чату`,
  });

  ws.on('message', (messageBuffer) => {
    const text = messageBuffer.toString();
    console.log(`Повідомлення від #${clientId}:`, text);
   
    server.on('error', (err) => {
  console.error('Помилка сервера WebSocket:', err.message);
   });

    ws.on('error', (err) => {
  console.error('Помилка WebSocket з’єднання:', err.message);
  });


    // повідомлення в чат
    broadcast({
      type: 'chat',
      from: `Користувач #${clientId}`,
      text,
      time: new Date().toISOString(),
    });
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`Користувач #${clientId} від’єднався`);

    // повідомлення про вихід
    broadcast({
      type: 'system',
      text: `Користувач #${clientId} залишив чат`,
    });
  });

  ws.on('error', (err) => {
    console.error('Помилка WebSocket з’єднання:', err.message);
  });
});

console.log(`Сервер чату запущено на ws://localhost:${PORT}`);
