const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'health_assistant',
  password: 'Health@123',
  port: 5432
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

module.exports = pool;