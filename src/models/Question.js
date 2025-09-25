const { pool } = require('../config/database');

class Question {
    static async create({ quizID, questionNumber, questionText, status }) {
        const query = `
        INSERT INTO "Question" ("quizID", "questionNumber", "questionText", "status", "created_at")
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING "questionID", "quizID", "questionNumber", "questionText", "status", "created_at"
        `;
        const result = await pool.query(query, [quizID, questionNumber, questionText, status]);
        return result.rows[0];
    }

    static async findById(questionID, client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "Question" WHERE "questionID" = $1 AND "status" = 'active'`;
        const result = await db.query(query, [questionID]);
        return result.rows[0];
    }

    static async findByQuizId(quizID, client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "Question" WHERE "quizID" = $1 AND "status" = 'active' ORDER BY "questionNumber" DESC`;
        const result = await db.query(query, [quizID]);
        return result.rows;
    }

    static async findByQuizIdQuestionNumber(quizId, questionNumber, client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "Question" WHERE "quizID" = $1 AND "questionNumber" = $2 AND "status" = 'active'`;
        const result = await db.query(query, [quizId, questionNumber]);
        return result.rows[0];
    }

    static async update(questionID, updateData, client = null) {
        const db = client || pool;
        const allowedFields = ['questionNumber', 'questionText', 'status'];
        const updates = [];
        const values = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key) && value !== undefined) {
                updates.push(`"${key}" = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        };

        if (updates.length === 0) throw new Error('No valid fields to update');

        updates.push(`"updated_at" = NOW()`);
        values.push(questionID);

        const query = `
        UPDATE "Question"
        SET ${updates.join(', ')}
        WHERE "questionID" = $${paramCount}
        RETURNING *
        `;
        const result = await db.query(query, values);
        return result.rows[0];
    }
}

module.exports = Question;
