require('dotenv').config();
const db = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getUserContext } = require('./ragService');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates dynamic AI recommendations using Google Gemini API,
 * incorporating current metrics and pgvector RAG historical context.
 */
async function generateUserRecommendations(userId, options = {}) {
  const { metrics, queryEmbedding } = options;

  let avgSteps = 0;
  let avgSleep = 0;
  let avgWater = 0;

  // 1. Use passed body metrics if available; fallback to 7-day DB averages
  if (metrics && (metrics.steps !== undefined || metrics.sleep_hours !== undefined || metrics.water_intake !== undefined)) {
    avgSteps = parseFloat(metrics.steps) || 0;
    avgSleep = parseFloat(metrics.sleep_hours || metrics.sleep) || 0;
    avgWater = parseFloat(metrics.water_intake || metrics.water) || 0;
  } else {
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
    avgSteps = parseFloat(stats.avg_steps) || 0;
    avgSleep = parseFloat(stats.avg_sleep) || 0;
    avgWater = parseFloat(stats.avg_water) || 0;
  }

  // 2. Retrieve vector/historical RAG context from pgvector
  const contextRecords = await getUserContext(userId, queryEmbedding);

  let newRecommendations = [];

  try {
    const prompt = `
You are an AI Personal Health and Fitness Coach. Analyze the following health metrics and historical context for User ID ${userId}:

Current Metrics:
- Daily Steps: ${avgSteps}
- Nightly Sleep: ${avgSleep} hours
- Daily Water Intake: ${avgWater} ml

Retrieved User Context / Goal History (RAG):
${JSON.stringify(contextRecords, null, 2)}

Task: Generate 1 to 3 targeted, actionable health, diet (FR5), and exercise (FR6) recommendations tailored to these metrics and context.
Return STRICTLY a valid JSON array of objects. Do not include markdown tags, preamble, or extra text.

Required JSON Schema:
[
  {
    "category": "Sleep" | "Activity" | "Diet" | "Hydration" | "General",
    "title": "Concise Goal or Action Title",
    "message": "Specific, practical recommendation mentioning metrics or past goals.",
    "priority": "low" | "medium" | "high"
  }
]
`;

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean potential markdown blocks and parse JSON payload
    const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    newRecommendations = JSON.parse(cleanJson);

  } catch (error) {
    console.error('Gemini API / RAG Recommendation Error:', error.message);
    newRecommendations = [
      {
        category: 'General',
        title: 'Health Routine Review',
        message: 'Unable to process dynamic AI insights. Maintain consistent sleep, steps, and water intake.',
        priority: 'low',
      }
    ];
  }

  // 3. Persist generated recommendations into PostgreSQL
  for (const rec of newRecommendations) {
    await db.query(
      `INSERT INTO user_recommendations (user_id, category, title, message, priority)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, rec.category || 'General', rec.title || 'Recommendation', rec.message, rec.priority || 'medium']
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