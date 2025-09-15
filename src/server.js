const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');

// Import database connection
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Test database connection
connectDB();

// ✅ Middleware
app.use(cors({
  origin: "http://localhost:5173", // allow your frontend
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Brainwave API is running'
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Error:', error.message);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
});

module.exports = app;
