const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const verifyToken = require('../middleware/verifyToken'); // Sakshi's Firebase authentication
const safetyGuard = require('../middleware/safetyGuard'); // Safety override middleware

// POST /api/v1/recommendations/generate
// Execution Flow: verifyToken (Auth) -> safetyGuard (Physiological Thresholds) -> createRecommendations (RAG + GenAI)
router.post('/generate', verifyToken, safetyGuard, recommendationController.createRecommendations);

// GET /api/v1/recommendations/:userId
// Protected by Firebase Auth to prevent BOLA vulnerabilities
router.get('/:userId', verifyToken, recommendationController.fetchRecommendations);

module.exports = router;