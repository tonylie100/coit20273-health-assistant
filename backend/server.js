require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db');

const metricsRoutes = require('./routes/metrics');
const dashboardRoutes = require('./routes/dashboard');
const healthDataRoutes = require('./routes/healthData');
const goalRoutes = require('./routes/goals');
const profileRoutes = require('./routes/profile');
const authRoutes = require('./routes/auth');
const chatbotRoutes = require('./routes/chatbot');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();

  console.log(
    `[REQUEST] ${req.method} ${req.originalUrl}`
  );

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    console.log(
      `[RESPONSE] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration} ms)`
    );
  });

  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/health-data', healthDataRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/v1/metrics', metricsRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('AI-Powered Personal Health Assistant Backend is running');
});

// Database test route
app.get('/database-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.json({
      message: 'PostgreSQL connection successful',
      databaseTime: result.rows[0].now
    });
  } catch (error) {
    console.error('[DATABASE ERROR]', error);

    res.status(500).json({
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`LAN access: http://192.168.0.237:${PORT}`);
});