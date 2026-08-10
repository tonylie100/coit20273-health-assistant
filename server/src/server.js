const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    subsystem: 'Recommendation Engine API Gateway',
    timestamp: new Date().toISOString()
  });
});

// Sample Recommendation Endpoint
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