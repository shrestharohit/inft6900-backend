const { pool } = require('../config/database');

class Discussion {
  // Create post or reply
  static async create({ courseID, userID, title, postText, parentPostID = null }) {
    const query = `
      INSERT INTO "Discussion" ("courseID", "userID", "title", "postText", "parentPostID", "created_at")
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *;
    `;
    const result = await pool.query(query, [courseID, userID, title, postText, parentPostID]);
    return result.rows[0];
  }

  // Find all posts for a course
  static async findByCourse(courseID) {
    const query = `
      SELECT * FROM "Discussion"
      WHERE "courseID" = $1
      ORDER BY "created_at" DESC;
    `;
    const result = await pool.query(query, [courseID]);
    return result.rows;
  }

  // Find a single post by ID
  static async findById(postID) {
    const query = `SELECT * FROM "Discussion" WHERE "postID" = $1;`;
    const result = await pool.query(query, [postID]);
    return result.rows[0];
  }

  // Update a post
  static async update(postID, { title, postText }) {
    const updates = [];
    const values = [];
    let count = 1;

    if (title !== undefined) { updates.push(`"title" = $${count++}`); values.push(title); }
    if (postText !== undefined) { updates.push(`"postText" = $${count++}`); values.push(postText); }

    if (updates.length === 0) throw new Error('No valid fields to update');

    updates.push(`"updated_at" = NOW()`);
    values.push(postID);

    const query = `UPDATE "Discussion" SET ${updates.join(', ')} WHERE "postID" = $${count} RETURNING *;`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete a post (replies cascade)
  static async delete(postID) {
    const query = `DELETE FROM "Discussion" WHERE "postID" = $1;`;
    await pool.query(query, [postID]);
  }

  // Find all posts by a user
  static async findByUser(userID) {
    const query = `
      SELECT * FROM "Discussion"
      WHERE "userID" = $1
      ORDER BY "created_at" DESC;
    `;
    const result = await pool.query(query, [userID]);
    return result.rows;
  }
}

module.exports = Discussion;
