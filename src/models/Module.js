const { pool } = require('../config/database');

class Module {
    // Pathway to be added in Sprint 2
    static async create({ courseID, title, description, moduleNumber, expectedHours, status='draft' }, client = null) {
        const db = client || pool;
        const query = `
            INSERT INTO "Module" ("courseID", "title", "description", "moduleNumber", "expectedHours", "status", "created_at")
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING "moduleID", "courseID", "title", "description", "moduleNumber", "expectedHours", "status", "created_at"
        `;
        const result = await db.query(query, [courseID, title, description, moduleNumber, expectedHours, status]);
        return result.rows[0];
    }

    static async findByCourseId(courseID, client = null) {
        const db = client || pool;
        const query = 'SELECT * FROM "Module" WHERE "courseID" = $1';
        const result = await dvb.query(query, [courseID]);
        return result.rows;
    }

    static async findById(id, client = null) {
        const db = client || pool;
        const query = `
            SELECT * FROM "Module" WHERE "moduleID" = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async findByCourseIdModuleNumber(courseID, moduleNumber, client = null) {
        const db = client || pool;
        const query = `
            SELECT * FROM "Module" WHERE "courseID" = $1 AND "moduleNumber" = $2
        `;
        const result = await db.query(query, [courseID, moduleNumber]);
        return result.rows[0];
    }


    static async findByCourseOwner(userID, client = null) {
        const db = client || pool;
        const query = `
            SELECT m.*, c.title AS "courseTitle" , c.status AS "courseStatus" FROM "Module" m
            LEFT JOIN "Course" c ON m."courseID" = c."courseID"
            WHERE c."userID" = $1
        `;
        const result = await db.query(query, [userID]);
        return result.rows;
    }


    static async update(id, updateData, client = null) {
        const db = client || pool;
        const allowedFields = ['courseID', 'title', 'description', 'moduleNumber', 'expectedHours', 'status'];
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
            WHERE "moduleID" = $${paramCount}
            RETURNING "moduleID", "courseID", "title", "description", "moduleNumber", "expectedHours", "status", "updated_at"
        `;

        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async getAll(client = null) {
        const db = client || pool;
        const query = `
            SELECT * FROM "Module" ORDER BY "created_at" DESC
        `;
        const result = await db.query(query);
        return result.rows;
    }

}

module.exports = Module;
