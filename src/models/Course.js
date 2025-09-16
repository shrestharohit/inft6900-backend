const { pool } = require('../config/database');

class Course {
    // Pathway to be added in Sprint 2
    static async create({ ownerid, title, level, description, status='draft' }) {
        const query = `
            INSERT INTO "Course" ("ownerid", "title", "level", "description", "status", "created_at")
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING "courseid", "ownerid", "title", "level", "description", "status", "created_at"
        `;
        const result = await pool.query(query, [ownerid, title, level, description, status]);
        return result.rows[0];
    }

    static async findByTitle(title) {
        const query = 'SELECT * FROM "Course" WHERE "title" = $1';
        const result = await pool.query(query, [title]);
        return result.rows[0];
    }

    static async findById(id) {
        const query = `
            SELECT * FROM "Course" WHERE "courseid" = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async findByOwnerId(ownerid) {
        const query = `
            SELECT * FROM "Course" WHERE "ownerid" = $1
        `;
        const result = await pool.query(query, [ownerid]);
        return result.rows[0];
    }

    static async update(id, updateData) {
        const allowedFields = ['ownerid', 'title', 'level', 'description', 'status'];
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

        if (updates.length === 0) {
            throw new Error('No valid fields to update');
        }

        updates.push(`"updated_at" = NOW()`);
        values.push(id);

        const query = `
            UPDATE "Course"
            SET ${updates.join(', ')}
            WHERE "courseid" = $${paramCount}
            RETURNING "courseid", "ownerid", "title", "level", "description", "status", "updated_at"
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async getAll() {
        const query = `
            SELECT * FROM "Course" ORDER BY "created_at" DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }

}

module.exports = Course;
