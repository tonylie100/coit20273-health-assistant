const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import Database Pool Connection
const db = require('./config/db');

// 1. ADD THIS: Import your recommendation routes module
const recommendationRoutes = require('./routes/recommendationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route (Verifies DB connection status)
app.get('/health', async (req, res) => {
  try {
    const dbStatus = await db.query('SELECT NOW()');
    res.status(200).json({
      status: 'OK',
      subsystem: 'Recommendation Engine API Gateway',
      database: 'Connected',
      dbTimestamp: dbStatus.rows[0].now,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      subsystem: 'Recommendation Engine API Gateway',
      database: 'Disconnected',
      error: error.message
    });
  }
});

// 2. ADD THIS: Register Recommendation Engine endpoints
app.use('/api/v1/recommendations', recommendationRoutes);

// 3. LIVE DATA ROUTE: Keep for baseline health testing
app.get('/api/v1/recommendations/health-summary', async (req, res) => {
  try {
    const userResult = await db.query('SELECT id, full_name, email FROM users LIMIT 1');
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No seed user found in database.' });
    }

    const user = userResult.rows[0];

    const metricsResult = await db.query(
      'SELECT step_count, sleep_hours, heart_rate_avg, recorded_date FROM health_metrics WHERE user_id = $1 ORDER BY recorded_date DESC LIMIT 1',
      [user.id]
    );

    const recsResult = await db.query(
      'SELECT id, category, suggestion, status, created_at FROM recommendations WHERE user_id = $1',
      [user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Live database records fetched successfully.',
      data: {
        user: user,
        latestMetrics: metricsResult.rows[0] || null,
        recommendations: recsResult.rows
      }
    });
  } catch (error) {
    console.error('❌ Database Query Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve health summary from database',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Recommendation Engine Server running on port ${PORT}`);
});