const { pool } = require('../config/database');

class AnswerOption {
    static async create({ questionID, optionText, isCorrect, optionOrder, feedbackText, status }) {
        const query = `
        INSERT INTO "tblAnswerOption" ("questionID", "optionText", "isCorrect", "optionOrder", "feedbackText", "status", "created_at")
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING "optionID", "questionID", "optionText", "isCorrect", "optionOrder", "feedbackText", "status", "created_at"
        `;
        const result = await pool.query(query, [questionID, optionText, isCorrect, optionOrder, feedbackText, status]);
        return result.rows[0];
    }

    static async findById(optionID, client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "tblAnswerOption" WHERE "optionID" = $1`;
        const result = await db.query(query, [optionID]);
        return result.rows[0];
    }

    static async findByQuizId(quizID, client = null) {
        const db = client || pool;
        const query = `
            SELECT o.*, q."quizID" FROM "tblAnswerOption" o
            LEFT JOIN "tblQuestion" q ON o."questionID" = q."questionID"
            WHERE q."quizID" = $1 AND o."status" = 'active' 
            ORDER BY "optionOrder" ASC
        `;
        const result = await db.query(query, [quizID]);
        return result.rows;
    }

    static async findByQuizzes(quizIDs, client = null) {
        const db = client || pool;
        const query = `
            SELECT o.*, q."quizID" FROM "tblAnswerOption" o
            LEFT JOIN "tblQuestion" q ON o."questionID" = q."questionID"
            WHERE q."quizID" = ANY($1) AND o."status" = 'active' 
            ORDER BY "optionOrder" ASC
        `;
        const result = await db.query(query, [quizIDs]);
        return result.rows;
    }

    static async findByQuestionID(questionID, client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "tblAnswerOption" WHERE "questionID" = $1 AND "status" = 'active' ORDER BY "optionOrder" ASC`;
        const result = await db.query(query, [questionID]);
        return result.rows;
    }

    static async findByQuestionIdOptionOrder(questionID, optionOrder, client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "tblAnswerOption" WHERE "questionID" = $1 AND "optionOrder" = $2 AND "status" = 'active'`;
        const result = await db.query(query, [questionID, optionOrder]);
        return result.rows[0];
    }
    
    static async findAnswerForQuestion(questionID, client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "tblAnswerOption" WHERE "questionID" = $1 AND "isCorrect" = true AND "status" = 'active'`;
        const result = await db.query(query, [questionID]);
        return result.rows[0];
    }

    static async update(optionID, updateData, client = null) {
        const db = client || pool;
        const allowedFields = ['optionOrder', 'optionText', 'isCorrect', 'feedbackText', 'status'];
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
        UPDATE "tblAnswerOption"
        SET ${updates.join(', ')}
        WHERE "optionID" = $${paramCount}
        RETURNING "optionID", "questionID", "optionText", "isCorrect", "optionOrder", "feedbackText", "status", "updated_at"
        `;
        const result = await db.query(query, values);
        return result.rows[0];
    }
}

module.exports = AnswerOption;
