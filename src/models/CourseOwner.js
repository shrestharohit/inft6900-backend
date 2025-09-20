const { pool } = require('../config/database');

class CourseOwner {
    // Pathway to be added in Sprint 2
    static async create({ ownerID, department }) {
        const query = `
            INSERT INTO "CourseOwner" ("ownerID", "department", "created_at")
            VALUES ($1, $2, NOW())
            RETURNING "ownerID", "department", "created_at"
        `;
        const result = await pool.query(query, [ownerID, department]);
        return result.rows[0];
    }

    static async findByDepartment(department) {
        const query = 'SELECT * FROM "CourseOwner" WHERE "department" = $1';
        const result = await pool.query(query, [department]);
        return result.rows[0];
    }

    static async findById(id) {
        const query = `
            SELECT * FROM "CourseOwner" WHERE "ownerID" = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async update(id, updateData) {
        const allowedFields = ['department'];
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
            UPDATE "CourseOwner"
            SET ${updates.join(', ')}
            WHERE "ownerID" = $${paramCount}
            RETURNING "ownerID", "department", "updated_at"
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async getAll() {
        const query = `
            SELECT * FROM "CourseOwner" ORDER BY "created_at" DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }

}

module.exports = CourseOwner;
