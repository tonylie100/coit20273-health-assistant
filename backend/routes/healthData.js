const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST - INGEST WEARABLE HEALTH DATA
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      user_id,
      recordDate,
      record_date,
      created_at,
      steps,
      step_count,
      heartRate,
      heart_rate_avg,
      sleepHours,
      sleep_hours,
      caloriesBurned,
      calories_burned,
      waterIntake,
      water_intake
    } = req.body;

    // Normalize field values
    const finalUserId = userId || user_id;
    const finalRecordDate = recordDate || record_date || created_at || new Date().toISOString().split('T')[0];
    const finalSteps = steps ?? step_count ?? 0;
    const finalHeartRate = heartRate ?? heart_rate_avg ?? null;
    const finalSleepHours = sleepHours ?? sleep_hours ?? null;
    const finalCalories = caloriesBurned ?? calories_burned ?? 0;
    const finalWater = waterIntake ?? water_intake ?? 0;

    // Required fields
    if (!finalUserId) {
      return res.status(400).json({
        message: 'userId is required'
      });
    }

    const result = await pool.query(
      `INSERT INTO health_data
       (
         user_id,
         created_at,
         steps,
         heart_rate_avg,
         sleep_hours,
         calories_burned,
         water_intake
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        finalUserId,
        finalRecordDate,
        finalSteps,
        finalHeartRate,
        finalSleepHours,
        finalCalories,
        finalWater
      ]
    );

    return res.status(201).json({
      message: 'Wearable health data ingested successfully',
      healthData: result.rows[0]
    });

  } catch (error) {
    console.error('Health data ingestion error:', error);

    return res.status(500).json({
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
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      message: 'Health data retrieved successfully',
      healthData: result.rows
    });

  } catch (error) {
    console.error('Health data retrieval error:', error);

    return res.status(500).json({
      message: 'Failed to retrieve health data',
      error: error.message
    });
  }
});

module.exports = router;