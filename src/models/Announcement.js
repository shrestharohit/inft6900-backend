const { pool } = require('../config/database');

class Announcement {
  static async create({ courseID, title, content, status = 'active' }) {
    const query = `
      INSERT INTO "Announcement" ("courseID", "title", "content", "status", "created_at")
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;
    const result = await pool.query(query, [courseID, title, content, status]);
    return result.rows[0];
  }

  static async findByCourse(courseID) {
    const query = `SELECT * FROM "Announcement" WHERE "courseID" = $1 ORDER BY "created_at" DESC`;
    const result = await pool.query(query, [courseID]);
    return result.rows;
  }

  static async findById(announcementID) {
    const query = `SELECT * FROM "Announcement" WHERE "announcementID" = $1`;
    const result = await pool.query(query, [announcementID]);
    return result.rows[0];
  }

  static async update(announcementID, { title, content, status }) {
    const updates = [];
    const values = [];
    let count = 1;

    if (title !== undefined) { updates.push(`"title" = $${count++}`); values.push(title); }
    if (content !== undefined) { updates.push(`"content" = $${count++}`); values.push(content); }
    if (status !== undefined) { updates.push(`"status" = $${count++}`); values.push(status); }

    updates.push(`"updated_at" = NOW()`);
    const query = `UPDATE "Announcement" SET ${updates.join(', ')} WHERE "announcementID" = $${count} RETURNING *`;
    values.push(announcementID);

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getAll() {
    const query = `SELECT * FROM "Announcement" ORDER BY "created_at" DESC`;
    const result = await pool.query(query);
    return result.rows;
  }

  static async delete(announcementID) {
    const query = `DELETE FROM "Announcement" WHERE "announcementID" = $1 RETURNING *`;
    const result = await pool.query(query, [announcementID]);
    return result.rows[0];
  }
}

module.exports = Announcement;
