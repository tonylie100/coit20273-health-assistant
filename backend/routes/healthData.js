const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST - INGEST WEARABLE HEALTH DATA
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      recordDate,
      steps,
      heartRate,
      sleepHours,
      caloriesBurned
    } = req.body;

    if (!userId || !recordDate) {
      return res.status(400).json({
        message: 'userId and recordDate are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO health_data
       (user_id, record_date, steps, heart_rate, sleep_hours, calories_burned)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userId,
        recordDate,
        steps ?? 0,
        heartRate ?? null,
        sleepHours ?? null,
        caloriesBurned ?? 0
      ]
    );

    res.status(201).json({
      message: 'Wearable health data ingested successfully',
      healthData: result.rows[0]
    });

  } catch (error) {
    console.error('Health data ingestion error:', error);

    res.status(500).json({
      message: 'Failed to ingest wearable health data',
      error: error.message
    });
  }
});

// GET - RETRIEVE USER'S WEARABLE DATA
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT *
       FROM health_data
       WHERE user_id = $1
       ORDER BY record_date DESC`,
      [userId]
    );

    res.status(200).json({
      message: 'Health data retrieved successfully',
      healthData: result.rows
    });

  } catch (error) {
    console.error('Health data retrieval error:', error);

    res.status(500).json({
      message: 'Failed to retrieve health data',
      error: error.message
    });
  }
});

module.exports = router;