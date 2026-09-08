const pool = require('../config/db');

/**
 * Retrieves relevant context embeddings using pgvector cosine distance,
 * with automatic fallback to standard SQL if vector search fails or returns empty.
 */
async function getUserContext(userId, queryEmbedding, limit = 3) {
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
    console.warn('pgvector retrieval fallback triggered:', error.message);
  }

  // Fallback: Query recent daily metrics if vector embeddings are empty/unconfigured
  const fallbackQuery = `
    SELECT record_date, steps, sleep_hours, heart_rate, calories_burned
    FROM health_metrics
    WHERE user_id = $1
    ORDER BY record_date DESC
    LIMIT $3;
  `;
  const fallbackResult = await pool.query(fallbackQuery, [userId, limit]);
  return fallbackResult.rows;
}

module.exports = { getUserContext };