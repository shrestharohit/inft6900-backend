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

    static async findById(optionID) {
        const query = `SELECT * FROM "AnswerOption" WHERE "optionID" = $1`;
        const result = await pool.query(query, [optionID]);
        return result.rows[0];
    }

    static async findByquestionID(questionID) {
        const query = `SELECT * FROM "AnswerOption" WHERE "questionID" = $1 ORDER BY "optionOrder" DESC`;
        const result = await pool.query(query, [questionID]);
        return result.rows;
    }

    static async findByQuestionIdOptionOrder(questionID, optionOrder) {
        const query = `SELECT * FROM "AnswerOption" WHERE "questionID" = $1 AND "optionOrder" = $2`;
        const result = await pool.query(query, [questionID, optionOrder]);
        return result.rows[0];
    }
    
    static async findAnswerForQuestion(questionID) {
        const query = `SELECT * FROM "AnswerOption" WHERE "questionID" = $1 AND "isCorrect" = true`;
        const result = await pool.query(query, [questionID]);
        return result.rows[0];
    }

    static async update(optionID, updateData) {
        const allowedFields = ['optionText', 'isCorrect', 'optionOrder', 'feedbackText', 'status'];
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
        const result = await pool.query(query, values);
        return result.rows[0];
    }
}

module.exports = AnswerOption;
