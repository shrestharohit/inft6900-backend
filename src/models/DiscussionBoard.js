const { pool } = require('../config/database');

class DiscussionBoard {
  // Create new board
  static async create({ courseID, title, status = 'active' }) {
    const query = `
      INSERT INTO "DiscussionBoard" ("courseID", "title", "status", "created_at")
      VALUES ($1, $2, $3, NOW())
      RETURNING *;
    `;
    const result = await pool.query(query, [courseID, title, status]);
    return result.rows[0];
  }

  // Get all boards for a course
  static async findByCourse(courseID) {
    const query = `SELECT * FROM "DiscussionBoard" WHERE "courseID" = $1 ORDER BY "created_at" DESC;`;
    const result = await pool.query(query, [courseID]);
    return result.rows;
  }

  // Find by ID
  static async findById(boardID) {
    const query = `SELECT * FROM "DiscussionBoard" WHERE "boardID" = $1;`;
    const result = await pool.query(query, [boardID]);
    return result.rows[0];
  }

  // Update board
  static async update(boardID, updateData) {
    const allowedFields = ['title', 'status'];
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

    if (updates.length === 0) throw new Error('No valid fields to update');

    updates.push(`"updated_at" = NOW()`);
    values.push(boardID);

    const query = `
      UPDATE "DiscussionBoard"
      SET ${updates.join(', ')}
      WHERE "boardID" = $${paramCount}
      RETURNING *;
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(boardID) {
    const query = `DELETE FROM "DiscussionBoard" WHERE "boardID" = $1 RETURNING *`;  // ✅ correct table name
    const result = await pool.query(query, [boardID]);
    return result.rows[0];
  } 
}

module.exports = DiscussionBoard;
