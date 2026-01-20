// WebSocket Server for real-time features
import { WebSocketServer } from 'ws';

export default function createWebSocketServer(httpServer) {
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });

  const clients = new Set();

  wss.on('connection', (ws, req) => {
    clients.add(ws);
    console.log(`✅ WebSocket client connected. Total: ${clients.size}`);

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'WebSocket connection established',
      timestamp: new Date().toISOString()
    }));

    // Handle messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received:', data);

        // Broadcast to all clients
        clients.forEach(client => {
          if (client !== ws && client.readyState === 1) {
            client.send(JSON.stringify({
              type: 'broadcast',
              data: data,
              timestamp: new Date().toISOString()
            }));
          }
        });

        // Echo back
        ws.send(JSON.stringify({
          type: 'echo',
          data: data,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'error',
          error: 'Invalid JSON format'
        }));
      }
    });

    // Handle disconnect
    ws.on('close', () => {
      clients.delete(ws);
      console.log(`❌ WebSocket client disconnected. Total: ${clients.size}`);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Broadcast function for server-side events
  wss.broadcast = (data) => {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  };

  return wss;
}
