const { pool } = require('../config/database');

class QuizAttempt {
    static async start({ quizID, enrolmentID }, client = null) {
        const db = client || pool;
        const query = `
        INSERT INTO "QuizAttempt" ("quizID", "enrolmentID", "count", "startTime")
        SELECT
            $1 AS "quizID", 
            $2 AS "enrolmentID",
            COALESCE((
                SELECT COUNT(*) FROM "QuizAttempt" 
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
        UPDATE "QuizAttempt"
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
        SELECT * FROM "QuizAttempt" WHERE "attemptID" = $1
        `;
        const result = await db.query(query, [attemptID]);
        return result.rows[0];
    }

    static async findByQuizId(quizID, client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "QuizAttempt" WHERE "quizID" = $1`;
        const result = await db.query(query, [quizID]);
        return result.rows;
    }

    static async findByUserModule(userID, moduleID, client = null) {
        const db = client || pool;
        const query = `
        SELECT a.* FROM "QuizAttempt" a
        LEFT JOIN "Quiz" q ON a."quizID" = q."quizID"
        LEFT JOIN "Module" m ON m."moduleID" = q."moduleID"
        LEFT JOIN "Enrolment" e ON m."courseID" = e."courseID"
        WHERE e."userID" = $1 AND m."moduleID" = $2
        `;
        const result = await db.query(query, [userID, moduleID]);
        return result.rows;
    }

    static async findByUserCourse(userID, courseID, client = null) {
        const db = client || pool;
        const query = `
        SELECT a.* FROM "QuizAttempt" a
        LEFT JOIN "Quiz" q ON a."quizID" = q."quizID"
        LEFT JOIN "Module" m ON m."moduleID" = q."moduleID"
        LEFT JOIN "Enrolment" e ON m."courseID" = e."courseID"
        WHERE e."userID" = $1 AND m."moduleID" = $2
        `;
        const result = await db.query(query, [userID, courseID]);
        return result.rows;
    }


    // static async update(attemptID, updateData, client = null) {
    //     const db = client || pool;
    //     const allowedFields = ['score', 'passed'];
    //     const updates = [];
    //     const values = [];
    //     let paramCount = 1;

    //     for (const [key, value] of Object.entries(updateData)) {
    //         if (allowedFields.includes(key) && value !== undefined) {
    //             updates.push(`"${key}" = $${paramCount}`);
    //             values.push(value);
    //             paramCount++;
    //         }
    //     };

    //     if (updates.length === 0) throw new Error('No valid fields to update');

    //     updates.push(`"endTime" = NOW()`);
    //     values.push(attemptID);

    //     const query = `
    //     UPDATE "QuizAttemp"
    //     SET ${updates.join(', ')}
    //     WHERE "attemptID" = $${paramCount}
    //     RETURNING *
    //     `;
    //     const result = await db.query(query, values);
    //     return result.rows[0];
    // }
}

module.exports = QuizAttempt;
