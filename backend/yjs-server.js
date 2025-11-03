// yjs-server.js
const { WebSocketServer } = require('ws');

// Store for document rooms (documentId -> Set of connections)
const documentRooms = new Map();

// Store for user info per connection
const connectionUsers = new Map();

// Generate colors for users
const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
];

function getUserColor(userId) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Setup WebSocket server for real-time collaboration
 * @param {import('http').Server} server - HTTP server instance
 */
function setupYjsWebSocketServer(server) {
  const wss = new WebSocketServer({ 
    noServer: true,
    path: '/collab'
  });

  // Handle WebSocket upgrade requests
  server.on('upgrade', (request, socket, head) => {
    const pathname = request.url;
    
    if (pathname.startsWith('/collab')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws) => {
    let currentDocumentId = null;
    let currentUserId = null;
    let currentUserName = null;

    console.log('� New WebSocket connection');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'join') {
          currentDocumentId = data.documentId;
          currentUserId = data.userId;
          currentUserName = data.userName;

          // Add to document room
          if (!documentRooms.has(currentDocumentId)) {
            documentRooms.set(currentDocumentId, new Set());
          }
          documentRooms.get(currentDocumentId).add(ws);

          // Store user info
          connectionUsers.set(ws, {
            userId: currentUserId,
            userName: currentUserName,
            color: getUserColor(currentUserId),
            documentId: currentDocumentId,
          });

          console.log(`👤 User "${currentUserName}" joined document: ${currentDocumentId}`);

          // Broadcast updated user list to all users in this document
          broadcastUserList(currentDocumentId);
        } else if (data.type === 'content-update' && currentDocumentId) {
          // Broadcast content update to all other users in the same document
          const room = documentRooms.get(currentDocumentId);
          if (room) {
            room.forEach((client) => {
              if (client !== ws && client.readyState === 1) {
                client.send(JSON.stringify({
                  type: 'content-update',
                  content: data.content,
                  userId: currentUserId,
                  userName: currentUserName,
                  documentId: currentDocumentId,
                }));
              }
            });
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    ws.on('close', () => {
      if (currentDocumentId && currentUserId) {
        console.log(`👋 User "${currentUserName}" left document: ${currentDocumentId}`);

        // Remove from document room
        const room = documentRooms.get(currentDocumentId);
        if (room) {
          room.delete(ws);
          if (room.size === 0) {
            documentRooms.delete(currentDocumentId);
          }
        }

        // Remove user info
        connectionUsers.delete(ws);

        // Broadcast updated user list
        broadcastUserList(currentDocumentId);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  function broadcastUserList(documentId) {
    const room = documentRooms.get(documentId);
    if (!room) return;

    // Use a Map to deduplicate users by userId
    const uniqueUsers = new Map();
    room.forEach((client) => {
      const userInfo = connectionUsers.get(client);
      if (userInfo) {
        // Only keep one entry per userId
        uniqueUsers.set(userInfo.userId, {
          userId: userInfo.userId,
          userName: userInfo.userName,
          color: userInfo.color,
        });
      }
    });

    const users = Array.from(uniqueUsers.values());

    const message = JSON.stringify({
      type: 'users',
      users: users,
    });

    room.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }

  console.log('🔄 Real-time collaboration WebSocket server initialized');
  return wss;
}

module.exports = { setupYjsWebSocketServer };
