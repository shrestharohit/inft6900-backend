const { pool } = require('../config/database');

class Course {
    // Pathway to be added in Sprint 2
    static async create({ userID, title, category, level, outline, status='draft' }) {
        const query = `
            INSERT INTO "Course" ("userID", "title", "category", "level", "outline", "status", "created_at")
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING *
        `;
        const result = await pool.query(query, [userID, title, category, level, outline, status]);
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
        const result = await pool.query(query, [userID]);
        return result.rows;
    }

    static async findByOwner(userID) {
        const query = `
            SELECT * FROM "Course" WHERE "userID" = $1
        `;
        const result = await pool.query(query, [userID]);
        return result.rows;
    }

    static async findByStatus(status) {
        const query = `
            SELECT * FROM "Course" WHERE "status" = $1
        `;
        const result = await pool.query(query, [status]);
        return result.rows;
    }

    static async findByUserID(userID) {
        const query = `
            SELECT * FROM "Course" WHERE "userID" = $1
        `;
        const result = await pool.query(query, [userID]);
        return result.rows;
    }

    static async findByPathwayId(pathwayID) {
        const query = `
            SELECT * FROM "Course" WHERE "pathwayID" = $1
        `;
        const result = await pool.query(query, [pathwayID]);
        return result.rows;
    }
    
    static async update(id, updateData) {
        const allowedFields = ['userID', 'title', 'category', 'level', 'outline', 'status'];
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
            RETURNING *
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
