const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'health_assistant_db',
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('🐘 Connected to PostgreSQL Database successfully');
    
    // Attempt to enable pgvector extension safely
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
      console.log('🧠 pgvector extension enabled/verified');
    } catch (vectorErr) {
      console.warn('⚠️  pgvector extension not pre-installed on this local DB instance (Core DB features remain fully active).');
    }
    
    client.release();
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error.message);
  }
};

connectDB();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};