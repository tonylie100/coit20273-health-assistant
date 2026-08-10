const cors = require('cors');
const dashboardRoutes = require('./routes/dashboard');
const healthDataRoutes = require('./routes/healthData');
const goalRoutes = require('./routes/goals');
const profileRoutes = require('./routes/profile');
const authRoutes = require('./routes/auth');
const express = require('express');
const pool = require('./db');

const app = express();
app.use(cors());
const PORT = 3000;

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/health-data', healthDataRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.send('AI-Powered Personal Health Assistant Backend is running');
});

app.get('/database-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.json({
      message: 'PostgreSQL connection successful',
      databaseTime: result.rows[0].now
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Database connection failed',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});