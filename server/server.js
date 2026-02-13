import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketServer } from 'socket.io'; // Keeping for other notifications
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import employeeRoutes from './routes/employee.js';
import holidayRoutes from './routes/holidayRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://employeemng-xokj.onrender.com/"
  ],
  credentials: true
})); app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/holidays', holidayRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.io setup (simplified: only for notifications, not group chat)
const io = new SocketServer(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// In-memory map of userId -> Set(socketId)
const onlineUsers = new Map();

import eventBus from './eventBus.js';
import { verifyToken } from './utils/jwt.js';
import User from './models/User.js';

// Socket handlers
io.on('connection', async (socket) => {
  console.log('Socket connected:', socket.id);

  // Try to authenticate socket via token (sent in handshake auth or query)
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        socket.userId = user._id.toString();
        // track socket
        const set = onlineUsers.get(socket.userId) || new Set();
        set.add(socket.id);
        onlineUsers.set(socket.userId, set);
        socket.emit('authenticated', { user: { id: user._id, name: user.name, email: user.email } });
      }
    }
  } catch (err) {
    console.warn('Socket auth failed:', err.message);
  }

  // Removed: joinGroup, leaveGroup, groupMessage handlers

  socket.on('disconnect', () => {
    // remove socket from onlineUsers
    if (socket.userId) {
      const set = onlineUsers.get(socket.userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) onlineUsers.delete(socket.userId);
      }
    }
    console.log('Socket disconnected:', socket.id);
  });
});

// Event listeners to forward notifications to relevant users via sockets

// Task assigned -> notify specific user
eventBus.on('taskAssigned', ({ task, employeeId }) => {
  try {
    const sockets = onlineUsers.get(employeeId);
    if (sockets) {
      for (const sid of sockets) {
        io.to(sid).emit('notification', { type: 'taskAssigned', payload: task });
      }
    }
  } catch (err) {
    console.error('Error notifying taskAssigned:', err);
  }
});

// Meeting created -> notify participants
eventBus.on('meetingCreated', ({ meeting, participants }) => {
  try {
    participants.forEach(pid => {
      const sockets = onlineUsers.get(pid.toString());
      if (sockets) {
        for (const sid of sockets) {
          io.to(sid).emit('notification', { type: 'meetingCreated', payload: meeting });
        }
      }
    });
  } catch (err) {
    console.error('Error notifying meetingCreated:', err);
  }
});

// Leave applied -> notify admins (include employee name for clearer notifications)
eventBus.on('leaveApplied', async ({ leaveId, employeeId, startDate, endDate, reason }) => {
  try {
    const employee = await User.findById(employeeId).select('name email');
    const admins = await User.find({ role: 'admin' }).select('_id');
    const payload = { leaveId, employeeId, employeeName: employee?.name, startDate, endDate, reason };

    admins.forEach(admin => {
      const sockets = onlineUsers.get(admin._id.toString());
      if (sockets) {
        for (const sid of sockets) {
          io.to(sid).emit('notification', { type: 'leaveApplied', payload });
        }
      }
    });
  } catch (err) {
    console.error('Error notifying leaveApplied:', err);
  }
});

// Leave decision -> notify employee (include decider name)
eventBus.on('leaveDecision', async ({ leaveId, employeeId, status, decidedBy }) => {
  try {
    const admin = await User.findById(decidedBy).select('name');
    const payload = { leaveId, status, decidedBy, decidedByName: admin?.name };
    const sockets = onlineUsers.get(employeeId.toString());
    if (sockets) {
      for (const sid of sockets) {
        io.to(sid).emit('notification', { type: 'leaveDecision', payload });
      }
    }
  } catch (err) {
    console.error('Error notifying leaveDecision:', err);
  }
});

const PORT = process.env.PORT || 5000;

// --------------------------
// DEPLOYMENT CONFIGURATION
// --------------------------
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  // Navigate up one level to root, then into client/build
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}
// --------------------------

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
