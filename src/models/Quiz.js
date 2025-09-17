const { pool } = require('../config/database');

class Quiz {
    // Pathway to be added in Sprint 2
    static async create({ moduleid, title, timelimit, status }) {
        const query = `
        INSERT INTO "Quiz" (moduleid, title, timelimit, status, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING quizid, moduleid, title, timelimit, status, created_at
        `;
        const result = await pool.query(query, [moduleid, title, timelimit, status]);
        return result.rows[0];
    }

    static async findById(quizid) {
        const query = `SELECT * FROM "Quiz" WHERE quizid = $1`;
        const result = await pool.query(query, [quizid]);
        return result.rows[0];
    }

    static async findByModule(moduleid) {
        const query = `SELECT * FROM "Quiz" WHERE moduleid = $1 ORDER BY created_at DESC`;
        const result = await pool.query(query, [moduleid]);
        return result.rows;
    }

    static async update(quizid, updateData) {
        const allowedFields = ['title', 'timeLimit', 'status'];
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
        values.push(quizid);

        const query = `
        UPDATE "Quiz"
        SET ${updates.join(', ')}
        WHERE quizid = $${paramCount}
        RETURNING quizid, moduleid, title, timelimit, status, updated_at
        `;
        const result = await pool.query(query, values);
        return result.rows[0];
    }
    }

module.exports = Quiz;
