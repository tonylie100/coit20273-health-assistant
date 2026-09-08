const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET USER PROFILE
router.get('/:firebaseUid', async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    const result = await pool.query(
      `SELECT user_id, firebase_uid, full_name, email,
              age, gender, height, weight, created_at
       FROM users
       WHERE firebase_uid = $1`,
      [firebaseUid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User profile not found'
      });
    }

    res.json({
      message: 'Profile retrieved successfully',
      profile: result.rows[0]
    });

  } catch (error) {
    console.error('Profile retrieval error:', error);

    res.status(500).json({
      message: 'Failed to retrieve profile',
      error: error.message
    });
  }
});


// UPDATE USER PROFILE
router.put('/:firebaseUid', async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    const {
      fullName,
      age,
      gender,
      height,
      weight
    } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           age = COALESCE($2, age),
           gender = COALESCE($3, gender),
           height = COALESCE($4, height),
           weight = COALESCE($5, weight)
       WHERE firebase_uid = $6
       RETURNING user_id, firebase_uid, full_name, email,
                 age, gender, height, weight, created_at`,
      [
        fullName || null,
        age || null,
        gender || null,
        height || null,
        weight || null,
        firebaseUid
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User profile not found'
      });
    }

    res.json({
      message: 'Profile updated successfully',
      profile: result.rows[0]
    });

  } catch (error) {
    console.error('Profile update error:', error);

    res.status(500).json({
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

module.exports = router;