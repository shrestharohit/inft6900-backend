const { pool } = require('../config/database');

class AnswerOption {
    static async create({ questionID, optionText, isCorrect, optionOrder, feedbackText, status }) {
        const query = `
        INSERT INTO "AnswerOption" ("questionID", "optionText", "isCorrect", "optionOrder", "feedbackText", "status", "created_at")
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING "optionID", "questionID", "optionText", "isCorrect", "optionOrder", "feedbackText", "status", "created_at"
        `;
        const result = await pool.query(query, [questionID, optionText, isCorrect, optionOrder, feedbackText, status]);
        return result.rows[0];
    }

    static async findById(optionID, client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "AnswerOption" WHERE "optionID" = $1`;
        const result = await db.query(query, [optionID]);
        return result.rows[0];
    }

    static async findByQuestionID(questionID, client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "AnswerOption" WHERE "questionID" = $1 AND "status" = 'active' ORDER BY "optionOrder" DESC`;
        const result = await db.query(query, [questionID]);
        return result.rows;
    }

    static async findByQuestionIdOptionOrder(questionID, optionOrder, client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "AnswerOption" WHERE "questionID" = $1 AND "optionOrder" = $2 AND "status" = 'active'`;
        const result = await db.query(query, [questionID, optionOrder]);
        return result.rows[0];
    }
    
    static async findAnswerForQuestion(questionID, client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "AnswerOption" WHERE "questionID" = $1 AND "isCorrect" = true AND "status" = 'active'`;
        const result = await db.query(query, [questionID]);
        return result.rows[0];
    }

    static async update(optionID, updateData, client = null) {
        const db = client || pool;
        const allowedFields = ['optionText', 'isCorrect', 'feedbackText', 'status'];
        const updates = [];
        const values = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key) && value !== undefined) {
                updates.push(`"${key}" = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        }

        if (updates.length === 0) throw new Error('No valid fields to update');

        updates.push(`updated_at = NOW()`);
        values.push(optionID);

        const query = `
        UPDATE "AnswerOption"
        SET ${updates.join(', ')}
        WHERE "optionID" = $${paramCount}
        RETURNING "optionID", "questionID", "optionText", "isCorrect", "optionOrder", "feedbackText", "status", "updated_at"
        `;
        const result = await db.query(query, values);
        return result.rows[0];
    }
}

module.exports = AnswerOption;
