const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import Database Pool Connection
const db = require('./config/db');

// Import recommendation routes module
const recommendationRoutes = require('./routes/recommendationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middleware
app.use(cors());
app.use(express.json());

// 1. Health Check Route (Verifies API and DB connectivity)
app.get('/health', async (req, res) => {
  try {
    const dbStatus = await db.query('SELECT NOW()');
    res.status(200).json({
      status: 'OK',
      subsystem: 'Recommendation Engine API Gateway',
      database: 'Connected',
      dbTimestamp: dbStatus.rows[0].now,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      subsystem: 'Recommendation Engine API Gateway',
      database: 'Disconnected',
      error: error.message,
    });
  }
});

// 2. Register Recommendation Engine Endpoints
app.use('/api/v1/recommendations', recommendationRoutes);

// 3. Baseline Health Check & Debug Route
app.get('/api/v1/recommendations/health-summary', async (req, res) => {
  try {
    const userResult = await db.query('SELECT id, full_name, email FROM users LIMIT 1');
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No seed user found in database.' });
    }

    const user = userResult.rows[0];

    // Query weekly metrics from health_data table
    const metricsResult = await db.query(
      `SELECT steps, sleep_hours, water_intake, created_at 
       FROM health_data 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [user.id]
    );

    // Query recent generated recommendations
    const recsResult = await db.query(
      `SELECT id, category, title, message, priority, created_at 
       FROM user_recommendations 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Live database records fetched successfully.',
      data: {
        user: user,
        latestMetrics: metricsResult.rows[0] || null,
        recommendations: recsResult.rows,
      },
    });
  } catch (error) {
    console.error('❌ Database Query Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve health summary from database',
      details: error.message,
    });
  }
});

// 4. Fallback 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// 5. Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server Internal Error:', err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Recommendation Engine Server running on port ${PORT}`);
});