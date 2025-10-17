const { pool } = require('../config/database');

class Schedule {
  // Create a new study session
  static async create({ userID, moduleID, date, startTime, endTime }) {
    const query = `
      INSERT INTO "Schedule" ("userID", "moduleID", "date", "startTime", "endTime")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await pool.query(query, [userID, moduleID, date, startTime, endTime]);
    return result.rows[0];
  }

  // Find a schedule by scheduleID
  static async findById(scheduleID) {
    const query = `
      SELECT s.*, m."title" AS "moduleTitle", m."expectedHours"
      FROM "Schedule" s
      JOIN "Module" m ON s."moduleID" = m."moduleID"
      WHERE s."scheduleID" = $1
    `;
    const result = await pool.query(query, [scheduleID]);
    return result.rows[0];
}

  // Get all sessions for a user (optionally by module)
  static async findByUser(userID, moduleID = null) {
    let query = `
      SELECT s.*, m."title" AS "moduleTitle", m."expectedHours"
      FROM "Schedule" s
      JOIN "Module" m ON s."moduleID" = m."moduleID"
      WHERE s."userID" = $1
    `;
    const values = [userID];

    if (moduleID) {
      query += ` AND s."moduleID" = $2`;
      values.push(moduleID);
    }

    query += ` ORDER BY s."date", s."startTime"`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Update a study session
  static async update(scheduleID, { date, startTime, endTime }) {
    const query = `
      UPDATE "Schedule"
      SET 
        "date" = COALESCE($1, "date"),
        "startTime" = COALESCE($2, "startTime"),
        "endTime" = COALESCE($3, "endTime")
      WHERE "scheduleID" = $4
      RETURNING *;
    `;
    const result = await pool.query(query, [date, startTime, endTime, scheduleID]);
    return result.rows[0];
  }

  // Delete a session
  static async delete(scheduleID) {
    const query = `DELETE FROM "Schedule" WHERE "scheduleID" = $1`;
    await pool.query(query, [scheduleID]);
  }

  // Get total scheduled hours per module
  static async getTotalHours(userID, moduleID) {
    const query = `
      SELECT SUM("totalHours") AS "scheduledHours"
      FROM "Schedule"
      WHERE "userID" = $1 AND "moduleID" = $2;
    `;
    const result = await pool.query(query, [userID, moduleID]);
    return result.rows[0].scheduledHours || 0;
  }
}

module.exports = Schedule;
