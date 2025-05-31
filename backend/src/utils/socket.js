const jwt = require('jsonwebtoken');

module.exports = (io) => {
  // Store active users
  const activeUsers = new Map();

  io.use((socket, next) => {
    try {
      // Authenticate user using JWT token
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { 
        id: decoded.id, 
        role: decoded.role,
        name: decoded.name
      };
      next();
    } catch (error) {
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Add user to active users
    activeUsers.set(socket.user.id, {
      socketId: socket.id,
      userId: socket.user.id,
      role: socket.user.role,
      name: socket.user.name
    });

    // Broadcast online status
    io.emit('userStatus', Array.from(activeUsers.values()));

    // Join personal room for direct messages
    socket.join(socket.user.id);

    // Handle private messages
    socket.on('sendMessage', async (data) => {
      const { recipientId, message, messageType } = data;
      
      try {
        // Emit to recipient if online
        io.to(recipientId).emit('newMessage', {
          senderId: socket.user.id,
          senderName: socket.user.name,
          message,
          messageType,
          timestamp: new Date()
        });

        // Emit back to sender (for confirmation)
        socket.emit('messageSent', {
          recipientId,
          message,
          messageType,
          timestamp: new Date()
        });
      } catch (error) {
        socket.emit('messageError', { error: error.message });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { recipientId, isTyping } = data;
      io.to(recipientId).emit('userTyping', {
        userId: socket.user.id,
        userName: socket.user.name,
        isTyping
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      activeUsers.delete(socket.user.id);
      io.emit('userStatus', Array.from(activeUsers.values()));
    });
  });
}; 