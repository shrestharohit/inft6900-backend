const { pool } = require('../config/database');

class QuizAttempt {
    static async start({ quizID, enrolmentID }, client = null) {
        const db = client || pool;
        const query = `
        INSERT INTO "tblQuizAttempt" ("quizID", "enrolmentID", "count", "startTime")
        SELECT
            $1 AS "quizID", 
            $2 AS "enrolmentID",
            COALESCE((
                SELECT COUNT(*) FROM "tblQuizAttempt" 
                WHERE "quizID" = $1 AND "enrolmentID" = $2
            ), 0) + 1 AS "count",
            NOW() AS  "startTime"
        RETURNING *
        `;
        const result = await db.query(query, [quizID, enrolmentID]);
        return result.rows[0];
    }

    static async submit({ attemptID, score, passed }, client = null) {
        const query = `
        UPDATE "tblQuizAttempt"
        SET
            "score" = $2, 
            "passed" = $3,
            "endTime" = NOW()
        WHERE "attemptID" = $1
        RETURNING *
        `;
        const result = await pool.query(query, [attemptID, score, passed]);
        return result.rows[0];
    }

    static async findById(attemptID, client = null) {
        const db = client || pool;
        const query = `
        SELECT * FROM "tblQuizAttempt" WHERE "attemptID" = $1
        `;
        const result = await db.query(query, [attemptID]);
        return result.rows[0];
    }

    static async findByQuizId(quizID, client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "tblQuizAttempt" WHERE "quizID" = $1`;
        const result = await db.query(query, [quizID]);
        return result.rows;
    }

    static async findByUserModule(userID, moduleID, client = null) {
        const db = client || pool;
        const query = `
        SELECT a.*, m."title" as "moduleName" FROM "tblQuizAttempt" a
        LEFT JOIN "tblQuiz" q ON a."quizID" = q."quizID"
        LEFT JOIN "tblModule" m ON m."moduleID" = q."moduleID"
        LEFT JOIN "tblEnrolment" e ON e."enrolmentID" = a."enrolmentID"
        WHERE e."userID" = $1 AND m."moduleID" = $2
        ORDER BY a."count" ASC
        `;
        const result = await db.query(query, [userID, moduleID]);
        return result.rows;
    }

    static async findByUserCourse(userID, courseID, client = null) {
        const db = client || pool;
        const query = `
        SELECT a.* FROM "tblQuizAttempt" a
        LEFT JOIN "tblEnrolment" e ON e."enrolmentID" = a."enrolmentID"
        WHERE e."userID" = $1 AND e."courseID" = $2
        `;
        const result = await db.query(query, [userID, courseID]);
        return result.rows;
    }

    static async findByEnrolments(enrolmentIDs, client = null) {
        const db = client || pool;
        const query = `
        SELECT a.* FROM "tblQuizAttempt" a
        WHERE a."enrolmentID" = ANY($1)
        `;
        const result = await db.query(query, [enrolmentIDs]);
        return result.rows;
    }

    static async getAll(client = null) {
        const db = client || pool;
        const query = `
        SELECT a.* FROM "tblQuizAttempt" a
        `;
        const result = await db.query(query);
        return result.rows;
    }

}

module.exports = QuizAttempt;
