const express = require('express');
const router = express.Router();
const pool = require('../db');


router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

   
    const summaryResult = await pool.query(
      `SELECT
          COUNT(*) AS total_records,
          SUM(steps) AS total_steps,
          ROUND(AVG(steps), 0) AS average_steps,
          ROUND(AVG(heart_rate), 0) AS average_heart_rate,
          ROUND(AVG(sleep_hours), 2) AS average_sleep_hours,
          SUM(calories_burned) AS total_calories_burned
       FROM health_data
       WHERE user_id = $1`,
      [userId]
    );

   
    const latestResult = await pool.query(
      `SELECT *
       FROM health_data
       WHERE user_id = $1
       ORDER BY record_date DESC
       LIMIT 1`,
      [userId]
    );

    
    const goalsResult = await pool.query(
      `SELECT goal_id, goal_type, target_value,
              start_date, end_date, status
       FROM goals
       WHERE user_id = $1
       AND status = 'Active'
       ORDER BY goal_id`,
      [userId]
    );

    res.status(200).json({
      message: 'Dashboard data retrieved successfully',
      summary: summaryResult.rows[0],
      latestHealthData: latestResult.rows[0] || null,
      activeGoals: goalsResult.rows
    });

  } catch (error) {
    console.error('Dashboard error:', error);

    res.status(500).json({
      message: 'Failed to retrieve dashboard data',
      error: error.message
    });
  }
});

module.exports = router;