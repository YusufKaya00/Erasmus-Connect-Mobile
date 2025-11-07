import express, { Application, Request, Response } from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';
import passport from 'passport';
import { initializePassport } from '@shared/config/passport';

// Load environment variables
dotenv.config();

// Initialize Passport
initializePassport();

// Import routes
import authRoutes from '@modules/auth/auth.routes';
import profileRoutes from '@modules/profile/profile.routes';
import countryRoutes from '@modules/country/country.routes';
import postRoutes from '@modules/post/post.routes';
import categoryRoutes from '@modules/category/category.routes';
import matchRoutes from '@modules/match/match.routes';
import likeRoutes from '@modules/like/like.routes';
import notificationRoutes from '@modules/notification/notification.routes';
// Stats moved to admin module
import routeRoutes from '@modules/route/route.routes';
import adminRoutes from '@modules/admin/admin.routes';

// Import middleware
import { errorHandler } from '@middleware/error-handler';
import { notFound } from '@middleware/not-found';
import { rateLimiter } from '@middleware/rate-limiter';
import { setupWebSocket } from '@shared/websocket/socket-handler';
import logger from '@shared/utils/logger';

// Create Express app
const app: Application = express();
const httpServer = createServer(app);

// Setup Socket.IO
const io = new SocketServer(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:3002',
      'http://localhost:3004',
      'http://localhost:5173',
      process.env.CORS_ORIGIN || 'http://localhost:3000'
    ],
    credentials: true,
  },
});

setupWebSocket(io);

// Rate limiting - daha agresif
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs (düşürüldü)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Başarılı istekleri sayma
});

// Admin rate limiting (çok daha kısıtlayıcı)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs for admin (düşürüldü)
  message: 'Too many admin requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3004',
    'http://localhost:5173',
    process.env.CORS_ORIGIN || 'http://localhost:3000'
  ],
  credentials: true,
}));
app.use(compression());
app.use(limiter); // Apply rate limiting to all routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(passport.initialize());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
  }));
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
const apiPrefix = process.env.API_PREFIX || '/api/v1';

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/profiles`, profileRoutes);
app.use(`${apiPrefix}/countries`, countryRoutes);
app.use(`${apiPrefix}/posts`, postRoutes);
app.use(`${apiPrefix}/categories`, categoryRoutes);
app.use(`${apiPrefix}/matches`, rateLimiter, matchRoutes);
app.use(`${apiPrefix}/likes`, rateLimiter, likeRoutes);
app.use(`${apiPrefix}/notifications`, notificationRoutes);
// Stats moved to admin routes
app.use(`${apiPrefix}/routes`, routeRoutes);

// Admin Routes (Protected)
app.use(`${apiPrefix}/admin`, adminLimiter, adminRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🌐 API URL: http://localhost:${PORT}${apiPrefix}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export { app, io };

