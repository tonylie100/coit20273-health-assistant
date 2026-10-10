const express = require('express');
const router = express.Router();

const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');

// Helper: get database user from Firebase UID
const getDatabaseUser = async (firebaseUid) => {
  const result = await pool.query(
    `SELECT user_id, full_name, email
     FROM users
     WHERE firebase_uid = $1`,
    [firebaseUid]
  );

  return result.rows[0];
};


// POST - SAVE HEALTH DATA
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      recordDate,
      steps,
      heartRate,
      sleepHours,
      caloriesBurned,
      waterIntake
    } = req.body;

    // Find the authenticated user
    const user = await getDatabaseUser(req.user.uid);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    // Required field
    if (!recordDate) {
      return res.status(400).json({
        success: false,
        message: 'recordDate is required'
      });
    }

    // Validation
    if (
      steps !== undefined &&
      (!Number.isFinite(Number(steps)) || Number(steps) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'steps must be a non-negative number'
      });
    }

    if (
      heartRate !== undefined &&
      heartRate !== null &&
      (!Number.isFinite(Number(heartRate)) || Number(heartRate) <= 0)
    ) {
      return res.status(400).json({
        success: false,
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
        success: false,
        message: 'sleepHours must be between 0 and 24'
      });
    }

    if (
      caloriesBurned !== undefined &&
      (!Number.isFinite(Number(caloriesBurned)) ||
        Number(caloriesBurned) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'caloriesBurned must be a non-negative number'
      });
    }

    if (
      waterIntake !== undefined &&
      (!Number.isFinite(Number(waterIntake)) ||
        Number(waterIntake) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'waterIntake must be a non-negative number'
      });
    }

    // Save using the authenticated user's database ID
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
        recordDate,
        steps ?? 0,
        heartRate ?? null,
        sleepHours ?? null,
        caloriesBurned ?? 0,
        waterIntake ?? 0
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Health data saved successfully',
      healthData: {
        health_data_id: result.rows[0].health_data_id,
        user_id: user.user_id,
        user_name: user.full_name,
        record_date: result.rows[0].record_date,
        steps: result.rows[0].steps,
        heart_rate: result.rows[0].heart_rate,
        sleep_hours: result.rows[0].sleep_hours,
        calories_burned: result.rows[0].calories_burned,
        water_intake: result.rows[0].water_intake
      }
    });

  } catch (error) {
    console.error('Health data save error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to save health data',
      error: error.message
    });
  }
});


// GET - RETRIEVE AUTHENTICATED USER'S HEALTH DATA
router.get('/', verifyToken, async (req, res) => {
  try {
    // Find authenticated user
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
       ORDER BY record_date DESC`,
      [user.user_id]
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
      error: error.message
    });
  }
});


module.exports = router;