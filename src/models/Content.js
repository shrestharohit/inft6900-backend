const { pool } = require('../config/database');

class Content {
    // Pathway to be added in Sprint 2
    static async create({ moduleid, title, description, contenttype, pagenumber, status='draft'  }) {
        const query = `
            INSERT INTO "Content" ("moduleid", "title", "description", "contenttype", "pagenumber", "status", "created_at")
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING "contentid", "moduleid", "title", "description", "contenttype", "pagenumber", "status", "created_at"
        `;
        const result = await pool.query(query, [moduleid, title, description, contenttype, pagenumber, status]);
        return result.rows[0];
    }

    static async findByModuleId(moduleid) {
        const query = `SELECT * FROM "Content" WHERE "moduleid" = $1
        `;
        const result = await pool.query(query, [moduleid]);
        return result.rows;
    }

    static async findById(contentid) {
        const query = `SELECT * FROM "Content" WHERE "contentid" = $1
        `;
        const result = await pool.query(query, [contentid]);
        return result.rows[0];
    }

    static async update(contentid, updateData) {
        const allowedFields = ['title', 'description', 'contenttype', 'pagenumber', 'status'];
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
        values.push(contentid);

        const query = `
        UPDATE "Content"
        SET ${updates.join(', ')}
        WHERE "contentid" = $${paramCount}
        RETURNING "contentid", "moduleid", "title", "description", "contenttype", "pagenumber", "status", "updated_at"
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
