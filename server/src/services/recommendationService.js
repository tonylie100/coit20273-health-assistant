// src/services/recommendationService.js
const db = require('../config/db'); // Your PostgreSQL db connection

/**
 * Generates recommendations for a specific user based on recent health metrics.
 */
async function generateUserRecommendations(userId) {
  // 1. Fetch recent 7-day average metrics for the user
  const metricsQuery = `
    SELECT 
      ROUND(AVG(steps), 0) AS avg_steps,
      ROUND(AVG(sleep_hours), 1) AS avg_sleep,
      ROUND(AVG(water_intake), 0) AS avg_water
    FROM health_data
    WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days';
  `;

  const { rows } = await db.query(metricsQuery, [userId]);
  const stats = rows[0] || {};

  const avgSteps = parseFloat(stats.avg_steps) || 0;
  const avgSleep = parseFloat(stats.avg_sleep) || 0;
  const avgWater = parseFloat(stats.avg_water) || 0;

  const newRecommendations = [];

  // Rule 1: Sleep evaluation
  if (avgSleep > 0 && avgSleep < 7.0) {
    newRecommendations.push({
      category: 'Sleep',
      title: 'Sleep Deficit Warning',
      message: `Your average sleep over the last week is ${avgSleep} hours. Aim for 7–8 hours tonight to boost recovery.`,
      priority: 'high'
    });
  }

  // Rule 2: Physical activity evaluation
  if (avgSteps > 0 && avgSteps < 7500) {
    newRecommendations.push({
      category: 'Activity',
      title: 'Increase Daily Steps',
      message: `You are averaging ${avgSteps} steps daily. Try adding a 15-minute brisk walk to reach the 8,000-step target.`,
      priority: 'medium'
    });
  }

  // Rule 3: Hydration evaluation
  if (avgWater > 0 && avgWater < 2000) {
    newRecommendations.push({
      category: 'Hydration',
      title: 'Hydration Boost Needed',
      message: `Your daily water intake average is ${avgWater} ml. Drink at least 2,000 ml daily to maintain concentration.`,
      priority: 'low'
    });
  }

  // Default recommendation if no issues detected or no data
  if (newRecommendations.length === 0) {
    newRecommendations.push({
      category: 'General',
      title: 'Great Health Balance',
      message: 'Your recent health metrics look solid! Keep up your regular daily routine.',
      priority: 'low'
    });
  }

  // 2. Persist recommendations into database
  for (const rec of newRecommendations) {
    await db.query(
      `INSERT INTO user_recommendations (user_id, category, title, message, priority)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, rec.category, rec.title, rec.message, rec.priority]
    );
  }

  return newRecommendations;
}

/**
 * Retrieves existing active recommendations from database.
 */
async function getStoredRecommendations(userId) {
  const query = `
    SELECT id, category, title, message, priority, created_at 
    FROM user_recommendations 
    WHERE user_id = $1 
    ORDER BY created_at DESC 
    LIMIT 10;
  `;
  const { rows } = await db.query(query, [userId]);
  return rows;
}

module.exports = {
  generateUserRecommendations,
  getStoredRecommendations,
};