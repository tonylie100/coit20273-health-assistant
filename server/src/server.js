const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import DB connection
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check Route with DB verification
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

app.get('/api/v1/recommendations/health-summary', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Recommendation Engine baseline operational.',
    data: {
      recommendations: [
        { id: 1, type: 'activity', suggestion: 'Target 8,000 steps today based on recent trends.' },
        { id: 2, type: 'sleep', suggestion: 'Maintain a consistent sleep window around 10:30 PM.' }
      ]
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Recommendation Engine Server running on port ${PORT}`);
});