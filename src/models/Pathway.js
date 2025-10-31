const { pool } = require('../config/database');

class Pathway {
    // Create new pathway
    static async create({ name, userID, outline, status = 'active' }) {
        const query = `
            INSERT INTO "tblPathway" ("name", "userID", "outline", "status", "createdDate")
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING *
        `;
        const result = await pool.query(query, [name, userID, outline, status]);
        return result.rows[0];
    }

    // Find pathway by ID
    static async findById(pathwayID) {
        const query = `SELECT * FROM "tblPathway" WHERE "pathwayID" = $1`;
        const result = await pool.query(query, [pathwayID]);
        return result.rows[0];
    }

    // Find pathway by User ID
    static async findByUserId(userID) {
        const query = `
            SELECT p.*, u."firstName", u."lastName"
            FROM "tblPathway" p
            LEFT JOIN "tblUser" u ON p."userID" = u."userID"
            WHERE p."userID" = $1
        `;
        const result = await pool.query(query, [userID]);
        return result.rows;
    }

    // Find pathways by status
    static async findByStatus(status) {
        const query = `SELECT * FROM "tblPathway" WHERE "status" = $1 ORDER BY "createdDate" DESC`;
        const result = await pool.query(query, [status]);
        return result.rows;
    }

    // Get detailed pathway
    static async getDetail(pathwayID) {
        const query = `SELECT * FROM "tblPathway" WHERE "pathwayID" = $1`;
        const result = await pool.query(query, [pathwayID]);
        return result.rows[0];
    }
    
    // Get all courses in a pathway
    static async getCourses(pathwayID) {
        const query = `
            SELECT c."title", c."category", c."level", c."outline"
            FROM "tblCourse" c
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
            UPDATE "tblPathway"
            SET ${updates.join(', ')}
            WHERE "pathwayID" = $${paramCount}
            RETURNING "pathwayID", "name", "outline", "status", "createdDate"
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Get all pathways
    static async getAll(status = ['draft', 'wait_for_approval', 'active', 'inactive']) {
        const query = `SELECT * FROM "tblPathway" 
        WHERE "status" = ANY($1)
        ORDER BY "createdDate" DESC`;
        const result = await pool.query(query, [status]);
        return result.rows;
    }
}

module.exports = Pathway;
