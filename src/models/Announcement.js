const { pool } = require('../config/database');

class Announcement {
  static async create({ courseID, title, content, status = 'active' }) {
    const query = `
      INSERT INTO "tblAnnouncement" ("courseID", "title", "content", "status", "created_at")
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;
    const result = await pool.query(query, [courseID, title, content, status]);
    return result.rows[0];
  }

  static async findByCourse(courseID) {
    const query = `SELECT * FROM "tblAnnouncement" WHERE "courseID" = $1 ORDER BY "created_at" DESC`;
    const result = await pool.query(query, [courseID]);
    return result.rows;
  }

  static async findByCourseOwner(userID, status = ['draft', 'wait_for_approval', 'active', 'inactive']) {
    const query = `
        SELECT a.*, c.title FROM "tblAnnouncement" a
        LEFT JOIN "tblCourse" c ON a."courseID" = c."courseID"
        WHERE c."userID" = $1 AND a."status" = ANY($2)
        ORDER BY "created_at" DESC
    `;
    const result = await pool.query(query, [userID, status]);
    return result.rows;
  }

  static async findById(announcementID) {
    const query = `SELECT * FROM "tblAnnouncement" WHERE "announcementID" = $1`;
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
    const query = `UPDATE "tblAnnouncement" SET ${updates.join(', ')} WHERE "announcementID" = $${count} RETURNING *`;
    values.push(announcementID);

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getAll() {
    const query = `SELECT * FROM "tblAnnouncement" ORDER BY "created_at" DESC`;
    const result = await pool.query(query);
    return result.rows;
  }

  static async delete(announcementID) {
    const query = `DELETE FROM "tblAnnouncement" WHERE "announcementID" = $1 RETURNING *`;
    const result = await pool.query(query, [announcementID]);
    return result.rows[0];
  }

  static async getNotificationRecipients(courseID) {
    const query = `
      SELECT u."email", u."firstName", u."notificationEnabled"
      FROM "tblUser" u
      JOIN "tblEnrolment" e ON u."userID" = e."userID"
      WHERE e."courseID" = $1
    `;
    const result = await pool.query(query, [courseID]);
    return result.rows;
  }
}

module.exports = Announcement;
