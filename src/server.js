const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const courseRoutes = require('./routes/course');
// const moduleRoutes = require('./routes/moduleRoutes');
// const quizRoutes = require('./routes/course/quiz');

// Import database connection
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Test database connection
connectDB();

// ✅ Enable CORS (allow frontend origin)
app.use(
  cors({
    origin: [
      'http://localhost:5173', // Vite default
      'http://localhost:5174', // sometimes Vite uses another port
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ✅ Middleware
app.use(express.json());

// ✅ Simple request logger
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/course', courseRoutes);
// app.use('/api/module', moduleRoutes);
// app.use('/api/quiz', quizRoutes);

// ✅ Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Brainwave API is running',
  });
});

// ✅ Error handling
app.use((error, req, res, next) => {
  console.error('❌ Error:', error.stack || error.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ✅ 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
});

module.exports = app;
