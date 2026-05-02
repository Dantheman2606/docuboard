// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
const http = require('http');
const { setupYjsWebSocketServer } = require('./yjs-server');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// Security & performance middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow WebSocket collaboration
  contentSecurityPolicy: false,     // Frontend handles its own CSP
}));
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/projects',      require('./routes/projects'));
app.use('/api/documents',     require('./routes/documents'));
app.use('/api/kanban',        require('./routes/kanban'));
app.use('/api/activity',      require('./routes/activity'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Docuboard API is running' });
});

// Central error handler — must be last
app.use(errorHandler);

// MongoDB + server startup
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    setupYjsWebSocketServer(server);
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔄 WebSocket server ready for real-time collaboration`);
      console.log(`🔒 JWT auth and bcrypt password hashing enabled`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
