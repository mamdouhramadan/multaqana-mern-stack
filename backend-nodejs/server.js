/**
 * Main entry: Express app + Socket.io.
 * Flow: load env → connect DB → middleware (helmet, cors, body limit, rate limit, static) →
 * Socket.io attach → API routes → doc routes → 404 catch-all → global error handler →
 * listen on DB ready. Graceful shutdown on SIGTERM/SIGINT.
 */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('colors');
const connectDB = require('./config/dbConn');
const corsOptions = require('./config/corsOptions');
const logger = require('./config/logger');

dotenv.config();

// Fail fast if required env vars are missing (skip in test — tests use in-memory DB and may set env in setup)
if (process.env.NODE_ENV !== 'test') {
  const requiredEnv = ['MONGO_URI', 'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET'];
  const missing = requiredEnv.filter(key => !process.env[key]);
  if (missing.length) {
    logger.error('Missing required environment variables: %s', missing.join(', '));
    process.exit(1);
  }
}

// Connect to Database
connectDB();

const app = express();

// Security and body parsing
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// NoSQL injection prevention: sanitize req.body for all routes (update/create)
const { sanitizeBody } = require('./middleware/sanitizeInput');
app.use(sanitizeBody);

// Rate limiting: auth uses stricter limiters (see config/rateLimiters.js); general auth path gets login limiter
const { authLimiter } = require('./config/rateLimiters');
app.use('/api/auth', authLimiter);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests; please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', apiLimiter);

app.use(express.static(path.join(__dirname, 'public')));

// Port
const PORT = process.env.PORT || 5000;

// Create HTTP Server for Socket.io
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
  }
});

// Socket.io JWT authentication: verify token before allowing connection
const jwt = require('jsonwebtoken');
io.use((socket, next) => {
  if (process.env.NODE_ENV === 'test') return next();
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return next(new Error('Invalid or expired token'));
    socket.userId = decoded.UserInfo?.id?.toString();
    socket.username = decoded.UserInfo?.username;
    next();
  });
});

// Track which socket belongs to which user (for online status)
// When a socket joins with join_room(userId), we record it; on disconnect we remove.
const socketToUserId = new Map();
io.socketToUserId = socketToUserId;

// Socket.io Connection Logic
io.on('connection', (socket) => {
  const userId = socket.userId;
  if (userId) {
    socket.join(userId);
    socketToUserId.set(socket.id, userId);
    logger.info('Socket connected: %s (user: %s)', socket.id, userId);
  }

  // Join user room (optional: client can re-join; we already joined above using JWT userId)
  socket.on('join_room', (id) => {
    const roomId = id || userId;
    if (roomId && roomId === userId) {
      socket.join(roomId);
      socketToUserId.set(socket.id, roomId);
      logger.debug('User joined room: %s', roomId);
    }
  });

  // Chat Events
  socket.on('join_chat', (conversationId) => {
    if (conversationId) {
      socket.join(conversationId);
      logger.debug('Joined chat: %s', conversationId);
    }
  });

  socket.on('leave_chat', (conversationId) => {
    if (conversationId) socket.leave(conversationId);
  });

  socket.on('typing', ({ conversationId, username }) => {
    if (conversationId && userId) {
      socket.to(conversationId).emit('typing', { userId, username: username || socket.username });
    }
  });

  socket.on('stop_typing', ({ conversationId }) => {
    if (conversationId && userId) {
      socket.to(conversationId).emit('stop_typing', { userId });
    }
  });

  // Send Message Event: use socket.userId (authenticated), ignore client senderId
  socket.on('send_message', async ({ conversationId, content, attachments }) => {
    try {
      if (!userId) return socket.emit('error', { message: 'Unauthorized' });
      if (!conversationId) {
        return socket.emit('error', { message: 'Missing required fields' });
      }
      if (!content && (!attachments || attachments.length === 0)) {
        return socket.emit('error', { message: 'Message content or attachment required' });
      }

      const Message = require('./models/Message');
      const Conversation = require('./models/Conversation');
      const User = require('./models/User');

      // 1. Create Message in DB (sender = authenticated user)
      const newMessage = await Message.create({
        conversationId,
        sender: userId,
        content: content || '',
        attachments: attachments || []
      });

      // 2. Update Conversation (lastMessage) & Increment Unread Counts
      const conversation = await Conversation.findById(conversationId);
      if (conversation) {
        conversation.lastMessage = newMessage._id;
        conversation.lastMessageAt = Date.now();

        // Increment unread for all *other* participants
        conversation.participants.forEach(pId => {
          if (pId.toString() !== userId) {
            const currentCount = conversation.unreadCounts.get(pId.toString()) || 0;
            conversation.unreadCounts.set(pId.toString(), currentCount + 1);
          }
        });
        await conversation.save();
      }

      // 3. Populate sender info for real-time display
      await newMessage.populate('sender', 'username image');

      // 4. Emit to Chat Room (for active viewers)
      io.to(conversationId).emit('receive_message', newMessage);

      // 5. Push Notification Logic (Global Notification)
      // Check mute status for recipients
      if (conversation) {
        for (const participantId of conversation.participants) {
          if (participantId.toString() !== userId) {
            const recipient = await User.findById(participantId);

            // Only send notification if NOT muted
            if (recipient && !recipient.mutedUsers.includes(userId)) {
              io.to(participantId.toString()).emit('notification', {
                type: 'chat_message',
                message: `New message from ${newMessage.sender.username}`,
                data: { conversationId, messageId: newMessage._id }
              });
            }
          }
        }
      }

    } catch (error) {
      logger.error('Socket message error: %s', error.message);
      socket.emit('error', { message: 'Message failed to send' });
    }
  });

  // Reaction Event: use socket.userId (authenticated)
  socket.on('add_reaction', async ({ messageId, emoji }) => {
    try {
      if (!userId) return socket.emit('error', { message: 'Unauthorized' });
      const Message = require('./models/Message');
      const message = await Message.findById(messageId);
      if (message) {
        // Remove existing reaction by this user if any, and add new one
        const existingIndex = message.reactions.findIndex(r => r.user.toString() === userId);

        if (existingIndex > -1) {
          if (message.reactions[existingIndex].emoji === emoji) {
            // If same emoji, remove it (toggle off)
            message.reactions.splice(existingIndex, 1);
          } else {
            // Update emoji
            message.reactions[existingIndex].emoji = emoji;
          }
        } else {
          message.reactions.push({ user: userId, emoji });
        }

        await message.save();

        // Emit update to everyone in the conversation
        io.to(message.conversationId.toString()).emit('message_reaction_update', {
          messageId,
          reactions: message.reactions
        });
      }
    } catch (err) {
      logger.error('Reaction error: %s', err.message);
    }
  });

  socket.on('disconnect', () => {
    socketToUserId.delete(socket.id);
    logger.debug('Socket disconnected: %s', socket.id);
  });
});

// Attach io to request object (Accessible in Controllers)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Search route: register first so GET /api/search always exists (inline fallback if controller fails to load)
app.get('/api/search', (req, res, next) => {
  try {
    const searchController = require('./controllers/searchController');
    return searchController.search(req, res, next);
  } catch (err) {
    logger.warn('Search controller load failed: %s', err.message);
    return res.status(200).json({ success: true, code: 200, message: 'Search unavailable', data: [] });
  }
});
app.get('/search', (req, res, next) => {
  try {
    const searchController = require('./controllers/searchController');
    return searchController.search(req, res, next);
  } catch (err) {
    logger.warn('Search controller load failed: %s', err.message);
    return res.status(200).json({ success: true, code: 200, message: 'Search unavailable', data: [] });
  }
});

// Routes
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/magazines', require('./routes/magazineRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/positions', require('./routes/positionRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/videos', require('./routes/videoRoutes'));
app.use('/api/albums', require('./routes/photoAlbumRoutes'));
app.use('/api/faqs', require('./routes/faqRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/holidays', require('./routes/holidayRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));     // NEW
app.use('/api/notifications', require('./routes/notificationRoutes')); // NEW
app.use('/api/chat', require('./routes/chatRoutes')); // NEW
app.use('/api/roles', require('./routes/roleRoutes'));

// Documentation and home routes (must be before 404 catch-all so they can match)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.get('/auth-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'auth.html'));
});
app.get('/content-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'content-docs.html'));
});
app.get('/media-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'media-docs.html'));
});
app.get('/structure-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'structure-docs.html'));
});
app.get('/hr-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'hr-docs.html'));
});
app.get('/permissions', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'permissions.html'));
});
app.get('/settings-notifications-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'settings-notifications-docs.html'));
});

// Health check for load balancers and monitoring
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
  res.status(200).json({
    status: dbState === 1 ? 'ok' : 'degraded',
    timestamp: Date.now(),
    uptime: process.uptime(),
    database: dbStatus
  });
});

// 404 catch-all: unmatched routes get a consistent JSON error via central error handler
const AppError = require('./utils/appError');
app.use((req, res, next) => {
  next(new AppError('Route not found', 404));
});

// Global Error Handler (must be last)
app.use(require('./middleware/errorHandler'));


// Listen
mongoose.connection.once('open', () => {
  logger.info('MongoDB connected');
  // Only listen if not in test mode or if run directly
  if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
      logger.info('Server running in %s mode on port %s', process.env.NODE_ENV, PORT);

      // Graceful shutdown: allow in-flight requests to finish, then close DB and exit
      const shutdown = (signal) => {
        logger.info('%s received; closing server and database', signal);
        server.close(() => {
          mongoose.connection.close(false).then(() => {
            logger.info('Database connection closed');
            process.exit(0);
          }).catch((err) => {
            logger.error('Error closing database: %s', err.message);
            process.exit(1);
          });
        });
        const forceExit = setTimeout(() => {
          logger.error('Forced exit after 10s');
          process.exit(1);
        }, 10000);
        forceExit.unref();
      };
      process.on('SIGTERM', () => shutdown('SIGTERM'));
      process.on('SIGINT', () => shutdown('SIGINT'));
    });
  }
});

module.exports = server; // Export server instead of app for testing with sockets if needed

mongoose.connection.on('error', (err) => {
  logger.error('DB connection error: %s', err.message);
});
