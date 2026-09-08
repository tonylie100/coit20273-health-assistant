const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate vector embedding from Gemini
 */
const generateEmbedding = async (text) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });
  const result = await model.embedContent({
    content: { role: 'user', parts: [{ text }] },
    outputDimensionality: 768,
  });
  return result.embedding.values; // Reduced length: 768
};

/**
 * Save health log and its vector embedding to PostgreSQL
 */
const storeHealthLogEmbedding = async (userId, logText, category = 'general') => {
  const vector = await generateEmbedding(logText);
  const vectorString = `[${vector.join(',')}]`;

  const query = `
    INSERT INTO health_log_embeddings (user_id, log_text, category, embedding)
    VALUES ($1, $2, $3, $4::vector)
    RETURNING id, log_text, category, created_at;
  `;

  const result = await db.query(query, [userId, logText, category, vectorString]);
  return result.rows[0];
};

/**
 * Perform semantic search over health logs
 */
const findSimilarHealthLogs = async (userId, queryText, limit = 5) => {
  const queryVector = await generateEmbedding(queryText);
  const vectorString = `[${queryVector.join(',')}]`;

  const query = `
    SELECT id, log_text, category, created_at,
           1 - (embedding <=> $1::vector) AS similarity_score
    FROM health_log_embeddings
    WHERE user_id = $2
    ORDER BY embedding <=> $1::vector ASC
    LIMIT $3;
  `;

  const result = await db.query(query, [vectorString, userId, limit]);
  return result.rows;
};

module.exports = {
  generateEmbedding,
  storeHealthLogEmbedding,
  findSimilarHealthLogs,
};