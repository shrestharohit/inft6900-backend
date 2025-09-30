const { pool } = require('../config/database');

class User {
  static async create({ firstName, lastName, email, passwordHash, role }) {
    const query = `
      INSERT INTO "User" ("firstName", "lastName", "email", "passwordHash", "role", "created_at")
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING "userID", "firstName", "lastName", "email", "passwordHash", "role", "created_at"
    `;
    const result = await pool.query(query, [firstName, lastName, email, passwordHash, role]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM "User" WHERE "email" = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT "userID", "firstName", "lastName", "email", "role", "created_at"
      FROM "User" WHERE "userID" = $1
    `;
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

    updates.push(`"updated_at" = NOW()`);
    values.push(id);

    const query = `
      UPDATE "User"
      SET ${updates.join(', ')}
      WHERE "userID" = $${paramCount}
      RETURNING "userID", "firstName", "lastName", "email", "role", "updated_at"
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getAll() {
    const query = `
      SELECT "userID", "firstName", "lastName", "email", "role", "isEmailVerified", "created_at"
      FROM "User" ORDER BY "created_at" DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async deleteById(id) {
    const query = `
      DELETE FROM "User" 
      WHERE "userID" = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
  
  static async getAllNonStudents() {
    const query = `
      SELECT "userID", "firstName", "lastName", "email", "role", "isEmailVerified", "created_at"
      FROM "User" WHERE NOT "role" = 'student'
      ORDER BY "created_at" DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // 🔹 OTP Methods
  static async setOTP(email, otpCode, expiresAt) {
    const query = `
      UPDATE "User"
      SET "otpCode" = $1, "otpExpiresAt" = $2, "updated_at" = NOW()
      WHERE "email" = $3
      RETURNING "userID", "email", "otpCode", "otpExpiresAt"
    `;
    const result = await pool.query(query, [otpCode, expiresAt, email]);
    return result.rows[0];
  }

  static async verifyOTP(email, otpCode) {
    const query = `
      SELECT * FROM "User"
      WHERE "email" = $1 AND "otpCode" = $2 AND "otpExpiresAt" > NOW() AND "isEmailVerified" = FALSE
    `;
    const result = await pool.query(query, [email, otpCode]);
    return result.rows[0];
  }

  static async verifyResetOTP(email, otpCode) {
    const query = `
      SELECT * FROM "User"
      WHERE "email" = $1 AND "otpCode" = $2 AND "otpExpiresAt" > NOW()
    `;
    const result = await pool.query(query, [email, otpCode]);
    return result.rows[0];
  }

  static async markEmailVerified(email) {
    const query = `
      UPDATE "User"
      SET "isEmailVerified" = TRUE, "otpCode" = NULL, "otpExpiresAt" = NULL, "updated_at" = NOW()
      WHERE "email" = $1
      RETURNING "userID", "firstName", "lastName", "email", "role", "isEmailVerified"
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // 🔹 Reset Password
  static async updatePassword(email, newHashedPassword) {
    const query = `
      UPDATE "User"
      SET "passwordHash" = $1, "updated_at" = NOW()
      WHERE "email" = $2
      RETURNING "userID", "firstName", "lastName", "email", "role", "isEmailVerified";
    `;
    const result = await pool.query(query, [newHashedPassword, email]);
    return result.rows[0];
  }

  
}

module.exports = User;
