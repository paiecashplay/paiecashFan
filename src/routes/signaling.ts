import { Hono } from 'hono';

const app = new Hono();

// Store active connections per room
const rooms = new Map<string, Map<string, WebSocket>>();

app.get('/ws/signaling', (c) => {
  const upgradeHeader = c.req.header('Upgrade');
  if (!upgradeHeader || upgradeHeader !== 'websocket') {
    return c.text('Expected Upgrade: websocket', 426);
  }

  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  let userId: string | null = null;
  let roomId: string | null = null;
  let username: string | null = null;

  server.accept();

  server.addEventListener('message', (event) => {
    try {
      const message = JSON.parse(event.data as string);

      switch (message.type) {
        case 'join':
          // User joins a room
          userId = message.userId;
          roomId = message.roomId;
          username = message.username;

          if (!rooms.has(roomId)) {
            rooms.set(roomId, new Map());
          }

          const room = rooms.get(roomId)!;
          
          // Notify existing users
          room.forEach((ws, existingUserId) => {
            if (existingUserId !== userId) {
              ws.send(JSON.stringify({
                type: 'user-joined',
                userId: userId,
                username: username,
                roomId: roomId
              }));
            }
          });

          // Add user to room
          room.set(userId, server);

          // Send list of existing users to new user
          const existingUsers = Array.from(room.entries())
            .filter(([id]) => id !== userId)
            .map(([id, ws]) => ({ userId: id }));

          server.send(JSON.stringify({
            type: 'room-users',
            users: existingUsers
          }));

          console.log(`User ${username} joined room ${roomId}`);
          break;

        case 'offer':
        case 'answer':
        case 'ice-candidate':
          // Forward signaling messages to target user
          if (roomId && rooms.has(roomId)) {
            const room = rooms.get(roomId)!;
            const targetWs = room.get(message.targetUserId);
            
            if (targetWs) {
              targetWs.send(JSON.stringify({
                ...message,
                fromUserId: userId,
                fromUsername: username
              }));
            }
          }
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (err) {
      console.error('Error handling message:', err);
    }
  });

  server.addEventListener('close', () => {
    // Remove user from room
    if (userId && roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId)!;
      room.delete(userId);

      // Notify other users
      room.forEach((ws) => {
        ws.send(JSON.stringify({
          type: 'user-left',
          userId: userId,
          roomId: roomId
        }));
      });

      // Clean up empty rooms
      if (room.size === 0) {
        rooms.delete(roomId);
      }

      console.log(`User ${username} left room ${roomId}`);
    }
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
});

export default app;
