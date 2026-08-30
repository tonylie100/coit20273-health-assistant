const express = require('express');
const router = express.Router();
const pool = require('../db');



router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      step_count,
      sleep_hours,
      heart_rate_avg,
      water_intake,
      calories_burned
    } = req.body;

   
    if (!user_id) {
      return res.status(400).json({
        message: 'user_id is required'
      });
    }

    
    if (
      step_count !== undefined &&
      (!Number.isFinite(Number(step_count)) || Number(step_count) < 0)
    ) {
      return res.status(400).json({
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
        message: 'sleep_hours must be between 0 and 24'
      });
    }

    
    if (
      heart_rate_avg !== undefined &&
      (
        !Number.isFinite(Number(heart_rate_avg)) ||
        Number(heart_rate_avg) <= 0
      )
    ) {
      return res.status(400).json({
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
        message: 'calories_burned must be a non-negative number'
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
       VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        user_id,
        step_count ?? 0,
        heart_rate_avg ?? null,
        sleep_hours ?? null,
        calories_burned ?? 0,
        water_intake ?? 0
      ]
    );

    return res.status(201).json({
      message: 'Daily health metrics ingested successfully',
      metrics: {
        health_data_id: result.rows[0].health_data_id,
        user_id: result.rows[0].user_id,
        record_date: result.rows[0].record_date,
        step_count: result.rows[0].steps,
        sleep_hours: result.rows[0].sleep_hours,
        heart_rate_avg: result.rows[0].heart_rate,
        water_intake: result.rows[0].water_intake,
        calories_burned: result.rows[0].calories_burned
      }
    });

  } catch (error) {
    console.error('Metrics ingestion error:', error);

    return res.status(500).json({
      message: 'Failed to ingest health metrics',
      error: error.message
    });
  }
});



router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const {
      step_count,
      sleep_hours,
      heart_rate_avg,
      water_intake,
      calories_burned
    } = req.body;

    
    if (
      step_count !== undefined &&
      (!Number.isFinite(Number(step_count)) || Number(step_count) < 0)
    ) {
      return res.status(400).json({
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
        message: 'sleep_hours must be between 0 and 24'
      });
    }

    if (
      heart_rate_avg !== undefined &&
      (
        !Number.isFinite(Number(heart_rate_avg)) ||
        Number(heart_rate_avg) <= 0
      )
    ) {
      return res.status(400).json({
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
        message: 'calories_burned must be a non-negative number'
      });
    }

    const result = await pool.query(
      `UPDATE health_data
       SET
         steps = COALESCE($1, steps),
         sleep_hours = COALESCE($2, sleep_hours),
         heart_rate = COALESCE($3, heart_rate),
         water_intake = COALESCE($4, water_intake),
         calories_burned = COALESCE($5, calories_burned)
       WHERE health_data_id = $6
       RETURNING *`,
      [
        step_count ?? null,
        sleep_hours ?? null,
        heart_rate_avg ?? null,
        water_intake ?? null,
        calories_burned ?? null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Health metrics record not found'
      });
    }

    return res.status(200).json({
      message: 'Health metrics updated successfully',
      metrics: {
        health_data_id: result.rows[0].health_data_id,
        user_id: result.rows[0].user_id,
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
      message: 'Failed to update health metrics',
      error: error.message
    });
  }
});


module.exports = router;