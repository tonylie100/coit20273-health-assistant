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

const { storeHealthLogEmbedding, findSimilarHealthLogs } = require('../services/embeddingService');

// POST /api/v1/recommendations/embeddings/test
router.post('/embeddings/test', async (req, res) => {
  try {
    const { userId, logText, category } = req.body;
    
    // Store log with vector
    const savedLog = await storeHealthLogEmbedding(userId || 1, logText, category);
    
    // Test similarity query
    const similarLogs = await findSimilarHealthLogs(userId || 1, logText, 3);

    res.status(200).json({
      success: true,
      savedLog,
      similarLogs,
    });
  } catch (error) {
    console.error('Embedding Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});