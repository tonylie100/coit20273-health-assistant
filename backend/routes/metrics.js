const express = require('express');
const router = express.Router();

const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');

// Helper: find database user from Firebase UID
const getDatabaseUser = async (firebaseUid) => {
  const result = await pool.query(
    `SELECT user_id, full_name, email
     FROM users
     WHERE firebase_uid = $1`,
    [firebaseUid]
  );

  return result.rows[0];
};


// POST - CREATE DAILY HEALTH METRICS
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      record_date,
      step_count,
      sleep_hours,
      heart_rate_avg,
      water_intake,
      calories_burned
    } = req.body;

    // Find authenticated database user
    const user = await getDatabaseUser(req.user.uid);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    // Validation
    if (
      step_count !== undefined &&
      (!Number.isFinite(Number(step_count)) ||
        Number(step_count) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'step_count must be a non-negative number'
      });
    }

    if (
      sleep_hours !== undefined &&
      (
        !Number.isFinite(Number(sleep_hours)) ||
        Number(sleep_hours) < 0 ||
        Number(sleep_hours) > 24
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'sleep_hours must be between 0 and 24'
      });
    }

    if (
      heart_rate_avg !== undefined &&
      heart_rate_avg !== null &&
      (
        !Number.isFinite(Number(heart_rate_avg)) ||
        Number(heart_rate_avg) <= 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'heart_rate_avg must be a positive number'
      });
    }

    if (
      water_intake !== undefined &&
      (
        !Number.isFinite(Number(water_intake)) ||
        Number(water_intake) < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'water_intake must be a non-negative number'
      });
    }

    if (
      calories_burned !== undefined &&
      (
        !Number.isFinite(Number(calories_burned)) ||
        Number(calories_burned) < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'calories_burned must be a non-negative number'
      });
    }

    // Use supplied date, or today's date if omitted
    const healthDate = record_date || new Date().toISOString().slice(0, 10);

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
        healthDate,
        step_count ?? 0,
        heart_rate_avg ?? null,
        sleep_hours ?? null,
        calories_burned ?? 0,
        water_intake ?? 0
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Daily health metrics created successfully',
      metrics: {
        health_data_id: result.rows[0].health_data_id,
        user_id: user.user_id,
        user_name: user.full_name,
        record_date: result.rows[0].record_date,
        step_count: result.rows[0].steps,
        sleep_hours: result.rows[0].sleep_hours,
        heart_rate_avg: result.rows[0].heart_rate,
        water_intake: result.rows[0].water_intake,
        calories_burned: result.rows[0].calories_burned
      }
    });

  } catch (error) {
    console.error('Metrics creation error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create health metrics',
      error: error.message
    });
  }
});


// PUT - UPDATE OWN HEALTH METRICS
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      step_count,
      sleep_hours,
      heart_rate_avg,
      water_intake,
      calories_burned
    } = req.body;

    // Find authenticated database user
    const user = await getDatabaseUser(req.user.uid);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    // Validation
    if (
      step_count !== undefined &&
      (!Number.isFinite(Number(step_count)) ||
        Number(step_count) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'step_count must be a non-negative number'
      });
    }

    if (
      sleep_hours !== undefined &&
      (
        !Number.isFinite(Number(sleep_hours)) ||
        Number(sleep_hours) < 0 ||
        Number(sleep_hours) > 24
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'sleep_hours must be between 0 and 24'
      });
    }

    if (
      heart_rate_avg !== undefined &&
      heart_rate_avg !== null &&
      (
        !Number.isFinite(Number(heart_rate_avg)) ||
        Number(heart_rate_avg) <= 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'heart_rate_avg must be a positive number'
      });
    }

    if (
      water_intake !== undefined &&
      (
        !Number.isFinite(Number(water_intake)) ||
        Number(water_intake) < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'water_intake must be a non-negative number'
      });
    }

    if (
      calories_burned !== undefined &&
      (
        !Number.isFinite(Number(calories_burned)) ||
        Number(calories_burned) < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'calories_burned must be a non-negative number'
      });
    }

    // IMPORTANT:
    // The WHERE clause checks BOTH the record ID
    // AND the authenticated user's ID.
    //
    // This prevents one user from modifying
    // another user's health record.
    const result = await pool.query(
      `UPDATE health_data
       SET
         steps = COALESCE($1, steps),
         sleep_hours = COALESCE($2, sleep_hours),
         heart_rate = COALESCE($3, heart_rate),
         water_intake = COALESCE($4, water_intake),
         calories_burned = COALESCE($5, calories_burned)
       WHERE health_data_id = $6
       AND user_id = $7
       RETURNING *`,
      [
        step_count ?? null,
        sleep_hours ?? null,
        heart_rate_avg ?? null,
        water_intake ?? null,
        calories_burned ?? null,
        id,
        user.user_id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Health metrics record not found or does not belong to this user'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Health metrics updated successfully',
      metrics: {
        health_data_id: result.rows[0].health_data_id,
        user_id: result.rows[0].user_id,
        user_name: user.full_name,
        record_date: result.rows[0].record_date,
        step_count: result.rows[0].steps,
        sleep_hours: result.rows[0].sleep_hours,
        heart_rate_avg: result.rows[0].heart_rate,
        water_intake: result.rows[0].water_intake,
        calories_burned: result.rows[0].calories_burned
      }
    });

  } catch (error) {
    console.error('Metrics update error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update health metrics',
      error: error.message
    });
  }
});


module.exports = router;