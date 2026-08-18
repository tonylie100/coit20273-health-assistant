// src/controllers/recommendationController.js
const recommendationService = require('../services/recommendationService');

// GET /api/v1/recommendations/:userId
async function getRecommendations(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid user ID' });
    }

    const recommendations = await recommendationService.getStoredRecommendations(userId);
    return res.status(200).json({
      status: 'success',
      data: recommendations
    });
  } catch (err) {
    console.error('Error fetching recommendations:', err);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

// POST /api/v1/recommendations/generate/:userId
async function triggerRecommendationGeneration(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid user ID' });
    }

    const newRecs = await recommendationService.generateUserRecommendations(userId);
    return res.status(201).json({
      status: 'success',
      message: 'Recommendations generated successfully',
      data: newRecs
    });
  } catch (err) {
    console.error('Error generating recommendations:', err);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

module.exports = {
  getRecommendations,
  triggerRecommendationGeneration
};