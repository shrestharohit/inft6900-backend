const { pool } = require('../config/database');

class Module {
    // Pathway to be added in Sprint 2
    static async create({ courseid, title, description, status='draft' }) {
        const query = `
            INSERT INTO "Module" ("courseid", "title", "description", "status", "created_at")
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING "moduleid", "courseid", "title", "description", "status", "created_at"
        `;
        const result = await pool.query(query, [courseid, title, description, status]);
        return result.rows[0];
    }

    static async findByCourseId(courseid) {
        const query = 'SELECT * FROM "Module" WHERE "courseid" = $1';
        const result = await pool.query(query, [courseid]);
        return result.rows[0];
    }

    static async findById(id) {
        const query = `
            SELECT * FROM "Module" WHERE "moduleid" = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async update(id, updateData) {
        const allowedFields = ['courseid', 'title', 'description', 'status'];
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
            UPDATE "Module"
            SET ${updates.join(', ')}
            WHERE "moduleid" = $${paramCount}
            RETURNING "moduleid", "courseid", "title", "description", "status", "updated_at"
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async getAll() {
        const query = `
            SELECT * FROM "Module" ORDER BY "created_at" DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }

}

module.exports = Module;
