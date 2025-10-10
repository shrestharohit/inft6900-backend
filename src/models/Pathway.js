const { pool } = require('../config/database');

class Pathway {
    // Create new pathway
    static async create({ name, outline, status = 'draft' }) {
        const query = `
            INSERT INTO "Pathway" ("name", "outline", "status", "createdDate")
            VALUES ($1, $2, $3, NOW())
            RETURNING "pathwayID", "name", "outline", "status", "createdDate"
        `;
        const result = await pool.query(query, [name, outline, status]);
        return result.rows[0];
    }

    // Find pathway by ID
    static async findById(pathwayID) {
        const query = `SELECT * FROM "Pathway" WHERE "pathwayID" = $1`;
        const result = await pool.query(query, [pathwayID]);
        return result.rows[0];
    }

    // Find pathways by status
    static async findByStatus(status) {
        const query = `SELECT * FROM "Pathway" WHERE "status" = $1 ORDER BY "createdDate" DESC`;
        const result = await pool.query(query, [status]);
        return result.rows;
    }

    // Get detailed pathway
    static async getDetail(pathwayID) {
        const query = `SELECT * FROM "Pathway" WHERE "pathwayID" = $1`;
        const result = await pool.query(query, [pathwayID]);
        return result.rows[0];
    }
    
    // Get all courses in a pathway
    static async getCourses(pathwayID) {
        const query = `
            SELECT c."title", c."category", c."level", c."outline"
            FROM "Course" c
            WHERE c."pathwayID" = $1
        `;
        const result = await pool.query(query, [pathwayID]);
        return result.rows;
    }

    // Update pathway
    static async update(pathwayID, updateData) {
        const allowedFields = ['name', 'outline', 'status'];
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

        values.push(pathwayID);

        const query = `
            UPDATE "Pathway"
            SET ${updates.join(', ')}
            WHERE "pathwayID" = $${paramCount}
            RETURNING "pathwayID", "name", "outline", "status", "createdDate"
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Get all pathways
    static async getAll(status = ['draft', 'wait_for_approval', 'active', 'inactive']) {
        const query = `SELECT * FROM "Pathway" 
        WHERE "status" = ANY($1)
        ORDER BY "createdDate" DESC`;
        const result = await pool.query(query, [status]);
        return result.rows;
    }
}

module.exports = Pathway;
