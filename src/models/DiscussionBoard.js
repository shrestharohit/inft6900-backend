const { pool } = require('../config/database');

class DiscussionBoard {
  // Create a post or reply
  static async create({ courseID, userID, title, postText, parentPostID = null }) {
    const result = await pool.query(
      `INSERT INTO "DiscussionBoard" ("courseID", "userID", "title", "postText", "parentPostID")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [courseID, userID, title, postText, parentPostID]
    );
    return result.rows[0];
  }

  // Get by postID
  static async findById(postID) {
    const result = await pool.query(`SELECT * FROM "DiscussionBoard" WHERE "postID" = $1`, [postID]);
    return result.rows[0];
  }

  // Get all posts for a course
  static async findByCourse(courseID) {
    const result = await pool.query(`SELECT * FROM "DiscussionBoard" WHERE "courseID" = $1`, [courseID]);
    return result.rows;
  }

  // Get all posts by a user
  static async findByUser(userID) {
    const result = await pool.query(`SELECT * FROM "DiscussionBoard" WHERE "userID" = $1`, [userID]);
    return result.rows;
  }

  // Update post or reply
  static async update(postID, { title, postText }) {
    const result = await pool.query(
      `UPDATE "DiscussionBoard"
       SET "title" = $1, "postText" = $2, "updated_at" = CURRENT_TIMESTAMP
       WHERE "postID" = $3
       RETURNING *`,
      [title, postText, postID]
    );
    return result.rows[0];
  }

  // Delete post or reply
  static async delete(postID) {
    await pool.query(`DELETE FROM "DiscussionBoard" WHERE "postID" = $1 OR "parentPostID" = $1`, [postID]);
    return true;
  }
}

module.exports = DiscussionBoard;
