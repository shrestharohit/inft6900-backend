const { pool } = require('../config/database');

class User {
  static async create({ name, email, password }) {
    const query = `
      INSERT INTO users (name, email, password, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, name, email, created_at
    `;
    
    const result = await pool.query(query, [name, email, password]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, name, email, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getAll() {
    const query = 'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = User;