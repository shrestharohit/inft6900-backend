const { pool } = require('../config/database');

class BoardPost {
  // Create new post
  static async create({ boardID, userID, title, postText, status = 'draft' }) {
    const query = `
      INSERT INTO "BoardPost" ("boardID", "userID", "title", "postText", "status", "created_at")
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *;
    `;
  const result = await pool.query(query, [boardID, userID, title, postText, status]);
}
  
  // Get all posts in a board
  static async findByBoard(boardID) {
    const query = `SELECT * FROM "BoardPost" WHERE "boardID" = $1 ORDER BY "created_at" DESC;`;
    const result = await pool.query(query, [boardID]);
    return result.rows;
  }

  // Find post by ID
  static async findById(postID) {
    const query = `SELECT * FROM "BoardPost" WHERE "postID" = $1;`;
    const result = await pool.query(query, [postID]);
    return result.rows[0];
  }

  // Update post
  static async update(postID, updateData) {
    const allowedFields = ['title', 'postText', 'status'];
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
    values.push(postID);

    const query = `
      UPDATE "BoardPost"
      SET ${updates.join(', ')}
      WHERE "postID" = $${paramCount}
      RETURNING *;
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete post
  static async delete(postID) {
    const query = `DELETE FROM "BoardPost" WHERE "postID" = $1 RETURNING *`;
    const result = await pool.query(query, [postID]);
    return result.rows[0];
  }
}

module.exports = BoardPost;
