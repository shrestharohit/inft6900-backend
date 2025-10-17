const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path')

require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const contentRoutes = require('./routes/course/contentRoutes');
const pathwayRoutes = require('./routes/pathwayRoutes');
const moduleAccessRoutes = require('./routes/moduleAccessRoutes'); 
const certificateRoutes = require('./routes/course/certificateRoutes');
const discussionBoardRoutes = require('./routes/course/discussionBoardRoutes');

const scheduleRoutes = require('./routes/course/scheduleRoutes');
const announcementRoutes = require('./routes/course/announcementRoutes');

const courseRoutes = require('./routes/course/courseRoutes');
const moduleRoutes = require('./routes/course/moduleRoutes');
const quizRoutes = require('./routes/course/quiz/quizRoutes');
const questionRoutes = require('./routes/course/quiz/questionRoutes');
const optionRoutes = require('./routes/course/quiz/optionRoutes');
const reviewRoutes = require('./routes/course/reviewRoutes');
const directMessageRoutes = require('./routes/course/directMessageRoutes');

const enrolmentRoutes = require('./routes/enrolmentRoutes');

const notificationSettingRoutes = require('./routes/notificationSettingRoutes');
const pomodoroSettingRoutes = require('./routes/pomodoroSettingRoutes');

const dashboardRoutes = require('./routes/dashboardRoutes');

const uploadRoutes = require('./routes/uploadRoutes');

// Import database connection
const { connectDB } = require('./config/database');
const DirectMessage = require('./models/DirectMessage');

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
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-Requested-With'],
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
    secure: false, // set true if HTTPS
    sameSite: 'lax'
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
app.use('/api/pathway', pathwayRoutes);
app.use('/api/moduleAccess', moduleAccessRoutes); 
app.use('/api/certificate', certificateRoutes);
app.use('/api/discussion', discussionBoardRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/announcement', announcementRoutes);

app.use('/api/quiz', quizRoutes);
app.use('/api/question', questionRoutes);
app.use('/api/option', optionRoutes);

app.use('/api/review', reviewRoutes);
app.use('/api/dm', directMessageRoutes);

app.use('/api/enrolment', enrolmentRoutes);

app.use('/api/notification', notificationSettingRoutes);
app.use('/api/pomodoro', pomodoroSettingRoutes);

app.use('/api/dashboard', dashboardRoutes);

app.use('/api/upload', uploadRoutes);

// Static folder
app.use('/uploads/', express.static(path.join(__dirname, '../uploads')));

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
