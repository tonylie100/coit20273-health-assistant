const recommendationService = require('../services/recommendationService');

/**
 * Generates AI diet & exercise recommendations.
 * Uses Firebase Auth ID (req.user.uid) with fallback to req.body.userId for postman testing.
 */
async function createRecommendations(req, res) {
  try {
    const userId = req.user?.uid || req.body.userId;
    const { metrics, queryEmbedding } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId is required (via Bearer token or request body).' 
      });
    }

    // Passes metrics and queryEmbedding to service for RAG + GenAI execution
    const recommendations = await recommendationService.generateUserRecommendations(userId, {
      metrics,
      queryEmbedding
    });

    return res.status(201).json({
      success: true,
      count: Array.isArray(recommendations) ? recommendations.length : 1,
      data: recommendations,
    });
  } catch (error) {
    console.error('Controller Error (createRecommendations):', error.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to generate recommendations.' 
    });
  }
}

/**
 * Fetches stored historical recommendations for a user.
 */
async function fetchRecommendations(req, res) {
  try {
    const userId = req.user?.uid || req.params.userId;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId is required.' 
      });
    }

    const recommendations = await recommendationService.getStoredRecommendations(userId);

    return res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    console.error('Controller Error (fetchRecommendations):', error.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch stored recommendations.' 
    });
  }
}

module.exports = {
  createRecommendations,
  fetchRecommendations,
};