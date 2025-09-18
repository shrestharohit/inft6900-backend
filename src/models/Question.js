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

    static async findById(questionID) {
        const query = `SELECT * FROM "Question" WHERE "questionID" = $1`;
        const result = await pool.query(query, [questionID]);
        return result.rows[0];
    }

    static async findByQuizId(quizID) {
        const query = `SELECT * FROM "Question" WHERE "quizID" = $1 ORDER BY "questionNumber" DESC`;
        const result = await pool.query(query, [quizID]);
        return result.rows;
    }

    static async findByQuizIdQuestionNumber(quizId, questionNumber) {
        const query = `SELECT * FROM "Question" WHERE "quizID" = $1 AND "questionNumber" = $2`;
        const result = await pool.query(query, [quizId, questionNumber]);
        return result.rows[0];
    }

    static async update(questionID, updateData) {
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
        RETURNING "questionID", "quizID", "questionNumber", "questionText", "status", "updated_at"
        `;
        const result = await pool.query(query, values);
        return result.rows[0];
    }
}

module.exports = Question;
