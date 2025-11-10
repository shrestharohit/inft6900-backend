const { pool } = require('../config/database');

class Content {
    // Create new content
    static async create({ moduleID, title, description, pageNumber, status = 'draft'}, client = null) {
        const db = client || pool;
        const query = `
            INSERT INTO "tblContent" 
            ("moduleID", "title", "description", "pageNumber", "status", "created_at")
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING "contentID", "moduleID", "title", "description", "pageNumber", "status", "created_at"
        `;
        const result = await db.query(query, [moduleID, title, description, pageNumber, status]);
        return result.rows[0];
    }

    static async findByModuleId(moduleID, status = ['draft', 'wait_for_approval', 'active'], client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "tblContent" WHERE "moduleID" = $1 AND "status" = ANY($2) ORDER BY "pageNumber" ASC`;
        const result = await db.query(query, [moduleID, status]);
        return result.rows;
    }

    static async findById(contentID, client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "tblContent" WHERE "contentID" = $1`;
        const result = await db.query(query, [contentID]);
        return result.rows[0];
    }

    static async update(contentID, updateData, client = null) {
        const db = client || pool;
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
            UPDATE "tblContent"
            SET ${updates.join(', ')}
            WHERE "contentID" = $${paramCount}
            RETURNING "contentID", "moduleID", "title", "description", "pageNumber", "status", "updated_at"
        `;

        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async getAll(status = ['draft', 'wait_for_approval', 'active'], client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "tblContent" WHERE "status" = ANY($1) ORDER BY "pageNumber" ASC`;
        const result = await db.query(query, [status]);
        return result.rows;
    }
}

module.exports = Content;
