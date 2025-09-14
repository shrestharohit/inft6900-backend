const { pool } = require('../config/database');

class User {
  static async create({ firstName, lastName, email, passwordHash, role = 'learner' }) {
    const query = `
      INSERT INTO "User" (firstName, lastName, email, passwordHash, role, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING userID, firstName, lastName, email, role, created_at
    `;
    
    const result = await pool.query(query, [firstName, lastName, email, passwordHash, role]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM "User" WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT userID, firstName, lastName, email, role, created_at FROM "User" WHERE userID = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, updateData) {
    const allowedFields = ['firstName', 'lastName', 'email', 'role'];
    const updates = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`"${key}" = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE "User" 
      SET ${updates.join(', ')}
      WHERE userID = $${paramCount}
      RETURNING userID, firstName, lastName, email, role, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getAll() {
    const query = 'SELECT userID, firstName, lastName, email, role, created_at FROM "User" ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = User;