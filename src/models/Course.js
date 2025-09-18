const { pool } = require('../config/database');

class Course {
    // Pathway to be added in Sprint 2
    static async create({ ownerID, title, category, level, outline, status='draft' }) {
        const query = `
            INSERT INTO "Course" ("ownerID", "title", "category", "level", "outline", "status", "created_at")
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING "courseID", "ownerID", "title", "category", "outline", "status", "created_at"
        `;
        const result = await pool.query(query, [ownerID, title, category, level, outline, status]);
        return result.rows[0];
    }

    static async findByTitle(title) {
        const query = 'SELECT * FROM "Course" WHERE "title" = $1';
        const result = await pool.query(query, [title]);
        return result.rows[0];
    }

    static async findById(id) {
        const query = `
            SELECT * FROM "Course" WHERE "courseID" = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async findByCategory(category) {
        const query = `
            SELECT * FROM "Course" WHERE "category" = $1
        `;
        const result = await pool.query(query, [ownerID]);
        return result.rows[0];
    }

    static async findByOwnerId(ownerID) {
        const query = `
            SELECT * FROM "Course" WHERE "ownerID" = $1
        `;
        const result = await pool.query(query, [ownerID]);
        return result.rows[0];
    }

    static async update(id, updateData) {
        const allowedFields = ['ownerID', 'title', 'category', 'level', 'outline', 'status'];
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
            WHERE "courseID" = $${paramCount}
            RETURNING "courseID", "ownerID", "title", "category", "level", "outline", "status", "updated_at"
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async getAllCategories() {
        const query = `
            SELECT DISTINCT "category" FROM "Course"
        `;
        const result = await pool.query(query);
        return result.rows;
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
