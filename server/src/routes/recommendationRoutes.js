// src/routes/recommendationRoutes.js
const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// GET user recommendations
router.get('/:userId', recommendationController.getRecommendations);

// POST trigger new recommendation generation run
router.post('/generate/:userId', recommendationController.triggerRecommendationGeneration);

module.exports = router;