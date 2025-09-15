const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

const initializeSchema = async () => {
  try {
    const client = await pool.connect();
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await client.query(schemaSQL);
    console.log('✅ Database schema initialized successfully');
    
    client.release();
  } catch (error) {
    // If tables already exist, that's okay - just log it
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Database tables already exist');
    } else {
      console.error('❌ Schema initialization failed:', error.message);
      throw error;
    }
  }
};

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    client.release();
    
    // Initialize schema after successful connection
    await initializeSchema();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, connectDB, initializeSchema };