const { pool } = require('../config/database');

class Quiz {
    // Pathway to be added in Sprint 2
    static async create({ courseid, title, description, status = 'draft' }) {
        const query = `
        INSERT INTO "Quiz" (courseid, title, description, status, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING quizid, courseid, title, description, status, created_at
        `;
        const result = await pool.query(query, [courseid, title, description, status]);
        return result.rows[0];
    }

    static async findById(quizid) {
        const query = `SELECT * FROM "Quiz" WHERE quizid = $1`;
        const result = await pool.query(query, [quizid]);
        return result.rows[0];
    }

    static async findByCourse(courseid) {
        const query = `SELECT * FROM "Quiz" WHERE courseid = $1 ORDER BY created_at DESC`;
        const result = await pool.query(query, [courseid]);
        return result.rows;
    }

    static async update(quizid, updateData) {
        const allowedFields = ['title', 'description', 'status'];
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
        RETURNING quizid, courseid, title, description, status, updated_at
        `;
        const result = await pool.query(query, values);
        return result.rows[0];
    }
    }

module.exports = Quiz;
