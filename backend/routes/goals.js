const express = require('express');
const router = express.Router();
const pool = require('../db');


router.post('/', async (req, res) => {
  try {
    const {
      userId,
      goalType,
      targetValue,
      startDate,
      endDate,
      status
    } = req.body;

    if (!userId || !goalType || !targetValue) {
      return res.status(400).json({
        message: 'userId, goalType and targetValue are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO goals
       (user_id, goal_type, target_value, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userId,
        goalType,
        targetValue,
        startDate || null,
        endDate || null,
        status || 'Active'
      ]
    );

    res.status(201).json({
      message: 'Goal created successfully',
      goal: result.rows[0]
    });

  } catch (error) {
    console.error('Create goal error:', error);

    res.status(500).json({
      message: 'Failed to create goal',
      error: error.message
    });
  }
});



router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT *
       FROM goals
       WHERE user_id = $1
       ORDER BY goal_id`,
      [userId]
    );

    res.json({
      message: 'Goals retrieved successfully',
      goals: result.rows
    });

  } catch (error) {
    console.error('Get goals error:', error);

    res.status(500).json({
      message: 'Failed to retrieve goals',
      error: error.message
    });
  }
});



router.put('/:goalId', async (req, res) => {
  try {
    const { goalId } = req.params;

    const {
      goalType,
      targetValue,
      startDate,
      endDate,
      status
    } = req.body;

    const result = await pool.query(
      `UPDATE goals
       SET goal_type = COALESCE($1, goal_type),
           target_value = COALESCE($2, target_value),
           start_date = COALESCE($3, start_date),
           end_date = COALESCE($4, end_date),
           status = COALESCE($5, status)
       WHERE goal_id = $6
       RETURNING *`,
      [
        goalType || null,
        targetValue || null,
        startDate || null,
        endDate || null,
        status || null,
        goalId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Goal not found'
      });
    }

    res.json({
      message: 'Goal updated successfully',
      goal: result.rows[0]
    });

  } catch (error) {
    console.error('Update goal error:', error);

    res.status(500).json({
      message: 'Failed to update goal',
      error: error.message
    });
  }
});

router.delete('/:goalId', async (req, res) => {
  try {
    const { goalId } = req.params;

    const result = await pool.query(
      `DELETE FROM goals
       WHERE goal_id = $1
       RETURNING *`,
      [goalId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Goal not found'
      });
    }

    res.json({
      message: 'Goal deleted successfully',
      goal: result.rows[0]
    });

  } catch (error) {
    console.error('Delete goal error:', error);

    res.status(500).json({
      message: 'Failed to delete goal',
      error: error.message
    });
  }
});


module.exports = router;