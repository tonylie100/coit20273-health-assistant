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
      caloriesBurned,
      waterIntake
    } = req.body;

    // Required fields
    if (!userId || !recordDate) {
      return res.status(400).json({
        message: 'userId and recordDate are required'
      });
    }

    // Validation
    if (
      steps !== undefined &&
      (!Number.isFinite(Number(steps)) || Number(steps) < 0)
    ) {
      return res.status(400).json({
        message: 'steps must be a non-negative number'
      });
    }

    if (
      heartRate !== undefined &&
      heartRate !== null &&
      (!Number.isFinite(Number(heartRate)) || Number(heartRate) <= 0)
    ) {
      return res.status(400).json({
        message: 'heartRate must be a positive number'
      });
    }

    if (
      sleepHours !== undefined &&
      sleepHours !== null &&
      (
        !Number.isFinite(Number(sleepHours)) ||
        Number(sleepHours) < 0 ||
        Number(sleepHours) > 24
      )
    ) {
      return res.status(400).json({
        message: 'sleepHours must be between 0 and 24'
      });
    }

    if (
      caloriesBurned !== undefined &&
      (!Number.isFinite(Number(caloriesBurned)) ||
        Number(caloriesBurned) < 0)
    ) {
      return res.status(400).json({
        message: 'caloriesBurned must be a non-negative number'
      });
    }

    if (
      waterIntake !== undefined &&
      (!Number.isFinite(Number(waterIntake)) ||
        Number(waterIntake) < 0)
    ) {
      return res.status(400).json({
        message: 'waterIntake must be a non-negative number'
      });
    }

    const result = await pool.query(
      `INSERT INTO health_data
       (
         user_id,
         record_date,
         steps,
         heart_rate,
         sleep_hours,
         calories_burned,
         water_intake
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        recordDate,
        steps ?? 0,
        heartRate ?? null,
        sleepHours ?? null,
        caloriesBurned ?? 0,
        waterIntake ?? 0
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
       ORDER BY record_date DESC`,
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