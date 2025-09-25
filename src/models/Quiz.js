const { pool } = require('../config/database');

class Quiz {
    static async create({ moduleID, title, timeLimit, status }) {
        const query = `
        INSERT INTO "Quiz" ("moduleID", title, "timeLimit", "status", "created_at")
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING "quizID", "moduleID", title, "timeLimit", "status", "created_at"
        `;
        const result = await pool.query(query, [moduleID, title, timeLimit, status]);
        return result.rows[0];
    }

    static async findById(quizID, client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "Quiz" WHERE "quizID" = $1`;
        const result = await db.query(query, [quizID]);
        return result.rows[0];
    }

    static async findByModuleID(moduleID, client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "Quiz" WHERE "moduleID" = $1 ORDER BY "created_at" DESC`;
        const result = await db.query(query, [moduleID]);
        return result.rows[0];
    }

    static async findByCourseID(courseID, client = null) {
        const db = client || pool;
        const query = `
        SELECT a.* FROM "Quiz" a
        LEFT JOIN "Module" m ON a."moduleID" = m."moduleID"
        WHERE m."courseID" = $1 
        ORDER BY m."moduleNumber" DESC
        `;
        const result = await db.query(query, [courseID]);
        return result.rows;
    }

    static async update(quizID, updateData, client = null) {
        const db = client || pool;
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

        updates.push(`"updated_at" = NOW()`);
        values.push(quizID);

        const query = `
        UPDATE "Quiz"
        SET ${updates.join(', ')}
        WHERE "quizID" = $${paramCount}
        RETURNING "quizID", "moduleID", "title", "timeLimit", "status", "updated_at"
        `;
        const result = await db.query(query, values);
        return result.rows[0];
    };

    static async delete(quizID, client = null) {
        const db = client || pool;
        const query = `DELETE FROM "Quiz" WHERE "quizID" = $1`;
        await db.query(query, [quizID]);
        return `Quiz ID {$quizID} is successfully deleted`;
    }

}

module.exports = Quiz;
