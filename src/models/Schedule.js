const { pool } = require('../config/database');

class Schedule {
  static async create({ courseID, moduleID, userID, scheduledDateTime, status = 'active' }) {
    const query = `
      INSERT INTO "Schedule" ("courseID", "moduleID", "userID", "scheduledDateTime", "status", "created_at")
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *;
    `;
    const result = await pool.query(query, [courseID, moduleID, userID, scheduledDateTime, status]);
    return result.rows[0];
  }

  static async findByCourse(courseID) {
    const query = `SELECT * FROM "Schedule" WHERE "courseID" = $1 ORDER BY "scheduledDateTime" ASC`;
    const result = await pool.query(query, [courseID]);
    return result.rows;
  }

  static async findByUser(userID) {
    const query = `SELECT * FROM "Schedule" WHERE "userID" = $1 ORDER BY "scheduledDateTime" ASC`;
    const result = await pool.query(query, [userID]);
    return result.rows;
  }

  static async findById(scheduleID) {
    const query = `SELECT * FROM "Schedule" WHERE "scheduleID" = $1`;
    const result = await pool.query(query, [scheduleID]);
    return result.rows[0];
  }

  static async update(scheduleID, { scheduledDateTime, status }) {
    const updates = [];
    const values = [];
    let count = 1;

    if (scheduledDateTime !== undefined) { updates.push(`"scheduledDateTime" = $${count++}`); values.push(scheduledDateTime); }
    if (status !== undefined) { updates.push(`"status" = $${count++}`); values.push(status); }

    updates.push(`"updated_at" = NOW()`);
    const query = `UPDATE "Schedule" SET ${updates.join(', ')} WHERE "scheduleID" = $${count} RETURNING *`;
    values.push(scheduleID);

    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = Schedule;
