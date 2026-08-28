const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// POST http://localhost:3000/api/recommendations/generate
router.post('/generate', recommendationController.createRecommendations);

// GET http://localhost:3000/api/recommendations/1
router.get('/:userId', recommendationController.fetchRecommendations);

module.exports = router;