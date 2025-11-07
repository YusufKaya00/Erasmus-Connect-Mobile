import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '@utils/logger';

interface SocketUser {
  userId: string;
  socketId: string;
}

const connectedUsers = new Map<string, string[]>(); // userId -> socketIds[]

export const setupWebSocket = (io: SocketServer) => {
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as {
        userId: string;
      };

      socket.data.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    
    logger.info(`Client connected: ${socket.id}, User: ${userId}`);

    // Track connected user
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, []);
    }
    connectedUsers.get(userId)!.push(socket.id);

    // Join user-specific room
    socket.join(`user_${userId}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);

      // Remove from connected users
      const sockets = connectedUsers.get(userId);
      if (sockets) {
        const index = sockets.indexOf(socket.id);
        if (index > -1) {
          sockets.splice(index, 1);
        }

        if (sockets.length === 0) {
          connectedUsers.delete(userId);
        }
      }
    });

    // Handle custom events
    socket.on('join_room', (room: string) => {
      socket.join(room);
      logger.info(`Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('leave_room', (room: string) => {
      socket.leave(room);
      logger.info(`Socket ${socket.id} left room: ${room}`);
    });
  });

  logger.info('✅ WebSocket server initialized');

  return io;
};

export const getIO = (io: SocketServer) => {
  return {
    // Send notification to specific user
    sendNotification: (userId: string, data: any) => {
      io.to(`user_${userId}`).emit('notification', data);
    },

    // Send match update
    sendMatchUpdate: (userId: string, data: any) => {
      io.to(`user_${userId}`).emit('match_update', data);
    },

    // Send message
    sendMessage: (userId: string, data: any) => {
      io.to(`user_${userId}`).emit('new_message', data);
    },

    // Check if user is online
    isUserOnline: (userId: string) => {
      return connectedUsers.has(userId);
    },

    // Get online users count
    getOnlineUsersCount: () => {
      return connectedUsers.size;
    },
  };
};

