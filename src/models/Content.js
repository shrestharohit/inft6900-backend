const { pool } = require('../config/database');

class Content {
    // Create new content
    static async create({ moduleID, title, description, pageNumber, status = 'draft' }) {
        const query = `
            INSERT INTO "Content" 
            ("moduleID", "title", "description", "pageNumber", "status", "created_at")
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING "contentID", "moduleID", "title", "description", "pageNumber", "status", "created_at"
        `;
        const result = await pool.query(query, [moduleID, title, description, pageNumber, status]);
        return result.rows[0];
    }

    static async findByModuleId(moduleID) {
        const query = `SELECT * FROM "Content" WHERE "moduleID" = $1`;
        const result = await pool.query(query, [moduleID]);
        return result.rows;
    }

    static async findById(contentID) {
        const query = `SELECT * FROM "Content" WHERE "contentID" = $1`;
        const result = await pool.query(query, [contentID]);
        return result.rows[0];
    }

    static async update(contentID, updateData) {
        const allowedFields = ['title', 'description', 'pageNumber', 'status'];
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
        values.push(contentID);

        const query = `
            UPDATE "Content"
            SET ${updates.join(', ')}
            WHERE "contentID" = $${paramCount}
            RETURNING "contentID", "moduleID", "title", "description", "pageNumber", "status", "updated_at"
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async getAll() {
        const query = `SELECT * FROM "Content" ORDER BY "created_at" DESC`;
        const result = await pool.query(query);
        return result.rows;
    }
}

module.exports = Content;
