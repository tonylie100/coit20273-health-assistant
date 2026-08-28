require('dotenv').config();
const db = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates dynamic AI recommendations for a specific user using Gemini API based on recent health metrics.
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

  let newRecommendations = [];

  try {
    const prompt = `
You are an AI Personal Health Assistant. Analyze the following 7-day average health metrics for User ID ${userId}:
- Average Daily Steps: ${avgSteps}
- Average Nightly Sleep: ${avgSleep} hours
- Average Daily Water Intake: ${avgWater} ml

Generate 1 to 3 targeted, actionable health recommendations based on these metrics.
Return strictly a valid JSON array of objects. Do not include markdown tags, preamble, or extra text.

JSON Format required:
[
  {
    "category": "Sleep" | "Activity" | "Hydration" | "General",
    "title": "Concise Warning or Goal Title",
    "message": "Specific insight mentioning metrics and concrete target.",
    "priority": "low" | "medium" | "high"
  }
]
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean markdown code blocks if present and parse JSON
    const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    newRecommendations = JSON.parse(cleanJson);

  } catch (error) {
    console.error('Gemini API Recommendation Error:', error.message);
    newRecommendations.push({
      category: 'General',
      title: 'Health Routine Review',
      message: 'Unable to process dynamic AI insights. Maintain consistent sleep, steps, and water intake.',
      priority: 'low',
    });
  }

  // 2. Persist generated recommendations into PostgreSQL
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