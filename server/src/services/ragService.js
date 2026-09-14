const pool = require('../config/db');

/**
 * Retrieves context embeddings via pgvector cosine distance,
 * with safe error handling to prevent 500 crashes if columns/tables differ.
 */
async function getUserContext(userId, queryEmbedding, limit = 3) {
  // 1. Try pgvector similarity query
  try {
    if (queryEmbedding && Array.isArray(queryEmbedding) && queryEmbedding.length > 0) {
      const vectorQuery = `
        SELECT content, metadata, 1 - (embedding <=> $1::vector) AS similarity
        FROM user_health_embeddings
        WHERE user_id = $2
        ORDER BY embedding <=> $1::vector ASC
        LIMIT $3;
      `;
      const vectorResult = await pool.query(vectorQuery, [
        JSON.stringify(queryEmbedding),
        userId,
        limit
      ]);

      if (vectorResult.rows.length > 0) {
        return vectorResult.rows;
      }
    }
  } catch (error) {
    console.warn('pgvector retrieval fallback:', error.message);
  }

  // 2. Safe table fallback: uses SELECT * and orders by primary key 'id'
  try {
    const fallbackQuery = `
      SELECT *
      FROM health_metrics
      WHERE user_id = $1
      ORDER BY id DESC
      LIMIT $2;
    `;
    const fallbackResult = await pool.query(fallbackQuery, [userId, limit]);
    return fallbackResult.rows;
  } catch (error) {
    console.warn('health_metrics query skipped:', error.message);
    return []; // Return empty context so Gemini execution proceeds cleanly
  }
}

module.exports = { getUserContext };