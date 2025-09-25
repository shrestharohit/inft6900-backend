const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const courseRoutes = require('./routes/course/courseRoutes');
const moduleRoutes = require('./routes/course/moduleRoutes');
const contentRoutes = require('./routes/course/contentRoutes');
const quizRoutes = require('./routes/course/quiz/quizRoutes');
const questionRoutes = require('./routes/course/quiz/questionRoutes');
const optionRoutes = require('./routes/course/quiz/optionRoutes');

const enrolmentRoutes = require('./routes/enrolmentRoutes');

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

// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 15 * 60 * 1000, // 15 minutes
    httpOnly: true,
    secure: false // set true if HTTPS
  }
}));

// ✅ Simple request logger
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.use('/api/course', courseRoutes);
app.use('/api/module', moduleRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/question', questionRoutes);
app.use('/api/option', optionRoutes);

app.use('/api/enrolment', enrolmentRoutes);

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
