const express = require('express');
const router = express.Router();

const auth = require('../firebase');
const pool = require('../db');


// ==========================================
// TEST FIREBASE CONNECTION
// ==========================================

router.get('/firebase-test', async (req, res) => {
  try {
    const listUsersResult = await auth.listUsers(1);

    res.json({
      message: 'Firebase Admin SDK connected successfully',
      usersFound: listUsersResult.users.length
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Firebase Admin SDK connection failed',
      error: error.message
    });
  }
});


// ==========================================
// REGISTER USER
// ==========================================

router.post('/register', async (req, res) => {
  let firebaseUser = null;

  try {
    const {
      fullName,
      email,
      password,
      age,
      gender,
      height,
      weight
    } = req.body;

    // Check required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: 'Full name, email and password are required'
      });
    }

    // Create user in Firebase Authentication
    firebaseUser = await auth.createUser({
      email: email,
      password: password,
      displayName: fullName
    });

    // Save user profile in PostgreSQL
    const result = await pool.query(
      `INSERT INTO users
       (firebase_uid, full_name, email, age, gender, height, weight)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING user_id, firebase_uid, full_name, email,
                 age, gender, height, weight, created_at`,
      [
        firebaseUser.uid,
        fullName,
        email,
        age || null,
        gender || null,
        height || null,
        weight || null
      ]
    );

    // Registration successful
    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Registration error:', error);

    // If Firebase user was created but PostgreSQL failed,
    // remove the Firebase account to keep both systems consistent.
    if (firebaseUser) {
      try {
        await auth.deleteUser(firebaseUser.uid);
      } catch (deleteError) {
        console.error(
          'Could not rollback Firebase user:',
          deleteError.message
        );
      }
    }

    res.status(500).json({
      message: 'Registration failed',
      error: error.message
    });
  }
});


module.exports = router;