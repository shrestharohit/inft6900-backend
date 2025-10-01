const { pool } = require('../config/database');

class Certificate {
    // Issue new certificate
    static async create({ userID, courseID, content, certificateURL }) {
        const query = `
            INSERT INTO "Certificate" ("userID", "courseID", "content", "certificateURL", "issueDate")
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING "certificateID", "userID", "courseID", "content", "certificateURL", "issueDate"
        `;
        const result = await pool.query(query, [userID, courseID, content, certificateURL]);
        return result.rows[0];
    }

    // Get all certificates of a user
    static async findByUserId(userID) {
        const query = `SELECT * FROM "Certificate" WHERE "userID" = $1 ORDER BY "issueDate" DESC`;
        const result = await pool.query(query, [userID]);
        return result.rows;
    }

    // Get all certificates for a course
    static async findByCourseId(courseID) {
        const query = `SELECT * FROM "Certificate" WHERE "courseID" = $1 ORDER BY "issueDate" DESC`;
        const result = await pool.query(query, [courseID]);
        return result.rows;
    }

    // Get certificate by ID
    static async findById(certificateID) {
        const query = `SELECT * FROM "Certificate" WHERE "certificateID" = $1`;
        const result = await pool.query(query, [certificateID]);
        return result.rows[0];
    }

    // Update certificate
    static async update(certificateID, { content, certificateURL }) {
        const query = `
            UPDATE "Certificate"
            SET
                "content" = COALESCE($1, "content"),
                "certificateURL" = COALESCE($2, "certificateURL"),
                "issueDate" = CURRENT_DATE
            WHERE "certificateID" = $3
            RETURNING "certificateID", "userID", "courseID", "content", "certificateURL", "issueDate"
        `;
        const result = await pool.query(query, [content, certificateURL, certificateID]);
    return result.rows[0];
    }
}

module.exports = Certificate;
