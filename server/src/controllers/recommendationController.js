const recommendationService = require('../services/recommendationService');

async function createRecommendations(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required in request body.' });
    }

    const recommendations = await recommendationService.generateUserRecommendations(userId);
    return res.status(201).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    console.error('Controller Error:', error.message);
    return res.status(500).json({ error: 'Failed to generate recommendations.' });
  }
}

async function fetchRecommendations(req, res) {
  try {
    const { userId } = req.params;
    const recommendations = await recommendationService.getStoredRecommendations(userId);
    return res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    console.error('Controller Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch stored recommendations.' });
  }
}

module.exports = {
  createRecommendations,
  fetchRecommendations,
};