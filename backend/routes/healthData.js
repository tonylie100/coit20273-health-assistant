
const express = require('express');
const router = express.Router();

const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');

// POST - SAVE HEALTH DATA FOR THE AUTHENTICATED USER
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      recordDate,
      record_date,
      steps,
      step_count,
      heartRate,
      heart_rate,
      heart_rate_avg,
      sleepHours,
      sleep_hours,
      caloriesBurned,
      calories_burned,
      waterIntake,
      water_intake
    } = req.body;

    // The Firebase UID comes from the verified token, not the form.
    const firebaseUid = req.user.uid;

    const userResult = await pool.query(
      `SELECT user_id, full_name
       FROM users
       WHERE firebase_uid = $1`,
      [firebaseUid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: 'No database profile is linked to this account. Please complete registration.'
      });
    }

    const user = userResult.rows[0];

    const finalRecordDate =
      recordDate ??
      record_date ??
      new Date().toISOString().split('T')[0];

    const finalSteps = steps ?? step_count ?? 0;
    const finalHeartRate = heartRate ?? heart_rate ?? heart_rate_avg ?? null;
    const finalSleepHours = sleepHours ?? sleep_hours ?? null;
    const finalCalories = caloriesBurned ?? calories_burned ?? 0;
    const finalWater = waterIntake ?? water_intake ?? 0;

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
        user.user_id,
        finalRecordDate,
        finalSteps,
        finalHeartRate,
        finalSleepHours,
        finalCalories,
        finalWater
      ]
    );

    return res.status(201).json({
      message: 'Health data saved successfully',
      user: {
        user_id: user.user_id,
        full_name: user.full_name
      },
      healthData: result.rows[0]
    });
  } catch (error) {
    console.error('Health data save error:', error);

    return res.status(500).json({
      message: 'Failed to save health data',
      error: 'An unexpected server error occurred.'
    });
  }
});

// GET - RETRIEVE HEALTH DATA FOR THE AUTHENTICATED USER
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      `SELECT user_id
       FROM users
       WHERE firebase_uid = $1`,
      [req.user.uid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: 'User profile not found'
      });
    }

    const authenticatedUserId = userResult.rows[0].user_id;

    // Do not allow the URL parameter to expose another user's records.
    if (Number(req.params.userId) !== Number(authenticatedUserId)) {
      return res.status(403).json({
        message: 'You cannot access another user’s health records.'
      });
    }

    const result = await pool.query(
      `SELECT
         health_data_id,
         user_id,
         record_date,
         steps,
         heart_rate,
         sleep_hours,
         calories_burned,
         water_intake
       FROM health_data
       WHERE user_id = $1
       ORDER BY record_date DESC, health_data_id DESC`,
      [authenticatedUserId]
    );

    return res.status(200).json({
      success: true,
      message: 'Health data retrieved successfully',
      user: {
        user_id: user.user_id,
        user_name: user.full_name,
        email: user.email
      },
      healthData: result.rows
    });
  } catch (error) {
    console.error('Health data retrieval error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve health data',
      error: error.message
    });
  }
});


// GET - RETRIEVE A SPECIFIC USER'S RECORD BY DATE
router.get('/date/:recordDate', verifyToken, async (req, res) => {
  try {
    const { recordDate } = req.params;

    const user = await getDatabaseUser(req.user.uid);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    const result = await pool.query(
      `SELECT
         health_data_id,
         user_id,
         record_date,
         steps,
         heart_rate,
         sleep_hours,
         calories_burned,
         water_intake
       FROM health_data
       WHERE user_id = $1
       AND record_date = $2`,
      [user.user_id, recordDate]
    );

    return res.status(200).json({
      success: true,
      message: 'Health data retrieved successfully',
      user: {
        user_id: user.user_id,
        user_name: user.full_name
      },
      healthData: result.rows
    });

  } catch (error) {
    console.error('Health data date retrieval error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve health data',
      error: 'An unexpected server error occurred.'
    });
  }
});

module.exports = router;
